export type Company = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
};

export type FinancialMetrics = {
  equityRatio: number | null; // 自己資本比率 (%)
  revenueGrowth: number;     // 売上高成長率 (%)
  netIncomeGrowth: number;   // 当期純利益伸び率 (%)
  payoutRatio: number | null; // 配当性向 (%)
  dividendYield: number | null; // 配当利回り (%)
  per: number | null;        // PER (倍)
  pbr: number | null;        // PBR (倍)
};

export type MetricKey = keyof FinancialMetrics;

export type MetricEvaluation = {
  key: MetricKey;
  label: string;
  criterion: string;
  value: number | null;
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
