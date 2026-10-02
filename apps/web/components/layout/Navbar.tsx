import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 font-mono text-lg font-bold text-white shadow dark:bg-white dark:text-zinc-900">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              NASH
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link
              href="/projects"
              className="transition hover:text-zinc-900 dark:hover:text-white"
            >
              Browse Projects
            </Link>
            <Link
              href="/freelancers"
              className="transition hover:text-zinc-900 dark:hover:text-white"
            >
              Find Talent
            </Link>
            <Link
              href="/categories"
              className="transition hover:text-zinc-900 dark:hover:text-white"
            >
              Categories
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
