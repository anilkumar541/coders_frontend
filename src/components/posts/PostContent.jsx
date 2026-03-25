import { useState } from "react";
import { Link } from "react-router-dom";

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

export default function PostContent({ content, mentions }) {
  const [expanded, setExpanded] = useState(false);

  const mentionMap = mentions?.reduce((acc, m) => {
    acc[m.username] = m.id;
    return acc;
  }, {});

  if (!content) return null;

  const { body, tags } = splitContentAndTags(content);
  const isLong = body.length > CHAR_LIMIT;
  const displayBody = isLong && !expanded ? body.slice(0, CHAR_LIMIT).trimEnd() : body;

  return (
    <div className="mt-3">
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {renderTokens(displayBody, mentionMap)}
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
      {tags && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap mt-1">
          {renderTokens(tags, mentionMap)}
        </p>
      )}
    </div>
  );
}
