export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-12 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-white">NASH</span>
            <span>—</span>
            <span className="text-xs text-zinc-500">
              Mạng Lưới · Khả Năng · Kỹ Năng · Con Người
            </span>
          </div>
          <div className="flex gap-6 text-xs">
            <span>Kiến trúc Modular Monolith</span>
            <span>•</span>
            <span>Clean Architecture</span>
            <span>•</span>
            <span>ASP.NET Core & Next.js</span>
          </div>
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Nền tảng NASH. Giai đoạn 0: Khởi tạo.
          </p>
        </div>
      </div>
    </footer>
  );
}
