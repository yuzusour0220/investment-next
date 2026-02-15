"use client";

type Props = {
  companyName: string; // ボタンに表示する会社名
  onClick: () => void; // ボタン押下時のコールバック
  disabled?: boolean; // ボタン無効状態
  isLoading?: boolean; // 判定中状態
};

/**
 * 判定実行ボタン
 * 会社選択後に表示され、クリックで投資判定を実行する
 */
export default function EvaluateButton({
  companyName,
  onClick,
  disabled = false,
  isLoading = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
    >
      {isLoading ? "判定中..." : `${companyName}を判定する`}
    </button>
  );
}
