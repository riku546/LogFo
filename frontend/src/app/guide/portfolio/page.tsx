import { GuidePageView } from "@/features/guide/components/GuidePageView";
import { guidePageContents } from "@/features/guide/content";

export default function PortfolioGuidePage() {
  return <GuidePageView content={guidePageContents.portfolio} />;
}
