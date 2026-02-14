"use client";

import { useState } from "react";
import { Company, InvestmentResult as ResultType } from "@/types/company";
import { mockMetrics } from "@/data/mock-metrics";
import { evaluate } from "@/lib/evaluate";
import CompanySearch from "@/components/CompanySearch";
import InvestmentResult from "@/components/InvestmentResult";

/**
 * トップページ
 * 1. 会社検索コンポーネントで企業を選択
 * 2. 選択された企業のモックデータで投資判定を実行
 * 3. 結果を表示
 */
export default function Home() {
  // 投資判定の結果を保持するstate（未選択時はnull）
  const [result, setResult] = useState<ResultType | null>(null);

  // 会社が選択されたときのハンドラ
  function handleSelect(company: Company) {
    const metrics = mockMetrics[company.id];
    if (metrics) {
      // モックデータから財務指標を取得して判定を実行
      const evaluated = evaluate(company, metrics);
      setResult(evaluated);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-16">
      {/* アプリタイトル */}
      <h1 className="text-2xl font-bold text-slate-800 mb-2">投資判断アプリ</h1>
      <p className="text-sm text-slate-500 mb-8">
        会社名を入力して、投資判断の参考にしましょう
      </p>

      {/* 会社検索 */}
      <CompanySearch onSelect={handleSelect} />

      {/* 判定結果（会社選択後に表示） */}
      {result && (
        <div className="mt-8 w-full flex justify-center">
          <InvestmentResult result={result} />
        </div>
      )}
    </div>
  );
}
