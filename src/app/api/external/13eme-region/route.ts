import { NextResponse } from "next/server";
import { fetchThirteenthRegionArticles } from "@/lib/thirteenth-region";

export const revalidate = 300;

export async function GET() {
  const articles = await fetchThirteenthRegionArticles();
  return NextResponse.json(
    {
      source: "https://13emeregion.vercel.app/",
      count: articles.length,
      articles,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
