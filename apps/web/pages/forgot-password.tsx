import { useState, useId } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const emailInputId = useId();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [mockResetToken, setMockResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
      }

      setStatus('success');
      if (data.data?.resetToken) {
        setMockResetToken(data.data.resetToken);
      }
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Quên Mật Khẩu | NASH</title>
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="inline-block w-full text-center text-3xl font-black tracking-tight text-foreground mb-4">
          NASH
        </Link>
        <h2 className="text-center text-xl font-bold tracking-tight text-foreground">
          Khôi phục mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Nhập địa chỉ email tài khoản của bạn để nhận mã xác nhận đặt lại mật khẩu.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-sm border border-border sm:rounded-xl sm:px-10">
          {status === 'success' ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-800">Yêu cầu đã được gửi thành công!</p>
                  <p className="mt-1 text-emerald-700">
                    Kiểm tra hộp thư đến của email <span className="font-semibold text-emerald-900">{email}</span> để tiếp tục.
                  </p>
                </div>
              </div>

              {mockResetToken && (
                <div className="p-3 bg-surface-subtle border border-border rounded-lg text-xs space-y-1">
                  <p className="font-medium text-text-secondary">Mã xác nhận bảo mật (Dev Mode):</p>
                  <code className="block bg-surface p-2 rounded border border-border font-mono break-all text-primary font-bold">
                    {mockResetToken}
                  </code>
                  <Link
                    href={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(mockResetToken)}`}
                    className="inline-block mt-2 font-semibold text-primary hover:underline"
                  >
                    Bấm vào đây để đặt lại mật khẩu ngay →
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-border rounded-lg text-sm font-semibold text-foreground bg-surface hover:bg-surface-subtle transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại trang Đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {status === 'error' && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-900 flex items-start gap-2.5 text-sm">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div>
                <label htmlFor={emailInputId} className="block text-sm font-semibold text-foreground">
                  Địa chỉ email
                </label>
                <div className="mt-1.5">
                  <input
                    id={emailInputId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@example.com"
                    className="block w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-primary hover:bg-primary-hover focus:outline-none transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay lại Đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

