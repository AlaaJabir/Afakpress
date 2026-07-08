import { CmsProvincePage } from "@/components/PublicCmsViews";
import { moroccoRegions } from "@/data/morocco-regions";

export function generateStaticParams() {
  return moroccoRegions.flatMap((region) => region.provinces.map((province) => ({ slug: province.slug })));
}

export default async function ProvincePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CmsProvincePage slug={slug} />;
}

