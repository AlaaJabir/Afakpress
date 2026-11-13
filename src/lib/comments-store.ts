import { promises as fs } from "node:fs";
import path from "node:path";
import { createServerSupabaseClient, createServiceSupabaseAdminClient } from "@/lib/supabase";
import { isValidUuid, makeUuid } from "@/lib/uuid";

export type PublicComment = {
  id: string;
  articleId: string;
  articleTitle?: string;
  author: string;
  content: string;
  status: "Approved" | "Pending";
  createdAt: string;
};

type StoredComment = PublicComment & {
  email?: string;
};

const STORE_FILE = path.join("/tmp", "afakpress-comments-v1.json");
const SETTINGS_KEY = "public_comments_store";

declare global {
  var __afakpressMemoryComments: StoredComment[] | undefined;
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function readLocalStore(): Promise<StoredComment[]> {
  if (Array.isArray(globalThis.__afakpressMemoryComments)) {
    return globalThis.__afakpressMemoryComments;
  }
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      globalThis.__afakpressMemoryComments = parsed;
      return parsed;
    }
  } catch {
    // Store not created yet
  }
  globalThis.__afakpressMemoryComments = [];
  return [];
}

async function writeLocalStore(comments: StoredComment[]): Promise<void> {
  globalThis.__afakpressMemoryComments = comments;
  try {
    await fs.writeFile(STORE_FILE, JSON.stringify(comments, null, 2), "utf8");
  } catch {
    // Non-writable filesystem fallback keeps memory cache active
  }
}

async function readSettingsComments(): Promise<StoredComment[]> {
  const supabase = createServiceSupabaseAdminClient() ?? createServerSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    const row = data as { value?: unknown } | null;
    if (error || !row?.value || !Array.isArray(row.value)) return [];
    return (row.value as unknown as StoredComment[]).filter(
      (item) => item && typeof item.id === "string" && typeof item.content === "string",
    );
  } catch {
    return [];
  }
}

async function writeSettingsComment(comment: StoredComment): Promise<boolean> {
  const admin = createServiceSupabaseAdminClient();
  if (!admin) return false;

  try {
    const existing = await readSettingsComments();
    const updated = [comment, ...existing.filter((item) => item.id !== comment.id)].slice(0, 500);
    const { error } = await admin
      .from("settings")
      .upsert(
        { key: SETTINGS_KEY, value: updated as unknown as Record<string, unknown>[] },
        { onConflict: "key" },
      );
    return !error;
  } catch {
    return false;
  }
}

function toPublicComment(comment: StoredComment): PublicComment {
  return {
    id: comment.id,
    articleId: comment.articleId,
    articleTitle: comment.articleTitle,
    author: comment.author,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt,
  };
}

