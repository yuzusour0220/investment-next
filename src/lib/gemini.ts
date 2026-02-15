const GEMINI_MODEL = "gemini-3-pro-preview"; // 2024年6月時点の最新モデル  
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiTextResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export class GeminiApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiApiError(
      "GEMINI_API_KEYが設定されていません",
      500,
      "missing_api_key"
    );
  }
  return apiKey;
}

function extractTextFromCandidates(body: GeminiTextResponse): string {
  const text = body.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiApiError(
      "Geminiからテキスト応答を取得できませんでした",
      502,
      "empty_text_response"
    );
  }

  return text;
}

export async function generateTextWithGemini(prompt: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  const endpoint = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        // 文章出力のみを期待するため、プレーンテキスト形式を指定する
        responseMimeType: "text/plain",
      },
    }),
    cache: "no-store",
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new GeminiApiError(
      "Gemini APIの呼び出しに失敗しました",
      502,
      "upstream_http_error"
    );
  }

  let parsed: GeminiTextResponse;
  try {
    parsed = JSON.parse(rawText) as GeminiTextResponse;
  } catch {
    throw new GeminiApiError(
      "Gemini APIレスポンスのJSON解析に失敗しました",
      502,
      "invalid_json"
    );
  }

  return extractTextFromCandidates(parsed);
}
