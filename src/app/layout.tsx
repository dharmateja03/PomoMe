import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PomodoMe | Focus Timer & Productivity Tracker",
  description: "Boost your productivity with PomodoMe - the modern pomodoro timer with collaborative study rooms, goal tracking, and detailed analytics. Study together with friends in real-time.",
  keywords: ["pomodoro timer", "focus timer", "productivity app", "study together", "collaborative studying", "time tracking", "goal tracking", "focus sessions"],
  authors: [{ name: "PomodoMe" }],
  creator: "PomodoMe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pomodome.app",
    siteName: "PomodoMe",
    title: "PomodoMe | Focus Timer & Productivity Tracker",
    description: "Boost your productivity with PomodoMe - the modern pomodoro timer with collaborative study rooms, goal tracking, and detailed analytics.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PomodoMe - Focus Timer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PomodoMe | Focus Timer & Productivity Tracker",
    description: "Boost your productivity with PomodoMe - the modern pomodoro timer with collaborative study rooms and analytics.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
