import { NextRequest, NextResponse } from "next/server";
import { buildInvestmentCommentaryPrompt, buildMetaAnalysisPrompt } from "@/lib/ai-prompts";
import { GeminiApiError, generateTextWithGemini } from "@/lib/gemini";
import { InvestmentResult, MetricEvaluation } from "@/types/company";

type AiAnalysisResponse = {
  metaAnalysisText: string;
  investmentCommentaryText: string;
};

function isMetricEvaluation(value: unknown): value is MetricEvaluation {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const v = value as Record<string, unknown>;
  const hasNullableNumber =
    v.value === null || (typeof v.value === "number" && Number.isFinite(v.value));

  return (
    typeof v.key === "string" &&
    typeof v.label === "string" &&
    typeof v.criterion === "string" &&
    typeof v.unit === "string" &&
    typeof v.passed === "boolean" &&
    hasNullableNumber
  );
}

function isInvestmentResult(value: unknown): value is InvestmentResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const v = value as Record<string, unknown>;
  const verdictOk = v.verdict === "◯" || v.verdict === "△" || v.verdict === "×";

  if (!verdictOk || typeof v.score !== "number") {
    return false;
  }

  if (typeof v.company !== "object" || v.company === null) {
    return false;
  }
  const company = v.company as Record<string, unknown>;
  const companyOk =
    typeof company.name === "string" &&
    typeof company.symbol === "string" &&
    typeof company.exchange === "string" &&
    typeof company.currency === "string";

  if (!companyOk) {
    return false;
  }

  if (!Array.isArray(v.evaluations)) {
    return false;
  }

  return v.evaluations.every(isMetricEvaluation);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "リクエストJSONの解析に失敗しました" },
      { status: 400 }
    );
  }

  if (!isInvestmentResult(body)) {
    return NextResponse.json(
      { message: "投資判定結果の形式が不正です" },
      { status: 400 }
    );
  }

  try {
    // 1段目: 外部環境に関するメタ分析を生成
    const metaAnalysisText = await generateTextWithGemini(
      buildMetaAnalysisPrompt(body.company.name)
    );

    // 2段目: 財務指標 + メタ分析を入力して投資判断講評を生成
    const investmentCommentaryText = await generateTextWithGemini(
      buildInvestmentCommentaryPrompt(body, metaAnalysisText)
    );

    const response: AiAnalysisResponse = {
      metaAnalysisText,
      investmentCommentaryText,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof GeminiApiError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "AI分析の生成に失敗しました", code: "unknown_error" },
      { status: 502 }
    );
  }
}
