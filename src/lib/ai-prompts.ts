import { InvestmentResult } from "@/types/company";

function formatMetricValue(value: number | null, unit: string): string {
  if (value === null) {
    return "不明";
  }
  return `${value}${unit}`;
}

function buildScreeningLines(result: InvestmentResult): string {
  return result.evaluations
    .map((ev, index) => {
      const status = ev.passed ? "合格" : "不合格";
      return `${index + 1}. ${ev.label}: ${formatMetricValue(ev.value, ev.unit)} / 基準=${ev.criterion} / 判定=${status}`;
    })
    .join("\n");
}

function buildRawMetricLines(result: InvestmentResult): string {
  const metrics = result.metrics;

  // LLMに判断根拠を渡すため、財務指標の生値を明示する
  return [
    `自己資本比率: ${formatMetricValue(metrics.equityRatio, "%")}`,
    `売上高成長率: ${formatMetricValue(metrics.revenueGrowth, "%")}`,
    `当期純利益伸び率: ${formatMetricValue(metrics.netIncomeGrowth, "%")}`,
    `配当性向: ${formatMetricValue(metrics.payoutRatio, "%")}`,
    `配当利回り: ${formatMetricValue(metrics.dividendYield, "%")}`,
    `PER: ${formatMetricValue(metrics.per, "倍")}`,
    `PBR: ${formatMetricValue(metrics.pbr, "倍")}`,
  ].join("\n");
}

export function buildMetaAnalysisPrompt(companyName: string): string {
  return `
# Role
あなたは未来予測に定評のある「戦略コンサルタント」です。
マクロ経済、テクノロジーの進化、社会情勢の変化といったメタ情報を読み解き、それが企業へ与える影響を論理的に分析してください。

# Task
対象企業について、現代の主要なマクロトレンドとの適合性を分析してください。
特に「AI技術の進展」と「パンデミック後の社会変化」が、追い風か向かい風かを明確に評価してください。

# Input Data
対象企業: ${companyName}

# Analysis Framework
1. テクノロジーの特異点（AI・DX）
- 生成AIや自動化技術は同社を強化するか、破壊するか
- 同社はテクノロジー進化に適応できているか

2. 社会・ライフスタイルの変容（ポスト・パンデミック）
- リモートワーク、非接触、健康意識の定着は同社に有利か
- サステナビリティ重視など価値観変化に対応できているか

3. 市場構造と競争環境
- 業界パイは拡大か縮小か
- 異業種参入リスクはあるか

# Output
- 日本語で、投資家が読みやすい平易な文章のみで回答してください。
- 箇条書きは使っても良いですが、表は不要です。
- 最後に「総合的な環境評価」として結論を文章で明示してください。
`.trim();
}

export function buildInvestmentCommentaryPrompt(
  result: InvestmentResult,
  metaAnalysisText: string
): string {
  const screeningLines = buildScreeningLines(result);
  const rawMetricLines = buildRawMetricLines(result);

  return `
# Role
あなたは厳格な規律を持つ「バリュー株投資家」です。
感情を排し、数字（ファンダメンタルズ）に基づいて投資判断を行ってください。

# Task
対象企業の財務データを7基準で点検し、投資対象として魅力的かを講評してください。

# Input Data
対象企業: ${result.company.name} (${result.company.symbol})
総合判定: ${result.verdict}
スコア: ${result.score} / 7

## 7つの基準と現在値
${screeningLines}

## 財務指標の生データ
${rawMetricLines}

## 参考メタ分析（外部環境）
${metaAnalysisText}

# Output
- 日本語で、投資家向けにわかりやすい文章のみで回答してください。
- 表は不要です（文章で説明してください）。
- 次の3点を必ず含めてください:
  1. 強み
  2. 懸念
  3. 総合判断（「積極的に投資したい / 条件付きで検討 / 様子見 / 投資対象外」のいずれかを文章中で明示）
`.trim();
}
