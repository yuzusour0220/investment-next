import { Company, FinancialMetrics } from "@/types/company";

const FMP_BASE_URL = "https://financialmodelingprep.com/stable";

const SUPPORTED_EXCHANGES = new Set(["NYSE", "NASDAQ", "AMEX"]);

type FmpSearchNameItem = {
  symbol?: unknown;
  name?: unknown;
  currency?: unknown;
  exchange?: unknown;
};

type FmpRatiosTtmItem = {
  priceToEarningsRatioTTM?: unknown;
  priceToBookRatioTTM?: unknown;
  dividendPayoutRatioTTM?: unknown;
  dividendYieldTTM?: unknown;
};

type FmpFinancialGrowthItem = {
  revenueGrowth?: unknown;
  netIncomeGrowth?: unknown;
};

type FmpBalanceSheetItem = {
  totalStockholdersEquity?: unknown;
  totalAssets?: unknown;
};

export class FmpApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new FmpApiError(
      "FMP_API_KEYが設定されていません",
      500,
      "missing_api_key"
    );
  }
  return apiKey;
}

async function fetchFmpArray<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T[]> {
  const url = new URL(`${FMP_BASE_URL}/${endpoint}`);
  const apiKey = getApiKey();

  Object.entries({ ...params, apikey: apiKey }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, { cache: "no-store" });
  const bodyText = await response.text();

  if (!response.ok) {
    throw new FmpApiError(
      `FMP APIの呼び出しに失敗しました: ${endpoint}`,
      502,
      "upstream_http_error"
    );
  }

  if (bodyText.includes("Premium Query Parameter")) {
    throw new FmpApiError(
      "現在のプランではこのシンボルのデータを取得できません",
      422,
      "premium_limited"
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    throw new FmpApiError(
      "FMP APIレスポンスのJSON解析に失敗しました",
      502,
      "invalid_json"
    );
  }

  if (!Array.isArray(parsed)) {
    throw new FmpApiError(
      "FMP APIレスポンス形式が想定外です",
      502,
      "unexpected_response_shape"
    );
  }

  return parsed as T[];
}

function parseStringField(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new FmpApiError(
      `文字列フィールドが不正です: ${fieldName}`,
      422,
      "invalid_field"
    );
  }
  return value.trim();
}

function parseNumberField(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new FmpApiError(
      `数値フィールドが不正です: ${fieldName}`,
      422,
      "invalid_field"
    );
  }
  return value;
}

function normalizePercent(value: number): number {
  // FMPの一部指標は0.064=6.4%の形式で返るため、必要時のみ%に正規化する
  return Math.abs(value) <= 1 ? value * 100 : value;
}

function toNullIfNegative(value: number): number | null {
  // 業務上マイナスを許容しない指標は、負値なら値なしとして扱う
  return value < 0 ? null : value;
}

function toCompany(item: FmpSearchNameItem): Company {
  const symbol = parseStringField(item.symbol, "symbol");
  const name = parseStringField(item.name, "name");
  const exchange = parseStringField(item.exchange, "exchange");
  const currency = parseStringField(item.currency, "currency");

  return { symbol, name, exchange, currency };
}

export async function searchCompaniesByName(query: string): Promise<Company[]> {
  const rows = await fetchFmpArray<FmpSearchNameItem>("search-name", {
    query,
    limit: "30",
  });

  const uniq = new Set<string>();
  const companies: Company[] = [];

  for (const row of rows) {
    try {
      const company = toCompany(row);
      if (!SUPPORTED_EXCHANGES.has(company.exchange)) {
        continue;
      }
      if (uniq.has(company.symbol)) {
        continue;
      }
      uniq.add(company.symbol);
      companies.push(company);
    } catch {
      // 欠損データ行はスキップして候補生成を継続する
      continue;
    }
  }

  return companies;
}

function firstRow<T>(rows: T[], endpoint: string): T {
  if (rows.length === 0) {
    throw new FmpApiError(
      `データが見つかりませんでした: ${endpoint}`,
      422,
      "data_not_found"
    );
  }
  return rows[0];
}

export async function fetchFinancialMetricsBySymbol(
  symbol: string
): Promise<FinancialMetrics> {
  const [ratiosRows, growthRows, balanceRows] = await Promise.all([
    fetchFmpArray<FmpRatiosTtmItem>("ratios-ttm", { symbol }),
    fetchFmpArray<FmpFinancialGrowthItem>("financial-growth", { symbol }),
    fetchFmpArray<FmpBalanceSheetItem>("balance-sheet-statement", {
      symbol,
      limit: "1",
    }),
  ]);

  const ratios = firstRow(ratiosRows, "ratios-ttm");
  const growth = firstRow(growthRows, "financial-growth");
  const balance = firstRow(balanceRows, "balance-sheet-statement");

  const totalEquity = parseNumberField(
    balance.totalStockholdersEquity,
    "totalStockholdersEquity"
  );
  const totalAssets = parseNumberField(balance.totalAssets, "totalAssets");

  if (totalAssets === 0) {
    throw new FmpApiError(
      "totalAssetsが0のため自己資本比率を計算できません",
      422,
      "invalid_field"
    );
  }

  return {
    equityRatio: toNullIfNegative(normalizePercent(totalEquity / totalAssets)),
    revenueGrowth: normalizePercent(
      parseNumberField(growth.revenueGrowth, "revenueGrowth")
    ),
    netIncomeGrowth: normalizePercent(
      parseNumberField(growth.netIncomeGrowth, "netIncomeGrowth")
    ),
    payoutRatio: toNullIfNegative(
      normalizePercent(
        parseNumberField(ratios.dividendPayoutRatioTTM, "dividendPayoutRatioTTM")
      )
    ),
    dividendYield: toNullIfNegative(
      normalizePercent(
        parseNumberField(ratios.dividendYieldTTM, "dividendYieldTTM")
      )
    ),
    per: toNullIfNegative(
      parseNumberField(ratios.priceToEarningsRatioTTM, "priceToEarningsRatioTTM")
    ),
    pbr: toNullIfNegative(
      parseNumberField(ratios.priceToBookRatioTTM, "priceToBookRatioTTM")
    ),
  };
}
