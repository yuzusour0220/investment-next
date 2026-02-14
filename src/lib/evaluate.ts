import {
  FinancialMetrics,
  MetricEvaluation,
  InvestmentResult,
  Company,
} from "@/types/company";

type MetricRule = {
  key: keyof FinancialMetrics;
  label: string;
  criterion: string;
  unit: string;
  check: (value: number) => boolean;
};

const rules: MetricRule[] = [
  {
    key: "equityRatio",
    label: "自己資本比率",
    criterion: "20%以上",
    unit: "%",
    check: (v) => v >= 20,
  },
  {
    key: "revenueGrowth",
    label: "売上高成長率",
    criterion: "前年比プラス",
    unit: "%",
    check: (v) => v > 0,
  },
  {
    key: "netIncomeGrowth",
    label: "当期純利益伸び率",
    criterion: "前年比プラス",
    unit: "%",
    check: (v) => v > 0,
  },
  {
    key: "payoutRatio",
    label: "配当性向",
    criterion: "30%以上",
    unit: "%",
    check: (v) => v >= 30,
  },
  {
    key: "dividendYield",
    label: "配当利回り",
    criterion: "3%以上",
    unit: "%",
    check: (v) => v >= 3,
  },
  {
    key: "per",
    label: "PER",
    criterion: "20倍以下",
    unit: "倍",
    check: (v) => v <= 20,
  },
  {
    key: "pbr",
    label: "PBR",
    criterion: "2倍以下",
    unit: "倍",
    check: (v) => v <= 2,
  },
];

function evaluateMetrics(metrics: FinancialMetrics): MetricEvaluation[] {
  return rules.map((rule) => ({
    key: rule.key,
    label: rule.label,
    criterion: rule.criterion,
    value: metrics[rule.key],
    unit: rule.unit,
    passed: rule.check(metrics[rule.key]),
  }));
}

function getVerdict(score: number): "◯" | "△" | "×" {
  if (score === 7) return "◯";
  if (score >= 5) return "△";
  return "×";
}

export function evaluate(
  company: Company,
  metrics: FinancialMetrics
): InvestmentResult {
  const evaluations = evaluateMetrics(metrics);
  const score = evaluations.filter((e) => e.passed).length;
  return {
    company,
    metrics,
    evaluations,
    score,
    verdict: getVerdict(score),
  };
}
