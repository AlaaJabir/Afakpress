import { NextResponse } from "next/server";
import { fetchThirteenthRegionArticles } from "@/lib/thirteenth-region";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await fetchThirteenthRegionArticles();
  return NextResponse.json({
    source: "https://13emeregion.vercel.app/",
    count: articles.length,
    articles,
  });
}
