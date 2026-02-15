import { AiInvestmentInsight, InvestmentResult } from "@/types/company";

const WAIT_MS = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMetaAnalysis(result: InvestmentResult): string {
  // スコア帯に応じて、財務健全性の全体傾向をモック文として生成する
  if (result.score >= 6) {
    return "収益性・株主還元・バリュエーションのバランスが比較的良好で、定量面では安定感のある銘柄と評価できます。";
  }
  if (result.score >= 4) {
    return "複数指標は基準を満たす一方で、未達項目も残っており、指標間のばらつきが見られます。";
  }
  return "定量指標の未達が多く、現時点では財務面の不確実性が高い状態とみなせます。";
}

function buildOverallConsideration(result: InvestmentResult): string {
  // 合格・不合格の内訳を使って、次の確認観点をモック文として提示する
  const failedLabels = result.evaluations
    .filter((ev) => !ev.passed)
    .map((ev) => ev.label);

  if (failedLabels.length === 0) {
    return "業績ガイダンス、競争優位性、キャッシュフローの質を追加確認し、エントリー価格の妥当性を検討してください。";
  }

  const topFailed = failedLabels.slice(0, 3).join("・");
  return `未達項目（${topFailed}）の背景要因を決算資料で確認し、改善トレンドが継続しているかを重視して判断してください。`;
}

export async function generateMockAiInsight(
  result: InvestmentResult
): Promise<AiInvestmentInsight> {
  // 将来の本実装でLLM呼び出しに置き換えやすいよう、非同期関数として定義しておく
  await sleep(WAIT_MS);

  return {
    metaAnalysis: buildMetaAnalysis(result),
    overallConsideration: buildOverallConsideration(result),
  };
}
