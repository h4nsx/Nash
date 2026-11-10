import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

export function Navbar() {
  const { user, logout, isInitialized } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 relative">
        
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-black tracking-tight text-foreground hover:text-primary transition-colors">
            NASH
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary absolute left-1/2 -translate-x-1/2">
          <Link href="/projects" className="transition-colors hover:text-foreground">
            Tìm việc
          </Link>
          <Link href="/freelancers" className="transition-colors hover:text-foreground">
            Tìm người làm
          </Link>
          <Link href="/categories" className="transition-colors hover:text-foreground">
            Danh mục
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          {isInitialized && user ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
              >
                Chào, <span className="font-semibold text-foreground">{user.lastName} {user.firstName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:bg-surface-subtle hover:text-foreground cursor-pointer"
              >
                Đăng Xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
              >
                Đăng Nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-1.5 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
