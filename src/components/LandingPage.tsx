'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Target, BarChart3, Zap, Users, Shield, ChevronRight, Star, Check } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Flexible Timer',
    description: 'Set custom durations from 15 minutes to 3 hours. Work your way.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set weekly targets for each category and watch your progress grow.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Understand your patterns with detailed insights and streaks.',
  },
  {
    icon: Zap,
    title: 'Zero Distractions',
    description: 'Clean interface designed to keep you in the zone.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    image: 'SC',
    content: 'Finally, a focus timer that actually understands how I work. The category system is genius.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Graduate Student',
    image: 'MJ',
    content: 'Helped me track 200+ hours of thesis work. The analytics kept me accountable.',
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Freelance Designer',
    image: 'ER',
    content: 'Simple, beautiful, effective. I recommend it to all my creative friends.',
    rating: 5,
  },
];

const stats = [
  { value: '50K+', label: 'Focus Sessions' },
  { value: '12K+', label: 'Hours Tracked' },
  { value: '4.9', label: 'User Rating' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Pomodo<span className="text-orange-400">Me</span>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-orange-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700/50 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-zinc-400">Now with custom durations & sounds</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Focus deeper.
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Achieve more.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The pomodoro timer that adapts to your workflow. Track focus sessions by category,
            set weekly goals, and watch your productivity transform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
            >
              Start Focusing Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blog/pomodoro-technique-guide"
              className="flex items-center gap-2 px-8 py-4 text-zinc-400 hover:text-white font-medium transition-colors"
            >
              Learn the technique
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-16 pt-16 border-t border-zinc-800/50">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-2 shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-700/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
            </div>
            <div className="aspect-[16/10] bg-gradient-to-b from-zinc-900 to-[#09090b] rounded-b-xl flex items-center justify-center">
              {/* Timer Preview */}
              <div className="text-center">
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#27272a" strokeWidth="6" />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="url(#preview-gradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={565}
                      strokeDashoffset={141}
                    />
                    <defs>
                      <linearGradient id="preview-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-light text-white tabular-nums">18:45</span>
                    <span className="text-sm text-zinc-500 mt-1 uppercase tracking-widest">Focus Time</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-full">Deep Work</span>
                  <span className="px-4 py-1.5 bg-zinc-800 text-zinc-400 text-sm rounded-full">Reading</span>
                  <span className="px-4 py-1.5 bg-zinc-800 text-zinc-400 text-sm rounded-full">Exercise</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to stay focused
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Built for people who take their time seriously. No fluff, just results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-zinc-900/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple as 1, 2, 3
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a category', desc: 'Create categories for different types of work' },
              { step: '02', title: 'Start the timer', desc: 'Choose your duration and begin focusing' },
              { step: '03', title: 'Track progress', desc: 'Watch your hours add up toward your goals' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-6xl font-bold text-zinc-800 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by focused people
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 mb-6 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {t.image}
                  </div>
                  <div>
                    <div className="text-white font-medium">{t.name}</div>
                    <div className="text-sm text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 rounded-3xl border border-zinc-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your focus?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              Join thousands who&apos;ve already improved their productivity. Free forever for personal use.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all"
              >
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                Free forever
              </span>
              <span className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-bold text-white">
              Pomodo<span className="text-orange-400">Me</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-zinc-500">
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
            </div>
            <div className="text-sm text-zinc-600">
              © 2025 PomodoMe. Focus better.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
