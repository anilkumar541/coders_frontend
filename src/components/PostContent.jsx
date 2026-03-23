import { Link } from "react-router-dom";

const TOKEN_RE = /(#[A-Za-z0-9_]{1,50}|@[A-Za-z0-9_]+)/g;

export default function PostContent({ content }) {
  if (!content) return null;

  const parts = content.split(TOKEN_RE);

  return (
    <p className="text-sm text-gray-700 leading-relaxed mt-3 whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          const tag = part.slice(1).toLowerCase();
          return (
            <Link
              key={i}
              to={`/hashtag/${tag}`}
              className="text-indigo-600 hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("@")) {
          const username = part.slice(1);
          return (
            <Link
              key={i}
              to={`/user/${username}`}
              className="text-indigo-600 hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
