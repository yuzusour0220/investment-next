"use client";

import { InvestmentResult as Result } from "@/types/company";

type Props = {
  result: Result;
};

// 判定（◯/△/×）ごとのスタイル定義
const verdictStyles = {
  "◯": "bg-green-100 text-green-700 border-green-300",
  "△": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "×": "bg-red-100 text-red-700 border-red-300",
};

/**
 * 投資判定結果コンポーネント
 * - 総合判定（◯/△/×）とスコア（7点中X点）を大きく表示
 * - 7つの財務指標を一覧表示し、各指標の合否を緑/赤で視覚的に表現
 */
export default function InvestmentResult({ result }: Props) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      {/* 会社名と証券コード */}
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        {result.company.name}
        <span className="ml-2 text-sm text-slate-400">
          ({result.company.symbol})
        </span>
      </h2>

      {/* 総合判定カード: 左に判定マーク、右にスコア */}
      <div
        className={`flex items-center justify-between rounded-xl border-2 px-6 py-4 mb-6 ${verdictStyles[result.verdict]}`}
      >
        <div>
          <div className="text-sm font-medium opacity-80">総合判定</div>
          <div className="text-4xl font-bold">{result.verdict}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium opacity-80">スコア</div>
          <div className="text-2xl font-bold">{result.score} / 7</div>
        </div>
      </div>

      {/* 各指標の合否リスト */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {result.evaluations.map((ev) => (
          <div
            key={ev.key}
            className={`flex items-center justify-between rounded-lg px-4 py-3 ${
              ev.passed ? "bg-green-50" : "bg-red-50" // 合格=緑背景、不合格=赤背景
            }`}
          >
            {/* 左側: 合否アイコン + 指標名 + 基準値 */}
            <div className="flex items-center gap-3">
              {/* 合否を丸アイコンで表示（✓ or ✗） */}
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white ${
                  ev.passed ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {ev.passed ? "✓" : "✗"}
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-700">
                  {ev.label}
                </div>
                <div className="text-xs text-slate-400">
                  基準: {ev.criterion}
                </div>
              </div>
            </div>

            {/* 右側: 実際の値 */}
            <div className="text-right">
              <span
                className={`text-base font-bold ${
                  ev.passed ? "text-green-700" : "text-red-700"
                }`}
              >
                {ev.value === null ? "値なし" : `${ev.value}${ev.unit}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
