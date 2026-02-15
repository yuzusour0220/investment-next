"use client";

import { useState } from "react";
import {
  Company,
  FinancialMetrics,
  InvestmentResult as ResultType,
} from "@/types/company";
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
  // 判定処理の実行状態（API呼び出し中）
  const [isEvaluating, setIsEvaluating] = useState(false);
  // API失敗時のメッセージ
  const [errorMessage, setErrorMessage] = useState("");

  // 会社が選択されたときのハンドラ（まだ判定はしない）
  function handleSelect(company: Company | null) {
    setSelectedCompany(company);
    setResult(null); // 前回の結果をクリア
    setErrorMessage(""); // 前回エラーメッセージをクリア
  }

  // 「判定する」ボタン押下時に判定を実行
  async function handleEvaluate() {
    if (!selectedCompany) return;
    setIsEvaluating(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/fmp/metrics?symbol=${encodeURIComponent(selectedCompany.symbol)}`
      );
      const body = (await res.json()) as FinancialMetrics | { message?: string };
      if (!res.ok) {
        setResult(null);
        setErrorMessage(
          "message" in body && body.message
            ? body.message
            : "財務指標の取得に失敗しました"
        );
        return;
      }

      const evaluated = evaluate(selectedCompany, body as FinancialMetrics);
      setResult(evaluated);
    } catch {
      setResult(null);
      setErrorMessage("通信エラーが発生しました。時間をおいて再試行してください。");
    } finally {
      setIsEvaluating(false);
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
          disabled={isEvaluating}
          isLoading={isEvaluating}
        />
      )}

      {/* エラー表示 */}
      {errorMessage && (
        <p className="mt-4 text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
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
