'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { CheckCircle2, AlertCircle, RefreshCw, Terminal, Layers, ShieldCheck, Database } from 'lucide-react';

interface MetaData {
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export default function HomePage() {
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkApiHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient<MetaData>('/meta');
      if (res.data) {
        setMeta(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to NASH API';
      setError(msg);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadMeta() {
      try {
        const res = await apiClient<MetaData>('/meta');
        if (!ignore && res.data) {
          setMeta(res.data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Unable to connect to NASH API';
          setError(msg);
          setMeta(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMeta();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Phase 0 — Foundation Baseline Active
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-zinc-900 dark:text-white">
          NASH
        </h1>
        <p className="mt-2 text-xl font-medium tracking-wide text-zinc-600 dark:text-zinc-400">
          Network · Ability · Skills · Human
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          A production-oriented freelance marketplace and content management platform built with enterprise-style modular monolith architecture, strict security boundaries, and automated testing.
        </p>
      </div>

      {/* Live System Diagnostics / API Health Ping Card */}
      <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">
              Backend API Diagnostics (/api/v1/meta)
            </h2>
          </div>
          <button
            onClick={() => checkApiHealth()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Re-test
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center gap-3 py-4 text-sm text-zinc-500">
              <RefreshCw className="h-4 w-4 animate-spin text-zinc-400" />
              <span>Connecting to backend API service...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium">Backend API Offline / Standby</p>
                  <p className="mt-1 text-xs opacity-90">{error}</p>
                  <p className="mt-2 text-xs font-mono bg-amber-100/70 dark:bg-amber-900/40 p-1.5 rounded">
                    Start backend: dotnet run --project src/Api
                  </p>
                </div>
              </div>
            </div>
          ) : meta ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span>Backend Connected Successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-zinc-500">Service</span>
                  <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{meta.service}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-zinc-500">Version</span>
                  <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{meta.version}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-zinc-500">Environment</span>
                  <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{meta.environment}</p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-zinc-500">Timestamp</span>
                  <p className="font-mono text-zinc-900 dark:text-white mt-0.5 truncate">
                    {new Date(meta.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Architectural Pillars */}
      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Layers className="h-6 w-6 text-zinc-800 dark:text-zinc-200 mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Clean Architecture</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Strict separation across Domain, Application, Infrastructure, and API layers with zero circular dependencies.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ShieldCheck className="h-6 w-6 text-zinc-800 dark:text-zinc-200 mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Enterprise Security</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            ASP.NET Core Identity with JWT & refresh token rotation, strict RBAC, and server-side resource authorization.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Database className="h-6 w-6 text-zinc-800 dark:text-zinc-200 mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Relational Integrity</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            PostgreSQL with Entity Framework Core code-first migrations, ACID transactions, and deterministic state transitions.
          </p>
        </div>
      </div>

      {/* Core Lifecycle Workflow */}
      <div className="mt-16 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white mb-4">
          Core Marketplace Lifecycle Flow
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="rounded bg-zinc-200 px-2.5 py-1.5 dark:bg-zinc-800">1. Client Project</span>
          <span className="text-zinc-400">→</span>
          <span className="rounded bg-zinc-200 px-2.5 py-1.5 dark:bg-zinc-800">2. Proposal</span>
          <span className="text-zinc-400">→</span>
          <span className="rounded bg-zinc-200 px-2.5 py-1.5 dark:bg-zinc-800">3. Selection</span>
          <span className="text-zinc-400">→</span>
          <span className="rounded bg-zinc-200 px-2.5 py-1.5 dark:bg-zinc-800">4. Contract</span>
          <span className="text-zinc-400">→</span>
          <span className="rounded bg-zinc-200 px-2.5 py-1.5 dark:bg-zinc-800">5. Milestones</span>
          <span className="text-zinc-400">→</span>
          <span className="rounded bg-zinc-200 px-2.5 py-1.5 dark:bg-zinc-800">6. Review</span>
        </div>
      </div>
    </div>
  );
}
