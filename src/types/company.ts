export type Company = {
  id: string;
  name: string;
  ticker: string;
};

export type FinancialMetrics = {
  equityRatio: number;       // 自己資本比率 (%)
  revenueGrowth: number;     // 売上高成長率 (%)
  netIncomeGrowth: number;   // 当期純利益伸び率 (%)
  payoutRatio: number;       // 配当性向 (%)
  dividendYield: number;     // 配当利回り (%)
  per: number;               // PER (倍)
  pbr: number;               // PBR (倍)
};

export type MetricKey = keyof FinancialMetrics;

export type MetricEvaluation = {
  key: MetricKey;
  label: string;
  criterion: string;
  value: number;
  unit: string;
  passed: boolean;
};

export type InvestmentResult = {
  company: Company;
  metrics: FinancialMetrics;
  evaluations: MetricEvaluation[];
  score: number;
  verdict: "◯" | "△" | "×";
};
