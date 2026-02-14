"use client";

import { useState } from "react";
import { Company, InvestmentResult as ResultType } from "@/types/company";
import { mockMetrics } from "@/data/mock-metrics";
import { evaluate } from "@/lib/evaluate";
import CompanySearch from "@/components/CompanySearch";
import EvaluateButton from "@/components/EvaluateButton";
import InvestmentResult from "@/components/InvestmentResult";

/**
 * トップページ
 * 1. 会社検索コンポーネントで企業を選択
 * 2. 「判定する」ボタンを押す
 * 3. 結果を表示
 */
export default function Home() {
  // 選択中の会社（検索で選んだが、まだ判定前）
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  // 投資判定の結果（判定ボタン押下後に表示）
  const [result, setResult] = useState<ResultType | null>(null);

  // 会社が選択されたときのハンドラ（まだ判定はしない）
  function handleSelect(company: Company) {
    setSelectedCompany(company);
    setResult(null); // 前回の結果をクリア
  }

  // 「判定する」ボタン押下時に判定を実行
  function handleEvaluate() {
    if (!selectedCompany) return;
    const metrics = mockMetrics[selectedCompany.id];
    if (metrics) {
      const evaluated = evaluate(selectedCompany, metrics);
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

      {/* 判定ボタン（会社選択後、結果表示前に表示） */}
      {selectedCompany && !result && (
        <EvaluateButton
          companyName={selectedCompany.name}
          onClick={handleEvaluate}
        />
      )}

      {/* 判定結果（ボタン押下後に表示） */}
      {result && (
        <div className="mt-8 w-full flex justify-center">
          <InvestmentResult result={result} />
        </div>
      )}
    </div>
  );
}
