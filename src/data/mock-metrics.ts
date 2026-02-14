import { FinancialMetrics } from "@/types/company";

export const mockMetrics: Record<string, FinancialMetrics> = {
  // トヨタ自動車 - 優良（7/7）
  "7203": {
    equityRatio: 38.5,
    revenueGrowth: 8.2,
    netIncomeGrowth: 12.5,
    payoutRatio: 33.0,
    dividendYield: 3.2,
    per: 10.5,
    pbr: 1.1,
  },
  // ソニーグループ - まあまあ（5/7）
  "6758": {
    equityRatio: 25.3,
    revenueGrowth: 6.1,
    netIncomeGrowth: 15.3,
    payoutRatio: 10.0, // ✗
    dividendYield: 0.8, // ✗
    per: 16.2,
    pbr: 1.9,
  },
  // ソフトバンクグループ - 悪い（3/7）
  "9984": {
    equityRatio: 15.2, // ✗
    revenueGrowth: -3.5, // ✗
    netIncomeGrowth: -25.0, // ✗
    payoutRatio: 44.0,
    dividendYield: 4.5,
    per: 35.0, // ✗
    pbr: 1.8,
  },
  // キーエンス - まあまあ（5/7）
  "6861": {
    equityRatio: 55.0,
    revenueGrowth: 10.5,
    netIncomeGrowth: 8.7,
    payoutRatio: 15.0, // ✗
    dividendYield: 0.5, // ✗
    per: 18.0,
    pbr: 1.5,
  },
  // 三菱UFJ - 優良（7/7）
  "8306": {
    equityRatio: 22.0,
    revenueGrowth: 5.3,
    netIncomeGrowth: 18.2,
    payoutRatio: 35.0,
    dividendYield: 3.8,
    per: 9.5,
    pbr: 0.7,
  },
  // NTT - 優良（6/7）
  "9432": {
    equityRatio: 35.0,
    revenueGrowth: 2.1,
    netIncomeGrowth: 4.5,
    payoutRatio: 40.0,
    dividendYield: 3.5,
    per: 12.0,
    pbr: 1.5,
  },
  // 信越化学工業 - まあまあ（5/7）
  "4063": {
    equityRatio: 80.0,
    revenueGrowth: -5.2, // ✗
    netIncomeGrowth: -10.3, // ✗
    payoutRatio: 35.0,
    dividendYield: 3.1,
    per: 15.0,
    pbr: 1.8,
  },
  // 日立製作所 - まあまあ（5/7）
  "6501": {
    equityRatio: 30.0,
    revenueGrowth: 7.8,
    netIncomeGrowth: 20.0,
    payoutRatio: 32.0,
    dividendYield: 1.5, // ✗
    per: 18.0,
    pbr: 2.5, // ✗
  },
};
