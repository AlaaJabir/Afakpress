import { CmsRegionPage } from "@/components/PublicCmsViews";
import { moroccoRegions } from "@/data/morocco-regions";

export function generateStaticParams() {
  return moroccoRegions.map((region) => ({ slug: region.slug }));
}

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CmsRegionPage slug={slug} />;
}

