import { GuidePageView } from "@/features/guide/components/GuidePageView";
import { guidePageContents } from "@/features/guide/content";

export default function GettingStartedGuidePage() {
  return <GuidePageView content={guidePageContents["getting-started"]} />;
}