export async function listCommentsForArticle(articleId: string): Promise<PublicComment[]> {
  const cleanId = sanitizeText(articleId, 180);
  if (!cleanId) return [];

  const merged = new Map<string, PublicComment>();

  const supabase = createServiceSupabaseAdminClient() ?? createServerSupabaseClient();
  if (supabase && isValidUuid(cleanId)) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id,article_id,author,content,status,created_at")
        .eq("article_id", cleanId)
        .in("status", ["approved", "Approved"])
        .order("created_at", { ascending: false });

      const rows = data as Array<{
        id: string;
        article_id: string | null;
        author: string | null;
        content: string | null;
        created_at: string | null;
      }> | null;

      if (!error && Array.isArray(rows)) {
        for (const row of rows) {
          merged.set(row.id, {
            id: row.id,
            articleId: row.article_id ?? cleanId,
            author: row.author || "قارئ آفاق بريس",
            content: row.content ?? "",
            status: "Approved",
            createdAt: row.created_at ?? new Date().toISOString(),
          });
        }
      }
    } catch {
      // Continue to fallback stores
    }
  }

  const settingsComments = await readSettingsComments();
  for (const item of settingsComments) {
    if (item.articleId === cleanId && item.status === "Approved") {
      merged.set(item.id, toPublicComment(item));
    }
  }

  const localComments = await readLocalStore();
  for (const item of localComments) {
    if (item.articleId === cleanId && item.status === "Approved") {
      merged.set(item.id, toPublicComment(item));
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCommentsSummary(articleIds?: string[]): Promise<{
  counts: Record<string, number>;
  recentByArticle: Record<string, PublicComment[]>;
  recent: PublicComment[];
}> {
  const all = new Map<string, PublicComment>();

  const supabase = createServiceSupabaseAdminClient() ?? createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id,article_id,author,content,status,created_at")
        .in("status", ["approved", "Approved"])
        .order("created_at", { ascending: false })
        .limit(100);

      const rows = data as Array<{
        id: string;
        article_id: string | null;
        author: string | null;
        content: string | null;
        created_at: string | null;
      }> | null;

      if (!error && Array.isArray(rows)) {
        for (const row of rows) {
          if (!row.article_id || !row.content) continue;
          all.set(row.id, {
            id: row.id,
            articleId: row.article_id,
            author: row.author || "قارئ آفاق بريس",
            content: row.content,
            status: "Approved",
            createdAt: row.created_at ?? new Date().toISOString(),
          });
        }
      }
    } catch {
      // Continue to fallback stores
    }
  }

  for (const item of await readSettingsComments()) {
    if (item.status === "Approved") all.set(item.id, toPublicComment(item));
  }

  for (const item of await readLocalStore()) {
    if (item.status === "Approved") all.set(item.id, toPublicComment(item));
  }

  const sorted = Array.from(all.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const filterSet = articleIds && articleIds.length > 0 ? new Set(articleIds) : null;

  const counts: Record<string, number> = {};
  const recentByArticle: Record<string, PublicComment[]> = {};

  for (const comment of sorted) {
    if (filterSet && !filterSet.has(comment.articleId)) continue;
    counts[comment.articleId] = (counts[comment.articleId] ?? 0) + 1;
    if (!recentByArticle[comment.articleId]) {
      recentByArticle[comment.articleId] = [];
    }
    if (recentByArticle[comment.articleId].length < 3) {
      recentByArticle[comment.articleId].push(comment);
    }
  }

  return {
    counts,
    recentByArticle,
    recent: sorted.slice(0, 10),
  };
}

export async function createPublicComment(input: {
  articleId: string;
  articleTitle?: string;
  author: string;
  email?: string;
  content: string;
}): Promise<{ comment?: PublicComment; error?: string }> {
  const articleId = sanitizeText(input.articleId, 180);
  const articleTitle = sanitizeText(input.articleTitle, 240);
  const author = sanitizeText(input.author, 80);
  const email = sanitizeText(input.email, 120);
  const content = sanitizeText(input.content, 1500);

  if (!articleId) return { error: "معرف المقال غير صالح." };
  if (author.length < 2) return { error: "يرجى إدخال اسمك (حرفان على الأقل)." };
  if (content.length < 3) return { error: "يرجى كتابة تعليق واضح قبل الإرسال." };

  const newComment: StoredComment = {
    id: makeUuid(),
    articleId,
    articleTitle: articleTitle || undefined,
    author,
    email: email || undefined,
    content,
    status: "Approved",
    createdAt: new Date().toISOString(),
  };

  const admin = createServiceSupabaseAdminClient();
  let persistedToDb = false;

  if (admin && isValidUuid(articleId)) {
    try {
      const { data: articleExists } = await admin
        .from("articles")
        .select("id")
        .eq("id", articleId)
        .maybeSingle();

      if (articleExists) {
        const { data, error } = await admin
          .from("comments")
          .insert({
            id: newComment.id,
            article_id: articleId,
            author: newComment.author,
            email: newComment.email ?? null,
            content: newComment.content,
            status: "approved",
          })
          .select("id,article_id,author,content,status,created_at")
          .single();

        if (!error && data) {
          persistedToDb = true;
          newComment.createdAt = data.created_at ?? newComment.createdAt;
        }
      }
    } catch {
      // Fallback to settings / local store
    }
  }

  if (!persistedToDb && admin) {
    persistedToDb = await writeSettingsComment(newComment);
  }

  const localComments = await readLocalStore();
  await writeLocalStore([newComment, ...localComments.filter((item) => item.id !== newComment.id)].slice(0, 500));

  return { comment: toPublicComment(newComment) };
}
