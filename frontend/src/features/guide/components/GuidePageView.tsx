import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  type GuideLink,
  type GuidePageContent,
  type GuideSection,
  type GuideStep,
  guideLinks,
} from "@/features/guide/content";

interface GuidePageViewProps {
  content: GuidePageContent;
}

const shellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)] px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_38%,#020617_100%)] dark:text-slate-100 sm:px-6 lg:px-8";

const GuideStepCard = ({ step, index }: { step: GuideStep; index: number }) => {
  return (
    <li className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:grid-cols-[auto_1fr]">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {index + 1}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white sm:text-[15px]">
          {step.title}
        </p>
        <p className="mt-2 text-xs font-medium tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
          {step.location}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]">
          {step.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {step.href ? (
            <Link
              href={step.href}
              className="inline-flex cursor-pointer items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/20"
            >
              {step.hrefLabel ?? "対象ページへ移動"}
            </Link>
          ) : null}
          <span className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            左の Guide ナビからもこのページへ移動できます。
          </span>
        </div>
      </div>
    </li>
  );
};

/**
 * Usage:
 * <GuidePageView content={guidePageContents.roadmap} />
 */
const GuideSectionBody = ({ section }: { section: GuideSection }) => {
  if (section.variant === "steps") {
    return (
      <div className="space-y-4">
        {section.body.length > 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            {section.body.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
        <ol className="space-y-4">
          {section.steps?.map((step, index) => (
            <GuideStepCard key={step.title} step={step} index={index} />
          ))}
        </ol>
      </div>
    );
  }

  if (section.variant === "callout") {
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-5 dark:border-amber-400/20 dark:bg-amber-500/10">
        <div className="space-y-3">
          {section.body.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-[15px]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {section.body.map((paragraph) => (
        <p
          key={paragraph}
          className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
};

/**
 * Usage:
 * <GuideCardLink link={guideLinks[0]} />
 */
export const GuideCardLink = ({
  link,
  emphasized = false,
  direction = "next",
}: {
  link: GuideLink;
  emphasized?: boolean;
  direction?: "prev" | "next";
}) => {
  return (
    <Link
      href={link.href}
      className={`group block cursor-pointer rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
        emphasized
          ? "border-blue-200/80 bg-linear-to-br from-white to-blue-50 p-6 shadow-[0_20px_80px_-40px_rgba(37,99,235,0.45)] hover:from-white hover:to-blue-100 dark:border-blue-500/30 dark:from-slate-950 dark:to-blue-950/30 dark:hover:from-slate-950 dark:hover:to-blue-900/40"
          : "border-slate-200/80 bg-white/75 p-5 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/45 dark:hover:border-slate-700 dark:hover:bg-slate-900/80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-200 sm:text-lg">
            {link.label}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {link.description}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:group-hover:border-blue-500/30 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-200">
          {direction === "prev" ? "←" : "→"}
        </span>
      </div>
    </Link>
  );
};

const GuideSideNav = ({
  currentSlug,
}: {
  currentSlug: GuidePageContent["slug"];
}) => {
  return (
    <nav
      aria-label="ガイドナビゲーション"
      className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55"
    >
      <p className="px-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
        Guide
      </p>
      <div className="mt-3 space-y-1">
        <Link
          href="/guide"
          className="block cursor-pointer rounded-xl px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <p className="text-sm font-medium">Overview</p>
          <p className="mt-1 text-xs leading-5 opacity-80">
            読み順とガイド全体の入口を確認します。
          </p>
        </Link>
        {guideLinks.map((link) => {
          const isActive = link.href.endsWith(currentSlug);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`block cursor-pointer rounded-xl px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              }`}
            >
              <p className="text-sm font-medium">{link.label}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">
                {link.description}
              </p>
            </Link>
          );
        })}
      </div>
      <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/80">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
          Recommended flow
        </p>
        <ol className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>1. Getting Started</li>
          <li>2. ロードマップ作成</li>
          <li>3. 活動記録</li>
          <li>4. ポートフォリオ作成・共有</li>
        </ol>
      </div>
    </nav>
  );
};

const GuideNavDrawer = ({
  currentSlug,
  title,
}: {
  currentSlug: GuidePageContent["slug"];
  title: string;
}) => {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55"
            aria-label="ガイドナビゲーションを開く"
          >
            <MenuIcon />
            Guide navigation
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[88vw] max-w-sm border-r border-slate-200 bg-white/95 p-0 text-slate-900 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100"
        >
          <SheetHeader className="border-b border-slate-200 dark:border-slate-800">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              ガイド全体の導線をここから切り替えられます。
            </SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <GuideSideNav currentSlug={currentSlug} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const GuideToc = ({ content }: { content: GuidePageContent }) => {
  return (
    <aside
      aria-label="このページの目次"
      className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55"
    >
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
        On this page
      </p>
      <ul className="mt-4 space-y-2">
        {content.sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="cursor-pointer text-sm leading-6 text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-200"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const GuidePager = ({ content }: { content: GuidePageContent }) => {
  return (
    <div className="grid gap-4 border-t border-slate-200/80 pt-8 dark:border-slate-800 sm:grid-cols-2">
      {content.prevLink ? (
        <GuideCardLink link={content.prevLink} direction="prev" />
      ) : (
        <div className="hidden sm:block" />
      )}
      <GuideCardLink link={content.nextLink} emphasized direction="next" />
    </div>
  );
};

/**
 * ガイド本文を表示する共通ビューです。
 */
export const GuidePageView = ({ content }: GuidePageViewProps) => {
  return (
    <div className={shellClassName}>
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 text-sm text-slate-600 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
          <span className="font-medium text-slate-900 dark:text-white">
            Guide
          </span>
          <span className="px-2 text-slate-400">/</span>
          <span>{content.title}</span>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <GuideNavDrawer currentSlug={content.slug} title={content.title} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_220px]">
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <GuideSideNav currentSlug={content.slug} />
          </div>

          <main id="main-content" className="min-w-0">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_30px_100px_-60px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold tracking-[0.22em] text-blue-700 uppercase dark:text-blue-200">
                {content.shortLabel}
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {content.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                {content.description}
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <p className="text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase dark:text-blue-200">
                    この章でできるようになること
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-[15px]">
                    {content.goal}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 dark:border-slate-800 dark:bg-slate-900/75">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                    Quick summary
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {content.summary}
                  </p>
                </div>
              </div>

              <div className="mt-10 xl:hidden">
                <GuideToc content={content} />
              </div>

              <div className="mt-10 space-y-10">
                {content.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 border-t border-slate-200/80 pt-8 first:border-t-0 first:pt-0 dark:border-slate-800"
                  >
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {section.title}
                    </h2>
                    <div className="mt-5">
                      <GuideSectionBody section={section} />
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-12">
                <GuidePager content={content} />
              </div>
            </div>
          </main>

          <div className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
            <GuideToc content={content} />
          </div>
        </div>
      </div>
    </div>
  );
};
