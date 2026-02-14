"use client";

import { useState, useRef, useEffect } from "react";
import { Company } from "@/types/company";
import { mockCompanies } from "@/data/mock-companies";

type Props = {
  onSelect: (company: Company) => void;
};

// デバウンスの待機時間（ミリ秒）
const DEBOUNCE_MS = 500;

/**
 * 会社検索コンポーネント
 * テキスト入力後、ユーザーが打ち終わったタイミング（500ms入力なし）で
 * 候補を表示し、選択で親に通知する
 */
export default function CompanySearch({ onSelect }: Props) {
  const [query, setQuery] = useState(""); // 検索テキスト（リアルタイム）
  const [debouncedQuery, setDebouncedQuery] = useState(""); // デバウンス後の検索テキスト
  const [isOpen, setIsOpen] = useState(false); // 候補リスト表示状態
  const ref = useRef<HTMLDivElement>(null); // コンポーネント外クリック検知用

  // デバウンス処理: 入力が止まってからDEBOUNCE_MS後に候補を表示
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      // 入力テキストがあれば候補を表示
      if (query) {
        setIsOpen(true);
      }
    }, DEBOUNCE_MS);
    // 入力が続いた場合はタイマーをリセット
    return () => clearTimeout(timer);
  }, [query]);

  // デバウンス後のテキストで会社名 or 証券コードをフィルタリング
  const filtered = debouncedQuery
    ? mockCompanies.filter(
        (c) => c.name.includes(debouncedQuery) || c.id.includes(debouncedQuery)
      )
    : [];

  // コンポーネント外をクリックしたら候補リストを閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 候補を選択したときの処理
  function handleSelect(company: Company) {
    setQuery(company.name); // 入力欄に選択した会社名を表示
    setDebouncedQuery(""); // フィルタをクリアして候補を非表示に
    setIsOpen(false); // 候補リストを閉じる
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
          // 入力中は候補を非表示にする（打ち終わるまで待つ）
          setIsOpen(false);
        }}
        placeholder="例: トヨタ、7203"
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
      />

      {/* 候補リスト: デバウンス後にフィルタ結果がある場合に表示 */}
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

      {/* 該当なしメッセージ: デバウンス後に候補がない場合 */}
      {isOpen && debouncedQuery && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg px-4 py-3 text-slate-400">
          該当する会社が見つかりません
        </div>
      )}
    </div>
  );
}
