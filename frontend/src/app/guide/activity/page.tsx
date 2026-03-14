import { GuidePageView } from "@/features/guide/components/GuidePageView";
import { guidePageContents } from "@/features/guide/content";

export default function ActivityGuidePage() {
  return <GuidePageView content={guidePageContents.activity} />;
}
