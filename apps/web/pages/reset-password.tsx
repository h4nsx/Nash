import { useState, useEffect, useId } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const emailInputId = useId();
  const tokenInputId = useId();
  const newPasswordInputId = useId();
  const confirmPasswordInputId = useId();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (router.isReady) {
      if (typeof router.query.email === 'string') {
        setEmail(router.query.email);
      }
      if (typeof router.query.token === 'string') {
        setToken(router.query.token);
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Đặt lại mật khẩu thất bại.');
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Đặt Lại Mật Khẩu | NASH</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-block w-full text-center text-3xl font-black tracking-tight text-foreground mb-4">
          NASH
        </Link>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground">
          Tạo mật khẩu mới
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Nhập mã xác nhận và thiết lập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-sm border border-border sm:rounded-xl sm:px-10">
          {status === 'success' ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-800">Đặt lại mật khẩu thành công!</p>
                  <p className="mt-1 text-emerald-700">
                    Bây giờ bạn đã có thể đăng nhập bằng mật khẩu mới của mình.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-xs transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {status === 'error' && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-900 flex items-start gap-2.5 text-sm">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div>
                <label htmlFor={emailInputId} className="block text-sm font-semibold text-foreground">
                  Email
                </label>
                <input
                  id={emailInputId}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tenban@example.com"
                  className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label htmlFor={tokenInputId} className="block text-sm font-semibold text-foreground">
                  Mã xác thực (Token)
                </label>
                <input
                  id={tokenInputId}
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Dán mã bảo mật từ email"
                  className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label htmlFor={newPasswordInputId} className="block text-sm font-semibold text-foreground">
                  Mật khẩu mới
                </label>
                <div className="relative mt-1.5">
                  <input
                    id={newPasswordInputId}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="block w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor={confirmPasswordInputId} className="block text-sm font-semibold text-foreground">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id={confirmPasswordInputId}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Hủy & Quay lại Đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

