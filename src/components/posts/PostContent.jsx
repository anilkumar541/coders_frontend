import { useState } from "react";
import { Link } from "react-router-dom";

const TOKEN_RE = /(#[A-Za-z0-9_]{1,50}|@[A-Za-z0-9_]+)/g;
const CHAR_LIMIT = 280;

function renderTokens(text) {
  return text.split(TOKEN_RE).map((part, i) => {
    if (part.startsWith("#")) {
      return (
        <Link
          key={i}
          to={`/hashtag/${part.slice(1).toLowerCase()}`}
          className="text-indigo-600 hover:underline"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("@")) {
      return (
        <Link
          key={i}
          to={`/user/${part.slice(1)}`}
          className="text-indigo-600 hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function PostContent({ content }) {
  const [expanded, setExpanded] = useState(false);

  if (!content) return null;

  const isLong = content.length > CHAR_LIMIT;
  const displayText =
    isLong && !expanded ? content.slice(0, CHAR_LIMIT).trimEnd() : content;

  return (
    <p className="text-sm text-gray-700 leading-relaxed mt-3 whitespace-pre-wrap">
      {renderTokens(displayText)}
      {isLong && !expanded && "… "}
      {isLong && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer text-sm"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </p>
  );
}
