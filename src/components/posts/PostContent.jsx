import { useState } from "react";
import { Link } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const TOKEN_RE = /(#[A-Za-z0-9_]{1,50}|@[A-Za-z0-9_]+)/g;
const CHAR_LIMIT = 280;

function renderTokens(text, mentionMap) {
  return text.split(TOKEN_RE).map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <Link
          key={i}
          to={`/hashtag/${part.slice(1).toLowerCase()}`}
          className="text-indigo-600 hover:underline mr-1"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("@")) {
      const uname = part.slice(1);
      const uid = mentionMap?.[uname];
      return (
        <Link
          key={i}
          to={uid ? `/user/${uid}` : `/user/${uname}`}
          className="text-indigo-600 hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Separate trailing hashtag-only lines from the body text
function splitContentAndTags(content) {
  const lines = content.split("\n");
  let splitIdx = lines.length;

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed === "") {
      splitIdx = i;
      continue;
    }
    if (/^(#[A-Za-z0-9_]{1,50}\s*)+$/.test(trimmed)) {
      splitIdx = i;
    } else {
      break;
    }
  }

  const body = lines.slice(0, splitIdx).join("\n").trimEnd();
  const tags = lines.slice(splitIdx).join("\n").trim();
  return { body, tags };
}

/**
 * Splits text into alternating plain/code segments.
 * Returns array of { type: "text"|"code", content, lang? }
 */
function splitIntoSegments(text) {
  const segments = [];
  // Match fenced code blocks: ```lang\ncode\n```
  const CODE_FENCE = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = CODE_FENCE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: "code",
      lang: match[1].trim() || "text",
      content: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return segments;
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden text-sm border border-gray-700/30 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-1.5">
        <span className="text-xs font-mono text-gray-400 select-none">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.8rem",
          lineHeight: "1.5",
          padding: "1rem",
          background: "#1e1e2e",
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function PostContent({ content, mentions }) {
  const [expanded, setExpanded] = useState(false);

  const mentionMap = mentions?.reduce((acc, m) => {
    acc[m.username] = m.id;
    return acc;
  }, {});

  if (!content) return null;

  const { body, tags } = splitContentAndTags(content);

  // Determine if we have any code blocks (don't apply char limit mid-block)
  const hasCodeBlocks = /```/.test(body);
  const isLong = !hasCodeBlocks && body.length > CHAR_LIMIT;
  const displayBody = isLong && !expanded ? body.slice(0, CHAR_LIMIT).trimEnd() : body;

  const segments = splitIntoSegments(displayBody);

  return (
    <div className="mt-3">
      {segments.map((seg, i) =>
        seg.type === "code" ? (
          <CodeBlock key={i} lang={seg.lang} code={seg.content} />
        ) : (
          <p
            key={i}
            className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap"
          >
            {renderTokens(seg.content, mentionMap)}
            {isLong && !expanded && i === segments.length - 1 && "… "}
          </p>
        )
      )}
      {isLong && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer text-sm"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
      {tags && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap mt-1">
          {renderTokens(tags, mentionMap)}
        </p>
      )}
    </div>
  );
}
