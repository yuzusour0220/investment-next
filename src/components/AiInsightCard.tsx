"use client";

import { useState } from "react";
import { AiNarrativeAnalysis } from "@/types/company";
import MarkdownPreview from "@/components/MarkdownPreview";

type Props = {
  analysis: AiNarrativeAnalysis | null;
  isLoading: boolean;
  errorMessage: string;
};

/**
 * AI分析結果コンポーネント
 * 財務指標判定の後段として、メタ分析と投資判断講評を文章で表示する
 */
export default function AiInsightCard({
  analysis,
  isLoading,
  errorMessage,
}: Props) {
  // メタ分析と投資判断講評を同時表示せず、タブで切り替える
  const [activeTab, setActiveTab] = useState<"meta" | "commentary">("commentary");

  if (isLoading) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-[0_16px_40px_-24px_rgba(14,116,144,0.55)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-200/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-sky-200/35 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
            AI INSIGHT
          </span>
          <h3 className="mt-3 text-2xl font-bold text-slate-800">AIによる分析</h3>
          <p className="mt-2 text-base text-slate-600">
            AIがメタ分析と投資判断講評を生成中です...
          </p>
          {/* 待機中でも画面が寂しくならないよう、プレースホルダを表示する */}
          <div className="mt-6 space-y-3">
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200/80" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200/80" />
            <div className="h-4 w-3/5 animate-pulse rounded bg-slate-200/80" />
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-red-200/80 bg-gradient-to-br from-rose-50 via-white to-red-50 p-6 shadow-[0_16px_40px_-24px_rgba(220,38,38,0.45)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center rounded-full border border-red-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-red-700">
            AI ERROR
          </span>
          <h3 className="mt-3 text-2xl font-bold text-red-700">AIによる分析</h3>
          <p className="mt-2 text-base text-red-600">{errorMessage}</p>
        </div>
      </section>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-[0_16px_40px_-24px_rgba(14,116,144,0.55)] sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-200/35 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-sky-200/35 blur-2xl" />

      <div className="relative">
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
          AI INSIGHT
        </span>
        <h3 className="mt-3 text-2xl font-bold text-slate-800">AIによる分析</h3>
        <p className="mt-2 text-base text-slate-600">
          財務データと外部環境を合わせて、要点を読みやすく整理しています。
        </p>

        {/* 表示内容を切り替えるタブ */}
        <div className="mt-6 grid grid-cols-1 gap-2 rounded-xl border border-sky-100 bg-white/70 p-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab("meta")}
            aria-pressed={activeTab === "meta"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "meta"
                ? "bg-sky-100 text-sky-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            AIメタ分析
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commentary")}
            aria-pressed={activeTab === "commentary"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "commentary"
                ? "bg-emerald-100 text-emerald-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            投資判断講評
          </button>
        </div>

        {activeTab === "meta" ? (
          // 外部環境トレンドを踏まえたメタ分析
          <article className="mt-5 rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                AIメタ分析
              </p>
              <span className="text-xs font-medium tracking-wide text-slate-400">
                MARKET CONTEXT
              </span>
            </div>
            <div className="mt-4">
              <MarkdownPreview content={analysis.metaAnalysisText} />
            </div>
          </article>
        ) : (
          // 財務指標とメタ分析を統合した投資判断講評
          <article className="mt-5 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                投資判断講評
              </p>
              <span className="text-xs font-medium tracking-wide text-slate-400">
                FINAL VIEW
              </span>
            </div>
            <div className="mt-4">
              <MarkdownPreview content={analysis.investmentCommentaryText} />
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
