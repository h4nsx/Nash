'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient<{ role: string; email: string; firstName: string; lastName: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.success && res.data) {
        // Save to global auth state
        login(res.data);
        
        // Redirect based on redirect query or role
        const redirectUrl = typeof router.query.redirect === 'string' ? router.query.redirect : null;
        if (redirectUrl && redirectUrl.startsWith('/')) {
          router.push(redirectUrl);
        } else if (res.data.role === 'Admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        const errorDetails = err.error.errors 
          ? Object.values(err.error.errors).flat().join(' ')
          : '';
        setError(`${err.error.message || 'Đăng nhập thất bại.'} ${errorDetails}`.trim());
      } else {
        console.error(err);
        setError('Không thể kết nối đến máy chủ hoặc có lỗi xảy ra.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      
      <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Trang chủ
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-3xl font-black tracking-tight text-foreground mb-2">
            NASH
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Đăng nhập
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Truy cập tài khoản NASH của bạn
          </p>
        </div>

        {router.query.session_expired && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="font-medium">Phiên làm việc đã hết hạn sau một thời gian không hoạt động. Vui lòng đăng nhập lại để tiếp tục.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
              placeholder="bạn@vidu.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Mật khẩu
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary-hover">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-white dark:focus:ring-offset-zinc-900"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng Nhập'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
