import { GuidePageView } from "@/features/guide/components/GuidePageView";
import { guidePageContents } from "@/features/guide/content";

export default function RoadmapGuidePage() {
  return <GuidePageView content={guidePageContents.roadmap} />;
}
