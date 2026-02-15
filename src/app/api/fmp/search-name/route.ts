import { NextRequest, NextResponse } from "next/server";
import { FmpApiError, searchCompaniesByName } from "@/lib/fmp";

export async function GET(request: NextRequest) {
  // クエリ未入力時は外部APIを呼ばずに空配列を返す
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const companies = await searchCompaniesByName(query);
    return NextResponse.json(companies);
  } catch (error) {
    if (error instanceof FmpApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "会社候補の取得に失敗しました" },
      { status: 502 }
    );
  }
}
