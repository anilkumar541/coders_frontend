import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getAvatarStyle } from "../../utils/avatarColor";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    title: "Share your code",
    desc: "Post snippets, projects, and experiments. Get feedback from people who actually understand what you built.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: "Developer-only community",
    desc: "No lifestyle content. No ads disguised as posts. Every person here writes code — that's the only filter.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    ),
    title: "All skill levels welcome",
    desc: "Student pushing first commits or senior shipping distributed systems — there's no gate. Show up and contribute.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: "Learn by osmosis",
    desc: "Your feed becomes a passive learning channel. Every scroll exposes you to patterns, tools, and ideas from real projects.",
  },
];

const posts = [
  {
    avatar: "AK",
    name: "anil_dev",
    time: "2h ago",
    content: "Just shipped a zero-downtime migration on 50M rows. The trick was batching updates in chunks of 1k with a short sleep between — kept replication lag under 200ms the whole time.",
    tags: ["#postgres", "#migrations"],
  },
  {
    avatar: "SR",
    name: "sara_rust",
    time: "5h ago",
    content: "Hot take: error handling in Rust isn't verbose — it's explicit. Once you stop fighting the borrow checker and start thinking in ownership, the compiler becomes your best reviewer.",
    tags: ["#rust", "#opinion"],
  },
  {
    avatar: "MC",
    name: "mcode42",
    time: "1d ago",
    content: "Built my first CLI tool in Go today. Parsing flags, writing to stdout, reading config from a YAML file. 200 lines. Shipped to prod. This is what fun feels like.",
    tags: ["#golang", "#cli", "#buildinpublic"],
  },
];

export default function HomePage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  if (accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="px-6 pt-24 pb-20 text-center max-w-4xl mx-auto">
        <span className="inline-block text-xs font-medium tracking-widest text-gray-400 uppercase mb-6">
          Developer Social — No noise
        </span>
        <h1 className="text-5xl sm:text-6xl font-semibold text-gray-900 leading-tight mb-6">
          The feed that only<br />
          <span className="border-b-2 border-gray-900">speaks code</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Coduex is where developers post, rant, share, and learn — without the lifestyle noise.
          Every post is relevant because every person here writes code.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/signup"
            className="px-7 py-3 text-sm font-medium border border-gray-900 text-gray-900 rounded-lg"
          >
            Join for free
          </Link>
          <Link
            to="/login"
            className="px-7 py-3 text-sm text-gray-500 hover:text-gray-900"
          >
            Already have an account →
          </Link>
        </div>
      </section>

      {/* Mock feed preview */}
      <section className="px-6 pb-20 max-w-2xl mx-auto">
        <p className="text-xs text-gray-400 text-center mb-6 tracking-widest uppercase">What your feed looks like</p>
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold select-none" style={getAvatarStyle(post.name)}>
                  {post.avatar}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{post.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{post.time}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs text-gray-400">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 text-center mb-12 tracking-widest uppercase">Why developers stay</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-0.5 text-gray-400 shrink-0">{f.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 px-6 py-24 text-center">
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">Ready to join?</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          No verification gate. Sign up with a username and email — your code does the talking.
        </p>
        <Link
          to="/signup"
          className="inline-block px-8 py-3 text-sm font-medium border border-gray-900 text-gray-900 rounded-lg"
        >
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center">
        <span className="text-xs text-gray-400">© {new Date().getFullYear()} Coduex. Built for developers, by developers.</span>
      </footer>
    </div>
  );
}
