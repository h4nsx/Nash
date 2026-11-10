import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Award,
  Settings,
  Handshake,
  LogOut,
  X,
  User,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Navigation items based on role
  const isClient = user?.role === 'Client';

  const links = isClient
    ? [
        { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Dự án & Tìm người làm', href: '/dashboard/client/projects', icon: FolderKanban },
        { name: 'Hợp đồng & Nghiệm thu', href: '/dashboard/work', icon: Briefcase },
        { name: 'Lời mời & Bắt tay', href: '/dashboard/matches', icon: Handshake },
        { name: 'Cài đặt tài khoản', href: '/dashboard/settings', icon: Settings },
      ]
    : [
        { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Việc đang làm & Mốc nộp', href: '/dashboard/work', icon: Briefcase },
        { name: 'Lời mời nhận được', href: '/dashboard/matches', icon: Handshake },
        { name: 'Tìm việc & Xem dự án', href: '/dashboard/projects', icon: FolderKanban },
        { name: 'Hồ sơ cá nhân', href: '/dashboard/profile/edit', icon: User },
        { name: 'Bài thi kỹ năng', href: '/dashboard/profile', icon: Award },
        { name: 'Cài đặt tài khoản', href: '/dashboard/settings', icon: Settings },
      ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border">
        <Link href="/" className="text-xl font-black tracking-tight text-foreground hover:text-primary transition-colors">
          NASH
        </Link>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-text-muted hover:text-foreground hover:bg-surface-subtle md:hidden"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {links.map((link) => {
          const isActive =
            link.href === '/dashboard'
              ? router.pathname === '/dashboard'
              : router.pathname.startsWith(link.href);

          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'text-text-secondary hover:bg-surface-subtle hover:text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-text-muted'}`} />
              <span className="truncate">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Status Card & Sign Out */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-subtle border border-border/60">
          <div className="h-8 w-8 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {user?.lastName?.[0] || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-foreground truncate">
              {user?.lastName} {user?.firstName}
            </div>
            <div className="text-2xs text-text-muted truncate">
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </aside>
  );
}
