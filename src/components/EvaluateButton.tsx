"use client";

type Props = {
  companyName: string; // ボタンに表示する会社名
  onClick: () => void; // ボタン押下時のコールバック
};

/**
 * 判定実行ボタン
 * 会社選択後に表示され、クリックで投資判定を実行する
 */
export default function EvaluateButton({ companyName, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="mt-6 rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 transition"
    >
      判定する
    </button>
  );
}
