"use client"
import React, { useState, useEffect } from 'react';
import { signIn } from '@/lib/auth-client';
import {
  TerminalIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  GitPullRequestIcon,
  CodeIcon,
  ZapIcon,
  DatabaseIcon,
  LockIcon,
  CheckIcon,
  SparklesIcon,
  ActivityIcon,
  CreditCardIcon
} from 'lucide-react';

const GithubIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const terminalSteps = [
  { text: "$ code-audit init --repo realSahilYadav/code-audit", delay: 1000 },
  { text: "✓ Repository connected successfully.", delay: 800 },
  { text: "→ Repository ID registered: repo_clt9abcde123", delay: 600 },
  { text: "→ Webhook handshake verified with GitHub...", delay: 800 },
  { text: "$ code-audit sync --branch main", delay: 1200 },
  { text: "⚙ Parsing files (stripping static assets & configs)...", delay: 900 },
  { text: "✓ Found 24 source code files to index.", delay: 600 },
  { text: "⚙ Generating codebase embeddings via text-embedding-2...", delay: 1100 },
  { text: "✓ Chunk vectors computed (dimensions: 768).", delay: 500 },
  { text: "⚙ Uploading vectors to Pinecone Index...", delay: 900 },
  { text: "✓ Pinecone Vector DB sync complete.", delay: 600 },
  { text: "$ listen --events pull_request.opened", delay: 1000 },
  { text: "⚓ Webhook received: PR #42 (feature/auth-login)", delay: 800 },
  { text: "⚙ Triggering reviewPullRequest() workflow on Inngest...", delay: 900 },
  { text: "⚙ Gemini 3.5 Flash executing code review and security sweep...", delay: 1300 },
  { text: "✓ Walkthrough generated.", delay: 400 },
  { text: "✓ Vulnerability Scan: 0 vulnerabilities found.", delay: 500 },
  { text: "✓ Mermaid.js sequence flow mapped.", delay: 400 },
  { text: "✓ Final check complete. PR audit passed!", delay: 1000 },
];

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Terminal simulator logic
  useEffect(() => {
    if (currentStepIdx < terminalSteps.length) {
      const timer = setTimeout(() => {
        setVisibleSteps(prev => [...prev, terminalSteps[currentStepIdx].text]);
        setCurrentStepIdx(prev => prev + 1);
      }, terminalSteps[currentStepIdx].delay);
      return () => clearTimeout(timer);
    } else {
      // Loop simulator with a reset delay
      const resetTimer = setTimeout(() => {
        setVisibleSteps([]);
        setCurrentStepIdx(0);
      }, 5000);
      return () => clearTimeout(resetTimer);
    }
  }, [currentStepIdx]);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/"
      });
    } catch (error) {
      console.error("Login error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09080F] text-zinc-100 flex flex-col font-sans selection:bg-primary/30 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-[#09080F]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20 shadow-[0_0_15px_rgba(154,52,18,0.05)]">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold text-xl tracking-tight bg-linear-to-r from-white via-zinc-200 to-primary bg-clip-text text-transparent">
              CodeAudit
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#limits" className="hover:text-white transition-colors">Tier Limits</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub docs</a>
          </nav>

          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="group inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-lg transition-all text-zinc-300 hover:text-white"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 py-16 md:py-24 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">

          {/* Hero Left: Title and Action */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>AI-Powered Pull Request Auditor</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Automated Code Auditing <br />
              <span className="bg-linear-to-r from-primary via-indigo-400 to-pink-500 bg-clip-text text-transparent">
                Driven by LLMs
              </span>
            </h1>

            <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl">
              Connect your GitHub repositories in one click. Receive deep semantic analysis, vulnerability sweeps, and beautiful workflow sequence flows on every Pull Request. Powered by Inngest, Pinecone RAG, and better-auth.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <GithubIcon className="w-5 h-5" />
                )}
                <span>Sign In with GitHub</span>
                <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#features"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 font-semibold rounded-xl text-zinc-300 hover:text-white transition-all"
              >
                Learn More
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-zinc-500 border-t border-zinc-900 w-full">
              <div className="flex items-center gap-1.5">
                <LockIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Secure OAuth Connection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ActivityIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>99.9% Audit Uptime</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Mock Terminal */}
          <div className="lg:col-span-5 w-full">
            <div className="w-full bg-[#0D0B14] rounded-2xl border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">

              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#08070C] border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>pr-audit-pipeline.sh</span>
                </div>
                <div className="w-12" /> {/* spacer */}
              </div>

              {/* Terminal Body */}
              <div className="p-5 font-mono text-xs sm:text-[13px] h-[340px] overflow-y-auto space-y-2.5 custom-scrollbar text-zinc-300">
                {visibleSteps.map((line, idx) => {
                  let textClass = "text-zinc-300";
                  if (line.startsWith("$")) textClass = "text-primary font-bold";
                  else if (line.startsWith("✓")) textClass = "text-emerald-400";
                  else if (line.startsWith("→")) textClass = "text-blue-400";
                  else if (line.startsWith("⚙")) textClass = "text-purple-400 animate-pulse";
                  else if (line.startsWith("⚓")) textClass = "text-amber-400";

                  return (
                    <div key={idx} className={`${textClass} leading-relaxed`}>
                      {line}
                    </div>
                  );
                })}
                {currentStepIdx < terminalSteps.length && (
                  <div className="inline-block w-2 h-4 bg-zinc-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid Section */}
        <section id="features" className="w-full pt-32 pb-16">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl font-bold text-white">Full-Stack Code Audit Architecture</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              CodeAudit is engineered on top of modern systems built for durability, speed, and deep LLM comprehension.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">

            {/* Feature 1: Webhooks */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all hover:translate-y-[-2px] group">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                <GitPullRequestIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Automated PR Hooks</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Listens directly to GitHub Webhooks. Analyzes diffs instantly on every Pull Request creation or synchronization.
              </p>
            </div>

            {/* Feature 2: Pinecone RAG */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all hover:translate-y-[-2px] group">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                <DatabaseIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">RAG Context Engine</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Indexes codebases semantically into Pinecone using text-embedding-2. Pull Request diffs query semantic matches for deep code context.
              </p>
            </div>

            {/* Feature 3: Inngest */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all hover:translate-y-[-2px] group">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary w-fit mb-6 group-hover:scale-110 transition-transform">
                <ZapIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Background Workflows</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Uses Inngest to orchestrate resilient, durable, and rate-limited backend steps. Recovers safely from errors or GitHub API bottlenecks.
              </p>
            </div>

            {/* Feature 4: Better Auth */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-all hover:translate-y-[-2px] group">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                <CodeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Better Auth + GitHub</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Zero-friction authentication coupled with OAuth. Safely fetches user scopes and details with high encryption.
              </p>
            </div>

          </div>
        </section>

        {/* Tier Limits / Info Section */}
        <section id="limits" className="w-full py-16 border-t border-zinc-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CreditCardIcon className="w-3.5 h-3.5" />
                <span>Flexible Subscription Tiers</span>
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">
                Simple Pricing & <br />Usage Gatekeeping
              </h2>
              <p className="text-zinc-400">
                We enforce database-backed limits. Get started for free, and upgrade to Pro powered by Polar.sh.
              </p>

              <ul className="space-y-3.5 text-zinc-400 text-sm">
                <li className="flex items-center gap-3">
                  <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                  <span>Secure authorization using GitHub scopes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                  <span>Prisma 7 Postgres connection tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    <CheckIcon className="w-4 h-4" />
                  </div>
                  <span>Automatic entitlement validation checks</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Free Tier Card */}
              <div className="bg-[#0D0B14] border border-zinc-800 rounded-2xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <h4 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Free Tier</h4>
                  <p className="text-2xl font-bold text-white mt-2">$0 <span className="text-sm text-zinc-500 font-normal">/ forever</span></p>
                </div>
                <div className="h-px bg-zinc-800" />
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>Up to 1 repository</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>5 evaluations per repository</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>Gemini 2.5 AI scanning</span>
                  </li>
                </ul>
                <button
                  onClick={handleGitHubLogin}
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-xl transition-all font-semibold text-xs text-zinc-200"
                >
                  Start Auditing Free
                </button>
              </div>

              {/* Pro Tier Card */}
              <div className="bg-[#0D0B14] border border-primary/40 rounded-2xl p-8 space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] font-bold tracking-widest uppercase rounded-bl-xl">
                  Popular
                </div>
                <div>
                  <h4 className="text-primary text-sm font-semibold uppercase tracking-wider">Pro Tier</h4>
                  <p className="text-2xl font-bold text-white mt-2">$44.99 <span className="text-sm text-zinc-500 font-normal">/ month</span></p>
                </div>
                <div className="h-px bg-zinc-800" />
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-primary" />
                    <span>Infinite repository connections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-primary" />
                    <span>Unlimited PR evaluations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-primary" />
                    <span>Priority background queues</span>
                  </li>
                </ul>
                <button
                  onClick={handleGitHubLogin}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-semibold text-xs shadow-md shadow-primary/25"
                >
                  Get Pro Entitlement
                </button>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#07060C] py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2.5">
            <ShieldCheckIcon className="w-5 h-5 text-zinc-400" />
            <span className="font-semibold text-zinc-300">CodeAudit</span>
            <span className="text-zinc-600">|</span>
            <span>AI Code Integrity Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Powered by Bun, Prisma & Neon</span>
            <span>© {new Date().getFullYear()} CodeAudit. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginUI;