import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/auth/AuthContext';

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Tổng quan
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Chào mừng trở lại, {user?.lastName} {user?.firstName}. Dưới đây là thông tin hoạt động của bạn.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stat Card 1 */}
          <Link
            href="/dashboard/work"
            className="group block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Công việc đang thực hiện</h3>
              <span className="text-xs font-semibold text-emerald-600 transition group-hover:translate-x-0.5 dark:text-emerald-400">
                Chi tiết →
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">0</p>
          </Link>
          {/* Stat Card 2 */}
          <Link
            href="/dashboard/matches"
            className="group block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Lời mời ghép nối</h3>
              <span className="text-xs font-semibold text-emerald-600 transition group-hover:translate-x-0.5 dark:text-emerald-400">
                Chi tiết →
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">0</p>
          </Link>
          {/* Stat Card 3 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Dự án đã ứng tuyển</h3>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">0</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
