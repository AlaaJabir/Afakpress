import { CmsCommunePage } from "@/components/PublicCmsViews";
import { moroccoRegions } from "@/data/morocco-regions";

export function generateStaticParams() {
  return moroccoRegions.flatMap((region) => region.provinces.flatMap((province) => province.communes.map((commune) => ({ slug: commune.slug }))));
}

export default async function CommunePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CmsCommunePage slug={slug} />;
}

