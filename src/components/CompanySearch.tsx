"use client";

import { useState, useRef, useEffect } from "react";
import { Company } from "@/types/company";

type Props = {
  onSelect: (company: Company | null) => void;
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
  const [candidates, setCandidates] = useState<Company[]>([]); // APIから取得した候補
  const [isLoading, setIsLoading] = useState(false); // 候補取得中の状態
  const [errorMessage, setErrorMessage] = useState(""); // 候補取得エラー文言
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null); // トグル選択中symbol
  const [isOpen, setIsOpen] = useState(false); // 候補リスト表示状態
  const ref = useRef<HTMLDivElement>(null); // コンポーネント外クリック検知用
  const skipNextSearchRef = useRef(false); // 候補選択時の不要な再検索を抑止するフラグ

  // デバウンス処理: 入力が止まってからAPIを呼び出して候補を更新する
  useEffect(() => {
    // 候補選択直後にsetQueryした1回分は、意図しない再検索なのでスキップする
    if (skipNextSearchRef.current) {
      // 次回以降は通常どおり検索できるようにフラグを戻す
      skipNextSearchRef.current = false;
      // このuseEffect実行ではAPIを呼ばずに終了する
      return;
    }

    // 前後の空白を除去した文字列を、検索クエリとして利用する
    const normalizedQuery = query.trim();
    // 2文字未満はノイズ検索になりやすいため、候補をクリアして待機する
    if (normalizedQuery.length < 2) {
      // 候補リストを空にして前回結果を残さない
      setCandidates([]);
      // 前回のエラー表示もリセットする
      setErrorMessage("");
      // 読み込み状態を終了させる
      setIsLoading(false);
      // 入力が十分になるまでAPI呼び出しを行わない
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage("");
      setIsOpen(true);

      try {
        const res = await fetch(
          `/api/fmp/search-name?query=${encodeURIComponent(normalizedQuery)}`,
          {
            signal: controller.signal,
          }
        );
        const body = (await res.json()) as Company[] | { message?: string };
        if (!res.ok) {
          setCandidates([]);
          setErrorMessage(
            "message" in body && body.message
              ? body.message
              : "候補の取得に失敗しました"
          );
          return;
        }
        setCandidates(body as Company[]);
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        setCandidates([]);
        setErrorMessage("候補の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

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
    // 同じ候補を再クリックした場合はトグル解除する
    if (selectedSymbol === company.symbol) {
      setSelectedSymbol(null);
      onSelect(null);
      return;
    }

    setSelectedSymbol(company.symbol);
    skipNextSearchRef.current = true;
    setQuery(company.name); // 入力欄に選択した会社名を表示
    setIsOpen(false); // 候補リストを閉じる
    onSelect(company); // 親コンポーネントに選択を通知
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* ラベル */}
      <label className="mb-2 block text-base font-medium text-slate-600">
        会社名（英語）を入力
      </label>

      {/* 検索テキスト入力 */}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedSymbol(null); // 入力変更時は前回選択を解除する
          onSelect(null); // 親側の選択会社をクリアする
          // 入力中は候補を非表示にして、デバウンス後に再表示する
          setIsOpen(false);
        }}
        placeholder="例: Apple, Microsoft, Toyota"
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      {/* 候補リスト: デバウンス後にAPI結果がある場合に表示 */}
      {isOpen && candidates.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-auto">
          {candidates.map((company) => (
            <li key={company.symbol}>
              <button
                type="button"
                onClick={() => handleSelect(company)}
                aria-pressed={selectedSymbol === company.symbol}
                className={`w-full text-left px-4 py-3 transition flex justify-between items-center ${
                  selectedSymbol === company.symbol
                    ? "bg-blue-100"
                    : "hover:bg-blue-50"
                }`}
              >
                <div>
                  <div className="text-base font-medium">{company.name}</div>
                  <div className="text-sm text-slate-500">
                    {company.exchange} / {company.currency}
                  </div>
                </div>
                <span className="text-base text-slate-400">{company.symbol}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 読み込み中メッセージ */}
      {isOpen && isLoading && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-500 shadow-lg">
          候補を取得中...
        </div>
      )}

      {/* エラーメッセージ */}
      {isOpen && !isLoading && errorMessage && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-base text-red-500 shadow-lg">
          {errorMessage}
        </div>
      )}

      {/* 該当なしメッセージ: デバウンス後に候補がない場合 */}
      {isOpen &&
        !isLoading &&
        !errorMessage &&
        query.trim().length >= 2 &&
        candidates.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-400 shadow-lg">
          該当する会社が見つかりません
        </div>
      )}
    </div>
  );
}
