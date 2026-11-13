"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import type { PublicComment } from "@/lib/comments-store";

const AVATAR_TONES = ["bg-[#0f172a]", "bg-[#1b5e73]", "bg-[#d9a01c]"];

function formatCommentDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("ar-MA-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function avatarInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "ق";
  return trimmed.slice(0, 1);
}

export function ArticleComments({
  articleId,
  articleTitle,
  compact = false,
  onCountChange,
}: {
  articleId: string;
  articleTitle?: string;
  compact?: boolean;
  onCountChange?: (count: number) => void;
}) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    const loadComments = async () => {
      try {
        const res = await fetch(`/api/comments?articleId=${encodeURIComponent(articleId)}`);
        const data = res.ok ? await res.json() : { comments: [] };
        if (!active) return;
        const list = Array.isArray(data?.comments) ? (data.comments as PublicComment[]) : [];
        setComments(list);
        onCountChange?.(list.length);
      } catch {
        if (!active) return;
        setComments([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadComments();

    return () => {
      active = false;
    };
  }, [articleId, onCountChange]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          articleTitle,
          author,
          email,
          content,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.comment) {
        setFeedback({
          type: "error",
          text: payload?.error || "تعذر إرسال التعليق، يرجى المحاولة مجدداً.",
        });
        return;
      }

      const created = payload.comment as PublicComment;
      setComments((prev) => {
        const next = [created, ...prev.filter((item) => item.id !== created.id)];
        onCountChange?.(next.length);
        return next;
      });
      setAuthor("");
      setEmail("");
      setContent("");
      setFeedback({ type: "success", text: "تم نشر تعليقك بنجاح." });
    } catch {
      setFeedback({ type: "error", text: "حدث خطأ في الاتصال بالخادم." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id={compact ? undefined : "comments"}
      dir="rtl"
      className={
        compact
          ? "mt-4 rounded-xl border border-slate-200/90 bg-white p-4 text-right"
          : "mt-12 border-t-2 border-slate-200/80 pt-8 text-right"
      }
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-red-700" aria-hidden="true" />
          <h3 className={compact ? "text-sm font-black text-slate-900" : "text-xl font-black text-slate-950"}>
            تعليقات القراء
          </h3>
          <span className="text-xs font-bold text-slate-500 tabular-nums">({comments.length})</span>
        </div>
      </div>

      {/* Real Comment Submission Form */}
      <form onSubmit={handleSubmit} className={compact ? "mt-3 space-y-2.5" : "mt-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4"}>
        <div className={compact ? "grid gap-2.5 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الاسم الكامل *
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="مثال: محمد الإدريسي"
              className="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              البريد الإلكتروني (اختياري)
            </label>
            <input
              type="email"
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-xs sm:text-sm text-right text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            التعليق *
          </label>
          <textarea
            required
            minLength={3}
            maxLength={1500}
            rows={compact ? 2 : 3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="شارك القراء رأيك حول الموضوع..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b1930] px-4 py-2 text-xs sm:text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-60 cursor-pointer"
          >
            <Send className="size-3.5" aria-hidden="true" />
            <span>{submitting ? "جاري النشر..." : "نشر التعليق"}</span>
          </button>

          {feedback ? (
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                feedback.type === "success" ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          ) : null}
        </div>
      </form>

      {/* Real Comments List */}
      <div className="mt-5 space-y-4">
        {loading ? (
          <p className="text-xs font-medium text-slate-400">جاري تحميل التعليقات...</p>
        ) : comments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300/90 bg-slate-50/50 px-4 py-4 text-xs sm:text-sm text-slate-500">
            لا توجد تعليقات بعد. كن أول من يشارك برأيه.
          </p>
        ) : (
          comments.map((comment, idx) => (
            <article
              key={comment.id}
              className="border-t border-slate-200/80 pt-4 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
                    AVATAR_TONES[idx % AVATAR_TONES.length]
                  }`}
                >
                  {avatarInitial(comment.author)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {comment.author}
                  </p>
                  <time
                    dateTime={comment.createdAt}
                    className="block text-[11px] font-medium text-slate-400 tabular-nums"
                  >
                    {formatCommentDate(comment.createdAt)}
                  </time>
                </div>
              </div>
              <p className="mt-2.5 pr-10 text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {comment.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
