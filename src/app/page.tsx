"use client";

import { useRef, useState } from "react";
import {
  AiNarrativeAnalysis,
  Company,
  FinancialMetrics,
  InvestmentResult as ResultType,
} from "@/types/company";
import { evaluate } from "@/lib/evaluate";
import CompanySearch from "@/components/CompanySearch";
import EvaluateButton from "@/components/EvaluateButton";
import AiInsightCard from "@/components/AiInsightCard";
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
  // AI分析結果（文章出力）
  const [aiNarrative, setAiNarrative] = useState<AiNarrativeAnalysis | null>(null);
  // AI分析中フラグ
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  // AI分析失敗時のメッセージ
  const [aiErrorMessage, setAiErrorMessage] = useState("");
  // 最新リクエスト判定用ID（古い非同期結果の反映を防ぐ）
  const aiRequestIdRef = useRef(0);

  // 会社が選択されたときのハンドラ（まだ判定はしない）
  function handleSelect(company: Company | null) {
    aiRequestIdRef.current += 1; // 会社切り替え時に古いAI分析結果を無効化する
    setSelectedCompany(company);
    setResult(null); // 前回の結果をクリア
    setAiNarrative(null); // 前回のAI分析をクリア
    setIsAiAnalyzing(false); // AI分析中表示もリセット
    setAiErrorMessage(""); // 前回のAIエラーをクリア
    setErrorMessage(""); // 前回エラーメッセージをクリア
  }

  // 財務判定結果を使ってAI分析APIを呼び出す
  async function runAiAnalysis(evaluated: ResultType) {
    const requestId = ++aiRequestIdRef.current;
    setAiNarrative(null);
    setIsAiAnalyzing(true);
    setAiErrorMessage("");

    try {
      const res = await fetch("/api/ai/investment-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluated),
      });

      const body = (await res.json()) as
        | AiNarrativeAnalysis
        | { message?: string };

      if (requestId !== aiRequestIdRef.current) {
        return;
      }

      if (!res.ok) {
        setAiNarrative(null);
        setAiErrorMessage(
          "message" in body && body.message
            ? body.message
            : "AI分析の生成に失敗しました"
        );
        return;
      }

      setAiNarrative(body as AiNarrativeAnalysis);
    } catch {
      if (requestId !== aiRequestIdRef.current) {
        return;
      }
      setAiNarrative(null);
      setAiErrorMessage("AI分析の通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      if (requestId === aiRequestIdRef.current) {
        setIsAiAnalyzing(false);
      }
    }
  }

  // 「判定する」ボタン押下時に判定を実行
  async function handleEvaluate() {
    if (!selectedCompany) return;
    aiRequestIdRef.current += 1; // 新しい判定開始時に古いAI分析結果を無効化する
    setIsEvaluating(true);
    setErrorMessage("");
    setAiNarrative(null);
    setIsAiAnalyzing(false);
    setAiErrorMessage("");

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
      void runAiAnalysis(evaluated);
    } catch {
      setResult(null);
      setErrorMessage("通信エラーが発生しました。時間をおいて再試行してください。");
    } finally {
      setIsEvaluating(false);
    }
  }

  // 財務指標は再取得せず、現在の判定結果を使ってAI分析のみ再生成する
  function handleRegenerateAi() {
    if (!result || isAiAnalyzing) return;
    void runAiAnalysis(result);
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <main className="mx-auto w-full max-w-6xl">
        {/* ヘッダーと検索導線を1つのカードにまとめて、横幅を活かしやすくする */}
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* アプリタイトル */}
              <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
                投資判断アプリ
              </h1>
              <p className="mt-1 text-base text-slate-500 sm:text-lg">
                会社名を入力して、投資判断の参考にしましょう
              </p>
            </div>
          </div>

          {/* 会社検索 */}
          <div className="mt-6">
            <CompanySearch onSelect={handleSelect} />
          </div>

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
            <p className="mt-4 text-base text-red-500" role="alert">
              {errorMessage}
            </p>
          )}
        </section>

        {/* 判定結果（ボタン押下後に表示） */}
        {result && (
          <section className="mt-8 space-y-6">
            <InvestmentResult result={result} />

            {/* AI出力だけを再生成するボタン（財務指標APIは再実行しない） */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRegenerateAi}
                disabled={isAiAnalyzing}
                className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
              >
                {isAiAnalyzing ? "AIを再生成中..." : "AIの出力を再生成"}
              </button>
            </div>

            <AiInsightCard
              analysis={aiNarrative}
              isLoading={isAiAnalyzing}
              errorMessage={aiErrorMessage}
            />
          </section>
        )}
      </main>
    </div>
  );
}
