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
import { GuideCardLink } from "@/features/guide/components/GuidePageView";
import { guideLinks } from "@/features/guide/content";

const topShellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)] px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_38%,#020617_100%)] dark:text-slate-100 sm:px-6 lg:px-8";

export default function GuideTopPage() {
  return (
    <div className={topShellClassName}>
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 text-sm text-slate-600 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
          <span className="font-medium text-slate-900 dark:text-white">
            Guide
          </span>
          <span className="px-2 text-slate-400">/</span>
          <span>Overview</span>
        </div>

        <div className="mb-6 lg:hidden">
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
                <SheetTitle>Guide</SheetTitle>
                <SheetDescription>
                  ガイド全体の読み順と各ページへの導線です。
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <nav className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55">
                  <p className="px-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                    Guide
                  </p>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/guide"
                      aria-current="page"
                      className="block cursor-pointer rounded-xl bg-blue-50 px-3 py-2.5 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                    >
                      <p className="text-sm font-medium">Overview</p>
                      <p className="mt-1 text-xs leading-5 opacity-80">
                        読み順とガイド全体の入口を確認します。
                      </p>
                    </Link>
                    {guideLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block cursor-pointer rounded-xl px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                      >
                        <p className="text-sm font-medium">{link.label}</p>
                        <p className="mt-1 text-xs leading-5 opacity-80">
                          {link.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_220px]">
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <nav className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55">
              <p className="px-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                Guide
              </p>
              <div className="mt-3 space-y-1">
                <Link
                  href="/guide"
                  aria-current="page"
                  className="block cursor-pointer rounded-xl bg-blue-50 px-3 py-2.5 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
                >
                  <p className="text-sm font-medium">Overview</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">
                    読み順とガイド全体の入口を確認します。
                  </p>
                </Link>
                {guideLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block cursor-pointer rounded-xl px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  >
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">
                      {link.description}
                    </p>
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          <main className="min-w-0">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_30px_100px_-60px_rgba(15,23,42,0.3)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55 sm:p-8 lg:p-10">
              <p
                id="guide-overview"
                className="text-xs font-semibold tracking-[0.22em] text-blue-700 uppercase dark:text-blue-200"
              >
                Guide overview
              </p>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                LogFo を使うためのガイド
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                LogFo
                は、目標との差分を整理し、学習を続け、その積み上げを外部に伝わる形へまとめるためのプロダクトです。
                就活や転職の準備を進める人が、最初のロードマップ作成からポートフォリオ公開までつながりを持って進められるように、このガイドを用意しました。
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <p className="text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase dark:text-blue-200">
                    最初に理解できること
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-[15px]">
                    LogFo
                    では、差分を出す、継続する、証明する、の三段階をひとつの流れとして扱えます。最初はその流れを把握し、最初のロードマップを作ることが重要です。
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 dark:border-slate-800 dark:bg-slate-900/75">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                    Quick links
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <Link
                      href="/guide/getting-started"
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      初めて使う人向けの流れを見る
                    </Link>
                    <Link
                      href="/roadmap/generate"
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500/30 dark:hover:text-blue-200"
                    >
                      すぐにロードマップを作る
                    </Link>
                  </div>
                </div>
              </div>

              <section
                id="getting-started"
                className="mt-10 scroll-mt-28 border-t border-slate-200/80 pt-8 dark:border-slate-800"
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                      Getting started
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      最初の体験を一周する
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-[15px]">
                      初回は、ロードマップ生成を起点に、活動記録とポートフォリオまでのつながりを把握するのが最短です。
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <GuideCardLink link={guideLinks[0]} emphasized />
                </div>
              </section>

              <section
                id="function-guides"
                className="mt-10 scroll-mt-28 border-t border-slate-200/80 pt-8 dark:border-slate-800"
              >
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                  Function guides
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {guideLinks.slice(1).map((link) => (
                    <GuideCardLink key={link.href} link={link} />
                  ))}
                </div>
              </section>
            </div>
          </main>

          <aside className="hidden xl:sticky xl:top-24 xl:block xl:self-start">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/55">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                On this page
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href="#guide-overview"
                    className="cursor-pointer text-sm leading-6 text-blue-700 dark:text-blue-200"
                  >
                    Guide overview
                  </a>
                </li>
                <li>
                  <a
                    href="#getting-started"
                    className="cursor-pointer text-sm leading-6 text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-200"
                  >
                    Getting started
                  </a>
                </li>
                <li>
                  <a
                    href="#function-guides"
                    className="cursor-pointer text-sm leading-6 text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-200"
                  >
                    Function guides
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
