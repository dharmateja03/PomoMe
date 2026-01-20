import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllBlogPosts } from '@/lib/blog-data';

export const metadata = {
  title: 'Blog - PomodoMe | Productivity Tips & Focus Strategies',
  description: 'Expert tips on productivity, time management, focus techniques, and the Pomodoro method. Learn how to work smarter and achieve more.',
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-[#010101]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#010101]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Pomodo<span className="bg-gradient-to-r from-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">Me</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-white font-medium">
              Blog
            </Link>
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          The Focus Blog
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Expert insights on productivity, focus, and making the most of your time.
        </p>
      </div>

      {/* Featured Post */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <Link href={`/blog/${posts[0].slug}`}>
          <div className="group relative p-8 md:p-12 bg-white/5 rounded-3xl border border-white/10 hover:border-white/20 transition-all">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-[#983AD6]/20 text-[#FA93FA] text-sm rounded-full mb-4">
                  {posts[0].category}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#C967E8] transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  {posts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span>{posts[0].author}</span>
                  <span>•</span>
                  <span>{posts[0].readTime}</span>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center w-48 h-48 bg-gradient-to-br from-[#FA93FA]/20 to-[#983AD6]/20 rounded-2xl">
                <span className="text-6xl">📚</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* All Posts Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white mb-8">All Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article className="group h-full p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                <span className="inline-block px-2 py-1 bg-white/10 text-zinc-400 text-xs rounded mb-4">
                  {post.category}
                </span>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-[#C967E8] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>{post.readTime}</span>
                  <span className="flex items-center gap-1 text-[#FA93FA] opacity-0 group-hover:opacity-100 transition-opacity">
                    Read more <ArrowRight size={12} />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="p-8 md:p-12 bg-gradient-to-r from-[#FA93FA]/10 via-[#C967E8]/5 to-[#983AD6]/10 rounded-3xl border border-white/10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to improve your focus?
          </h2>
          <p className="text-zinc-400 mb-8">
            Put these techniques into practice with PomodoMe&apos;s intelligent focus timer.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
          >
            Start Free <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xl font-bold text-white">
            Pomodo<span className="bg-gradient-to-r from-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">Me</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
          </div>
          <div className="text-sm text-zinc-600">
            © 2026 PomodoMe
          </div>
        </div>
      </footer>
    </div>
  );
}
