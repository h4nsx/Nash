import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  // Additional client-side protection just in case
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [user, isInitialized, router]);

  if (!isInitialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Chào mừng, {user.lastName} {user.firstName}. Vai trò của bạn là {user.role === 'Admin' ? 'Quản Trị Viên' : user.role === 'Client' ? 'Khách Hàng' : 'Chuyên Gia'}.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nội dung dashboard sẽ được xây dựng tại đây.
          </p>
        </div>
      </div>
    </div>
  );
}
