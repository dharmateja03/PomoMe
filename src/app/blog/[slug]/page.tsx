import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, User } from 'lucide-react';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${post.title} | PomodoMe Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const nextPost = allPosts[currentIndex + 1];
  const prevPost = allPosts[currentIndex - 1];

  return (
    <div className="min-h-screen bg-[#010101]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#010101]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Pomodo<span className="bg-gradient-to-r from-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">Me</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">
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

      {/* Article */}
      <article className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <span className="inline-block px-3 py-1 bg-[#983AD6]/20 text-[#FA93FA] text-sm rounded-full mb-6">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-zinc-400 mb-8">{post.excerpt}</p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <User size={16} />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} />
                {post.readTime}
              </span>
              <span>{new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-zinc prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-white
            prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-6
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-zinc-300
            prose-strong:text-white
            prose-a:text-[#FA93FA] prose-a:no-underline hover:prose-a:underline
            prose-code:text-[#C967E8] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-blockquote:border-[#983AD6] prose-blockquote:text-zinc-400
          ">
            {post.content.split('\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('# ')) {
                return <h1 key={index}>{trimmed.slice(2)}</h1>;
              }
              if (trimmed.startsWith('## ')) {
                return <h2 key={index}>{trimmed.slice(3)}</h2>;
              }
              if (trimmed.startsWith('### ')) {
                return <h3 key={index}>{trimmed.slice(4)}</h3>;
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return <li key={index}>{trimmed.slice(2)}</li>;
              }
              if (trimmed.match(/^\d+\./)) {
                return <li key={index}>{trimmed.replace(/^\d+\.\s*/, '')}</li>;
              }
              if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return <p key={index}><strong>{trimmed.slice(2, -2)}</strong></p>;
              }

              // Handle inline bold
              const withBold = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
              return <p key={index} dangerouslySetInnerHTML={{ __html: withBold }} />;
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-[#FA93FA]/10 via-[#C967E8]/5 to-[#983AD6]/10 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">
              Ready to put this into practice?
            </h3>
            <p className="text-zinc-400 mb-6">
              Track your focus sessions, set goals, and build better habits with PomodoMe.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
            >
              Start Free <ArrowRight size={18} />
            </Link>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-12 border-t border-white/10 grid md:grid-cols-2 gap-6">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group">
                <span className="text-sm text-zinc-500 mb-2 block">← Previous</span>
                <span className="text-white group-hover:text-[#C967E8] transition-colors">
                  {prevPost.title}
                </span>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group text-right md:col-start-2">
                <span className="text-sm text-zinc-500 mb-2 block">Next →</span>
                <span className="text-white group-hover:text-[#C967E8] transition-colors">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      </article>

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
