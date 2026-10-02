export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Log In</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Authentication will be activated in Phase 1 (ASP.NET Core Identity & JWT).
        </p>
      </div>
    </div>
  );
}
