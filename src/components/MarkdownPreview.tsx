"use client";

import { ReactNode } from "react";

type Props = {
  content: string;
};

// 安全なプロトコル（http/https）のリンクのみを許可する
function isSafeExternalLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// 最小限のインラインMarkdownをReact要素に変換する
function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const whole = match[0];
    const matchIndex = match.index ?? 0;
    const linkLabel = match[2];
    const linkUrl = match[3];
    const codeText = match[4];
    const boldText = match[5];
    const italicText = match[6];

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    if (linkLabel && linkUrl) {
      if (isSafeExternalLink(linkUrl)) {
        nodes.push(
          <a
            key={`inline-${tokenIndex}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 underline underline-offset-2"
          >
            {linkLabel}
          </a>
        );
      } else {
        nodes.push(whole);
      }
    } else if (codeText) {
      nodes.push(
        <code
          key={`inline-${tokenIndex}`}
          className="rounded bg-slate-100 px-1 py-0.5 text-[0.85em] text-slate-800"
        >
          {codeText}
        </code>
      );
    } else if (boldText) {
      nodes.push(
        <strong key={`inline-${tokenIndex}`} className="font-semibold text-slate-800">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      nodes.push(
        <em key={`inline-${tokenIndex}`} className="italic">
          {italicText}
        </em>
      );
    } else {
      nodes.push(whole);
    }

    lastIndex = matchIndex + whole.length;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/**
 * AI出力用の簡易Markdownプレビュー
 * - 見出し/段落/箇条書き/引用/コードフェンス/インライン装飾を表示する
 */
export default function MarkdownPreview({ content }: Props) {
  const blocks: ReactNode[] = [];
  let blockIndex = 0;
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const paragraphBuffer: string[] = [];
  const unorderedListBuffer: string[] = [];
  const orderedListBuffer: string[] = [];
  const quoteBuffer: string[] = [];
  const codeBuffer: string[] = [];
  let inCodeFence = false;
  let codeLanguage = "";

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const paragraphText = paragraphBuffer.join(" ").trim();
    paragraphBuffer.length = 0;
    if (!paragraphText) return;

    blocks.push(
      <p
        key={`block-${blockIndex++}`}
        className="text-base leading-relaxed text-slate-700"
      >
        {renderInlineMarkdown(paragraphText)}
      </p>
    );
  };

  const flushUnorderedList = () => {
    if (unorderedListBuffer.length === 0) return;
    const items = [...unorderedListBuffer];
    unorderedListBuffer.length = 0;

    blocks.push(
      <ul
        key={`block-${blockIndex++}`}
        className="list-disc space-y-1 pl-5 text-base text-slate-700"
      >
        {items.map((item, idx) => (
          <li key={`ul-${blockIndex}-${idx}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
  };

  const flushOrderedList = () => {
    if (orderedListBuffer.length === 0) return;
    const items = [...orderedListBuffer];
    orderedListBuffer.length = 0;

    blocks.push(
      <ol
        key={`block-${blockIndex++}`}
        className="list-decimal space-y-1 pl-5 text-base text-slate-700"
      >
        {items.map((item, idx) => (
          <li key={`ol-${blockIndex}-${idx}`}>{renderInlineMarkdown(item)}</li>
        ))}
      </ol>
    );
  };

  const flushQuote = () => {
    if (quoteBuffer.length === 0) return;
    const quoteLines = [...quoteBuffer];
    quoteBuffer.length = 0;

    blocks.push(
      <blockquote
        key={`block-${blockIndex++}`}
        className="border-l-4 border-slate-300 bg-slate-50 py-2 pl-4 text-base text-slate-700"
      >
        {quoteLines.map((line, idx) => (
          <p key={`quote-${blockIndex}-${idx}`} className="leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        ))}
      </blockquote>
    );
  };

  const flushCodeFence = () => {
    if (codeBuffer.length === 0) return;
    const codeText = codeBuffer.join("\n");
    codeBuffer.length = 0;

    blocks.push(
      <div
        key={`block-${blockIndex++}`}
        className="overflow-hidden rounded-lg bg-slate-900"
      >
        {codeLanguage && (
          <div className="border-b border-slate-700 px-4 py-2 text-sm text-slate-300">
            {codeLanguage}
          </div>
        )}
        <pre className="overflow-x-auto px-4 py-3 text-base text-slate-100">
          <code>{codeText}</code>
        </pre>
      </div>
    );
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (inCodeFence) {
      if (trimmed.startsWith("```")) {
        inCodeFence = false;
        flushCodeFence();
        codeLanguage = "";
      } else {
        codeBuffer.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      flushQuote();
      inCodeFence = true;
      codeLanguage = trimmed.slice(3).trim();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      flushQuote();

      const headingLevel = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const headingClassMap: Record<number, string> = {
        1: "text-2xl font-bold text-slate-900",
        2: "text-xl font-bold text-slate-900",
        3: "text-lg font-semibold text-slate-800",
        4: "text-base font-semibold text-slate-800",
        5: "text-base font-medium text-slate-700",
        6: "text-base font-medium text-slate-700",
      };

      if (headingLevel === 1) {
        blocks.push(
          <h1 key={`block-${blockIndex++}`} className={headingClassMap[1]}>
            {renderInlineMarkdown(headingText)}
          </h1>
        );
      } else if (headingLevel === 2) {
        blocks.push(
          <h2 key={`block-${blockIndex++}`} className={headingClassMap[2]}>
            {renderInlineMarkdown(headingText)}
          </h2>
        );
      } else if (headingLevel === 3) {
        blocks.push(
          <h3 key={`block-${blockIndex++}`} className={headingClassMap[3]}>
            {renderInlineMarkdown(headingText)}
          </h3>
        );
      } else if (headingLevel === 4) {
        blocks.push(
          <h4 key={`block-${blockIndex++}`} className={headingClassMap[4]}>
            {renderInlineMarkdown(headingText)}
          </h4>
        );
      } else if (headingLevel === 5) {
        blocks.push(
          <h5 key={`block-${blockIndex++}`} className={headingClassMap[5]}>
            {renderInlineMarkdown(headingText)}
          </h5>
        );
      } else {
        blocks.push(
          <h6 key={`block-${blockIndex++}`} className={headingClassMap[6]}>
            {renderInlineMarkdown(headingText)}
          </h6>
        );
      }
      continue;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushOrderedList();
      flushQuote();
      unorderedListBuffer.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      flushUnorderedList();
      flushQuote();
      orderedListBuffer.push(orderedMatch[1]);
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      quoteBuffer.push(quoteMatch[1]);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      flushQuote();
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  if (inCodeFence) {
    flushCodeFence();
  }

  flushParagraph();
  flushUnorderedList();
  flushOrderedList();
  flushQuote();

  return <div className="space-y-3">{blocks}</div>;
}
