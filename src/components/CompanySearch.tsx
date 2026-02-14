"use client";

import { useState, useRef, useEffect } from "react";
import { Company } from "@/types/company";
import { mockCompanies } from "@/data/mock-companies";

type Props = {
  onSelect: (company: Company) => void;
};

/**
 * 会社検索コンポーネント
 * テキスト入力でモック企業データをインクリメンタルサーチし、
 * ドロップダウンで候補を表示 → 選択で親に通知する
 */
export default function CompanySearch({ onSelect }: Props) {
  const [query, setQuery] = useState(""); // 検索テキスト
  const [isOpen, setIsOpen] = useState(false); // ドロップダウン表示状態
  const ref = useRef<HTMLDivElement>(null); // コンポーネント外クリック検知用

  // 入力テキストで会社名 or 証券コードをフィルタリング
  const filtered = query
    ? mockCompanies.filter(
        (c) => c.name.includes(query) || c.id.includes(query)
      )
    : [];

  // コンポーネント外をクリックしたらドロップダウンを閉じるという操作を最初に指定
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    // クリーンアップ: イベントリスナーを削除
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 候補を選択したときの処理
  function handleSelect(company: Company) {
    setQuery(company.name); // 入力欄に選択した会社名を表示
    setIsOpen(false); // ドロップダウンを閉じる
    onSelect(company); // 親コンポーネントに選択を通知
  }

  return (
    <div ref={ref} className="relative w-full max-w-md">
      {/* ラベル */}
      <label className="block text-sm font-medium text-slate-600 mb-2">
        会社名または証券コードを入力
      </label>

      {/* 検索テキスト入力 */}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query && setIsOpen(true)}
        placeholder="例: トヨタ、7203"
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
      />

      {/* 候補ドロップダウン: フィルタ結果がある場合に表示 */}
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-auto">
          {filtered.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                onClick={() => handleSelect(company)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex justify-between items-center"
              >
                <span className="font-medium">{company.name}</span>
                <span className="text-sm text-slate-400">{company.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 該当なしメッセージ: 入力はあるが候補がない場合 */}
      {isOpen && query && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg px-4 py-3 text-slate-400">
          該当する会社が見つかりません
        </div>
      )}
    </div>
  );
}
