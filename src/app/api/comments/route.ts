import { NextRequest, NextResponse } from "next/server";
import {
  createPublicComment,
  getCommentsSummary,
  listCommentsForArticle,
} from "@/lib/comments-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId")?.trim();
  const summaryParam = req.nextUrl.searchParams.get("summary");

  if (summaryParam === "1" || !articleId) {
    const idsParam = req.nextUrl.searchParams.get("articleIds");
    const articleIds = idsParam
      ? idsParam
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;
    const summary = await getCommentsSummary(articleIds);
    return NextResponse.json(summary);
  }

  const comments = await listCommentsForArticle(articleId);
  return NextResponse.json({
    articleId,
    count: comments.length,
    comments,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createPublicComment({
      articleId: typeof body?.articleId === "string" ? body.articleId : "",
      articleTitle: typeof body?.articleTitle === "string" ? body.articleTitle : "",
      author: typeof body?.author === "string" ? body.author : "",
      email: typeof body?.email === "string" ? body.email : "",
      content: typeof body?.content === "string" ? body.content : "",
    });

    if (result.error || !result.comment) {
      return NextResponse.json(
        { error: result.error || "تعذر إرسال التعليق." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { comment: result.comment, status: "published" },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "بيانات الطلب غير صالحة." },
      { status: 400 },
    );
  }
}
