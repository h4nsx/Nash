import { useAuth } from '@/lib/auth/AuthContext';
import { Bell, Search } from 'lucide-react';

export function Topbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dự án, tin nhắn..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-emerald-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-rose-500"></span>
        </button>
        
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>
        
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 shadow-sm dark:bg-emerald-900/50 dark:text-emerald-400">
            {user?.lastName?.[0] || 'U'}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {user?.lastName} {user?.firstName}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {user?.role === 'Freelancer' ? 'Chuyên Gia' : user?.role === 'Client' ? 'Khách Hàng' : user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
