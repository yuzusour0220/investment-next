"use client";

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
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <h3 className="text-base font-semibold text-slate-700">AIによる分析</h3>
        <p className="mt-3 text-sm text-slate-500">
          AIがメタ分析と投資判断講評を生成中です...
        </p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-7">
        <h3 className="text-base font-semibold text-red-700">AIによる分析</h3>
        <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
      </section>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <h3 className="text-base font-semibold text-slate-700">AIによる分析</h3>

      {/* 外部環境トレンドを踏まえたメタ分析 */}
      <div className="mt-4">
        <p className="text-xs font-medium tracking-wide text-slate-500">AIメタ分析</p>
        <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <MarkdownPreview content={analysis.metaAnalysisText} />
        </div>
      </div>

      {/* 財務指標とメタ分析を統合した投資判断講評 */}
      <div className="mt-4">
        <p className="text-xs font-medium tracking-wide text-slate-500">
          投資判断講評
        </p>
        <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <MarkdownPreview content={analysis.investmentCommentaryText} />
        </div>
      </div>
    </section>
  );
}
