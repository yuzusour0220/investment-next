"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  AiInvestmentInsight,
  Company,
  FinancialMetrics,
  InvestmentResult as ResultType,
} from "@/types/company";
import { evaluate } from "@/lib/evaluate";
import { generateMockAiInsight } from "@/lib/mock-ai-insight";
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
  // AI分析結果（モック）
  const [aiInsight, setAiInsight] = useState<AiInvestmentInsight | null>(null);
  // AI分析中フラグ
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  // 最新リクエスト判定用ID（古い非同期結果の反映を防ぐ）
  const aiRequestIdRef = useRef(0);

  // 会社が選択されたときのハンドラ（まだ判定はしない）
  function handleSelect(company: Company | null) {
    aiRequestIdRef.current += 1; // 会社切り替え時に古いAI分析結果を無効化する
    setSelectedCompany(company);
    setResult(null); // 前回の結果をクリア
    setAiInsight(null); // 前回のAI分析をクリア
    setIsAiAnalyzing(false); // AI分析中表示もリセット
    setErrorMessage(""); // 前回エラーメッセージをクリア
  }

  // 財務判定結果を使ってAI分析（モック）を生成する
  async function runMockAiAnalysis(evaluated: ResultType) {
    const requestId = ++aiRequestIdRef.current;
    setAiInsight(null);
    setIsAiAnalyzing(true);

    try {
      const insight = await generateMockAiInsight(evaluated);
      if (requestId !== aiRequestIdRef.current) {
        return;
      }
      setAiInsight(insight);
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
    setAiInsight(null);
    setIsAiAnalyzing(false);

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
      void runMockAiAnalysis(evaluated);
    } catch {
      setResult(null);
      setErrorMessage("通信エラーが発生しました。時間をおいて再試行してください。");
    } finally {
      setIsEvaluating(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-16">
      {/* アプリロゴ */}
      <Image
        src="/logo.png"
        alt="投資判断アプリのロゴ"
        width={72}
        height={72}
        className="mb-3 h-auto w-16 rounded-xl shadow-sm sm:w-[72px]"
      />

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
          <div className="w-full max-w-md space-y-6">
            <InvestmentResult result={result} />
            <AiInsightCard insight={aiInsight} isLoading={isAiAnalyzing} />
          </div>
        </div>
      )}
    </div>
  );
}
