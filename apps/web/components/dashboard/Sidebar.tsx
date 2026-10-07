import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderKanban, 
  UserCircle, 
  Settings, 
  Handshake,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Navigation for Freelancer (Chuyên Gia)
  const freelancerLinks = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Công việc của tôi', href: '/dashboard/work', icon: Briefcase },
    { name: 'Lời mời & Ghép nối', href: '/dashboard/matches', icon: Handshake },
    { name: 'Dự án đã lưu', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Hồ sơ chuyên gia', href: '/dashboard/profile', icon: UserCircle },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
  ];

  // In the future, we can add clientLinks and conditionally render based on user?.role
  const links = freelancerLinks;

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 font-mono font-bold text-white shadow dark:bg-white dark:text-zinc-900">
            N
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">NASH</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map((link) => {
          // Check if active route (exact match for /dashboard, startsWith for others)
          const isActive = link.href === '/dashboard' 
            ? router.pathname === '/dashboard'
            : router.pathname.startsWith(link.href);
            
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
