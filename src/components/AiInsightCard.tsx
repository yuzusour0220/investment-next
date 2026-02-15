"use client";

import { AiInvestmentInsight } from "@/types/company";

type Props = {
  insight: AiInvestmentInsight | null;
  isLoading: boolean;
};

/**
 * AI分析結果コンポーネント（モック）
 * 財務指標判定の後段として、メタ分析と総合考察を表示する
 */
export default function AiInsightCard({ insight, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700">AIによる分析（モック）</h3>
        <p className="mt-3 text-sm text-slate-500">AIがメタ分析と総合考察を生成中です...</p>
      </section>
    );
  }

  if (!insight) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-700">AIによる分析（モック）</h3>

      {/* 財務指標全体を俯瞰したメタ分析 */}
      <div className="mt-4">
        <p className="text-xs font-medium tracking-wide text-slate-500">メタ分析</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{insight.metaAnalysis}</p>
      </div>

      {/* 投資判断に向けた総合考察 */}
      <div className="mt-4">
        <p className="text-xs font-medium tracking-wide text-slate-500">総合的な考察</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          {insight.overallConsideration}
        </p>
      </div>
    </section>
  );
}
