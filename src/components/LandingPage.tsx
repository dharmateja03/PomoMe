'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Hls from 'hls.js';
import { ArrowRight, Zap, Users, Clock, Target, BarChart3, Star, Check } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Customizable Sessions',
    description: 'Tailor your focus blocks from 15 to 180 minutes. Your rhythm, your rules.',
  },
  {
    icon: Users,
    title: 'Virtual Co-Working',
    description: 'Invite friends to study rooms with synced timers and live presence.',
  },
  {
    icon: Target,
    title: 'Smart Goal Setting',
    description: 'Define weekly hour targets by category and crush them consistently.',
  },
  {
    icon: BarChart3,
    title: 'Insightful Analytics',
    description: 'Visualize your focus habits with charts, streaks, and progress reports.',
  },
];

const testimonials = [
  {
    name: 'Alex Rivera',
    role: 'Product Designer',
    image: 'AR',
    content: 'The best focus tool I have used. Categories let me see exactly where my time goes each week.',
    rating: 5,
  },
  {
    name: 'Jordan Lee',
    role: 'CS Student',
    image: 'JL',
    content: 'Study Together changed my remote learning. My friends and I stay accountable every session.',
    rating: 5,
  },
  {
    name: 'Sam Patel',
    role: 'Startup Founder',
    image: 'SP',
    content: 'Clean design, zero distractions. Exactly what I needed to get deep work done.',
    rating: 5,
  },
];

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsUrl = 'https://customer-cbeadsgr09pnsezs.cloudflarestream.com/697945ca6b876878dba3b23fbd2f1561/manifest/video.m3u8';
    const fallbackUrl = '/_videos/v1/f0c78f536d5f21a047fb7792723a36f9d647daa1';

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          video.src = fallbackUrl;
        }
      });
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('error', () => {
        video.src = fallbackUrl;
      });
    } else {
      video.src = fallbackUrl;
    }
  }, []);

  return (
    <div className="relative w-full -mt-[150px] z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#010101] via-transparent to-[#010101] z-10 pointer-events-none" />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto mix-blend-screen"
      />
    </div>
  );
}

function AnnouncementPill() {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-[rgba(28,27,36,0.15)] backdrop-blur-sm rounded-full border border-white/10 mb-8">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6] rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6] rounded-lg blur-lg opacity-50" />
      </div>
      <span className="text-sm text-white/70">New: Virtual co-working rooms are live</span>
    </div>
  );
}

function CTAButton() {
  return (
    <Link href="/signup" className="group relative inline-flex">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] rounded-full blur opacity-30 group-hover:opacity-50 transition" />
      <div className="relative flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all">
        <span>Get Started Free</span>
        <div className="w-8 h-8 bg-gradient-to-br from-[#FA93FA] via-[#C967E8] to-[#983AD6] rounded-full flex items-center justify-center">
          <ArrowRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}


export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#010101]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#010101]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Pomodo<span className="bg-gradient-to-r from-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">Me</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/10 hover:bg-white/20 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-0 px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#983AD6]/20 via-[#C967E8]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-[#FA93FA]/10 rounded-full blur-3xl" />
          <div className="absolute top-60 right-1/4 w-[300px] h-[300px] bg-[#983AD6]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <AnnouncementPill />

          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold leading-tight mb-6 tracking-tight">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Deep Work,
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">
              Made Simple.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            A pomodoro timer built for how you actually work. Organize focus sessions by project,
            co-work with friends, and see real progress every week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAButton />
            <Link
              href="/blog/study-together-collaborative-focus"
              className="flex items-center gap-2 px-8 py-4 text-white/60 hover:text-white font-medium transition-colors"
            >
              See how co-working works
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Hero Video */}
        <HeroVideo />
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Built for Focused Minds
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              No clutter. No distractions. Just the tools you need to do your best work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FA93FA]/5 via-transparent to-[#983AD6]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FA93FA]/20 to-[#983AD6]/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon size={24} className="text-[#C967E8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Start in Seconds
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create a Category', desc: 'Label your projects—code, study, design, whatever you do' },
              { step: '02', title: 'Set Your Timer', desc: 'Pick a focus block that fits your flow and hit start' },
              { step: '03', title: 'See Your Growth', desc: 'Track hours logged and hit your weekly targets' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-b from-[#983AD6]/30 to-transparent bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Together Feature Highlight */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-[#FA93FA]/10 via-[#C967E8]/5 to-[#983AD6]/10 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#FA93FA]/20 to-transparent rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#983AD6]/20 rounded-full border border-[#983AD6]/30 mb-6">
                  <Users size={14} className="text-[#C967E8]" />
                  <span className="text-sm text-[#FA93FA]">New Feature</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                  Co-Work Anywhere
                </h2>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Create a room, share the link, and focus alongside your crew.
                  Synced timers and live presence keep everyone locked in together.
                </p>
                <ul className="space-y-3 mb-8">
                  {['One timer synced for everyone', 'See who is actively focusing', 'Share a link to invite others', 'Host manages the session'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white/60">
                      <Check size={16} className="text-[#C967E8]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
                >
                  Create a Room
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="relative">
                <div className="aspect-square max-w-[300px] mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FA93FA]/20 to-[#983AD6]/20 rounded-full blur-2xl" />
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 h-full flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FA93FA] to-[#983AD6] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        JD
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C967E8] to-[#983AD6] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        SC
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FA93FA] to-[#C967E8] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        MR
                      </div>
                      <span className="text-white/50 text-sm">+2 more</span>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-light text-white tabular-nums mb-1">18:45</div>
                      <div className="text-sm text-[#C967E8] uppercase tracking-wider">Focus Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                What People Are Saying
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-[#FA93FA] fill-[#FA93FA]" />
                  ))}
                </div>
                <p className="text-white/70 mb-6 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FA93FA] to-[#983AD6] rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {t.image}
                  </div>
                  <div>
                    <div className="text-white font-medium">{t.name}</div>
                    <div className="text-sm text-white/40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FA93FA]/10 via-transparent to-[#983AD6]/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-white via-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">
                  Ready to Do Your Best Work?
                </span>
              </h2>
              <p className="text-white/50 mb-8 max-w-lg mx-auto">
                Join focused people everywhere. Free to use, no credit card required.
              </p>
              <CTAButton />
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/40">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-[#C967E8]" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-[#C967E8]" />
                  Free forever
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-[#C967E8]" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-bold text-white">
              Pomodo<span className="bg-gradient-to-r from-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">Me</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-white/40">
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
            </div>
            <div className="text-sm text-white/30">
              © 2026 PomodoMe. Focus better.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
