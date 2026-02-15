import { NextRequest, NextResponse } from "next/server";
import { FmpApiError, fetchFinancialMetricsBySymbol } from "@/lib/fmp";

export async function GET(request: NextRequest) {
  // 選択済みsymbolを受け取り、判定用7指標を返す
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim() ?? "";

  if (!symbol) {
    return NextResponse.json(
      { message: "symbolクエリが必要です" },
      { status: 400 }
    );
  }

  try {
    const metrics = await fetchFinancialMetricsBySymbol(symbol);
    return NextResponse.json(metrics);
  } catch (error) {
    if (error instanceof FmpApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "財務指標の取得に失敗しました" },
      { status: 502 }
    );
  }
}
