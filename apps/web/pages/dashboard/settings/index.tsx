import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  User,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  CreditCard,
  QrCode
} from 'lucide-react';

interface NotificationSetting {
  emailInvitations: boolean;
  emailMilestones: boolean;
  emailReviews: boolean;
  inAppAlerts: boolean;
}

const POPULAR_VIETNAMESE_BANKS = [
  { bin: '970422', name: 'MB Bank (Quân Đội)', short: 'MBB' },
  { bin: '970436', name: 'Vietcombank', short: 'VCB' },
  { bin: '970407', name: 'Techcombank', short: 'TCB' },
  { bin: '970415', name: 'VietinBank', short: 'CTG' },
  { bin: '970418', name: 'BIDV', short: 'BIDV' },
  { bin: '970416', name: 'ACB (Á Châu)', short: 'ACB' },
  { bin: '970432', name: 'VPBank', short: 'VPB' },
  { bin: '970423', name: 'TPBank', short: 'TPB' },
  { bin: '970403', name: 'Sacombank', short: 'STB' },
  { bin: '970448', name: 'OCB', short: 'OCB' },
  { bin: '970441', name: 'VIB', short: 'VIB' },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const isClient = user?.role === 'Client';
  const notifStorageKey = isClient ? 'nash_client_notification_prefs' : 'nash_freelancer_notification_prefs';

  const [activeTab, setActiveTab] = useState<'profile' | 'banking' | 'notifications' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile preferences
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');

  // Banking / Payout Preferences
  const [bankBin, setBankBin] = useState<string>('970422');
  const [bankName, setBankName] = useState<string>('MB Bank (Quân Đội)');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankAccountName, setBankAccountName] = useState<string>('');

  // Notification Preferences
  const [notifications, setNotifications] = useState<NotificationSetting>({
    emailInvitations: true,
    emailMilestones: true,
    emailReviews: true,
    inAppAlerts: true,
  });

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfileSettings = async () => {
      const storedNotifs = localStorage.getItem(notifStorageKey);
      if (storedNotifs) {
        try {
          setNotifications(JSON.parse(storedNotifs));
        } catch {
          // Ignore malformed stored preferences
        }
      }

      // If user is not Freelancer (e.g. Client or Admin), skip calling freelancer profile API
      if (user?.role !== 'Freelancer') {
        setActiveTab('security');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await apiClient<{
          hourlyRate?: number;
          yearsOfExperience?: number;
          isAvailable: boolean;
          bio: string;
          bankBin?: string;
          bankName?: string;
          bankAccountNumber?: string;
          bankAccountName?: string;
        }>('/users/me/profile');

        if (res.success && res.data) {
          setHourlyRate(res.data.hourlyRate?.toString() || '');
          setYearsOfExperience(res.data.yearsOfExperience?.toString() || '');
          setIsAvailable(res.data.isAvailable ?? true);
          setBio(res.data.bio || '');
          if (res.data.bankBin) setBankBin(res.data.bankBin);
          if (res.data.bankName) setBankName(res.data.bankName);
          if (res.data.bankAccountNumber) setBankAccountNumber(res.data.bankAccountNumber);
          if (res.data.bankAccountName) setBankAccountName(res.data.bankAccountName);
        }
      } catch (err) {
        console.error('Failed to load profile settings', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileSettings();
    }
  }, [user, notifStorageKey]);

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const payload = {
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        isAvailable,
        bio,
        bankBin,
        bankName,
        bankAccountNumber,
        bankAccountName,
      };

      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess('Lưu cài đặt hồ sơ thành công!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể lưu cài đặt.');
      } else {
        setError('Đã xảy ra lỗi khi lưu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(notifStorageKey, JSON.stringify(notifications));
      setSuccess('Cập nhật cài đặt thông báo thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Không thể lưu cài đặt thông báo.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.message || 'Không thể đổi mật khẩu.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        const errorDetails = err.error.errors
          ? Object.values(err.error.errors).flat().join(' ')
          : '';
        setError(`${err.error.message || 'Không thể đổi mật khẩu.'} ${errorDetails}`.trim());
      } else {
        setError('Lỗi kết nối khi đổi mật khẩu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Cài đặt tài khoản | NASH</title>
      </Head>

      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Cài đặt tài khoản
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              Quản lý thông tin hồ sơ chuyên môn, tùy chọn thông báo và thiết lập bảo mật tài khoản.
            </p>
          </div>
          {isClient && (
            <Link
              href="/dashboard/client/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary-soft/30 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary-soft/60 self-start sm:self-auto"
            >
              Quản lý Hồ sơ Doanh nghiệp &amp; Mã số thuế →
            </Link>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-danger-bg p-4 text-xs text-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-success-bg p-4 text-xs text-success">
            {success}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border w-max">
          {user?.role === 'Freelancer' && (
            <>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Tùy chọn nhận việc
              </button>
              <button
                onClick={() => setActiveTab('banking')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'banking'
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Tài khoản Ngân hàng (VietQR)
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-text-secondary hover:text-foreground'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            Thông báo
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-text-secondary hover:text-foreground'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Bảo mật & Đổi mật khẩu
          </button>
        </div>

        {/* Tab 1: Profile Preferences */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfileSettings} className="rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-5">
            <div className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Tùy chọn công việc & Tỷ giá
              </h2>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface-subtle">
              <div>
                <span className="text-xs font-bold text-foreground">Sẵn sàng nhận dự án mới</span>
                <p className="text-2xs text-text-muted mt-0.5">
                  Bật để thuật toán Smart Match đề cử bạn vào Top 3 dự án phù hợp
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isAvailable
                    ? 'border-emerald-200 bg-success-bg text-success'
                    : 'border-border bg-surface text-text-muted'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-success animate-pulse' : 'bg-text-disabled'}`} />
                {isAvailable ? 'Đang nhận việc' : 'Tạm dừng'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mức thù lao mong muốn (VND / giờ)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="500000"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Số năm kinh nghiệm làm việc
                </label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="4"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Tóm tắt giới thiệu (Bio)
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu kinh nghiệm và năng lực..."
                className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Banking & VietQR Settings */}
        {activeTab === 'banking' && (
          <form onSubmit={handleSaveProfileSettings} className="rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-5">
            <div className="pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Tài khoản nhận tiền tự động (Chuẩn VietQR)
                </h2>
              </div>
              <p className="text-2xs text-text-muted mt-1">
                Khách hàng sẽ quét mã VietQR để thanh toán trực tiếp vào tài khoản ngân hàng này của bạn khi nghiệm thu từng cột mốc.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Chọn Ngân hàng nhận tiền *
                </label>
                <select
                  value={bankBin}
                  onChange={(e) => {
                    const selected = POPULAR_VIETNAMESE_BANKS.find((b) => b.bin === e.target.value);
                    setBankBin(e.target.value);
                    if (selected) setBankName(selected.name);
                  }}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {POPULAR_VIETNAMESE_BANKS.map((b) => (
                    <option key={b.bin} value={b.bin}>
                      {b.name} ({b.short}) - BIN: {b.bin}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Số tài khoản ngân hàng *
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Ví dụ: 0987654321"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tên chủ tài khoản (In hoa không dấu) *
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: NGUYEN VAN A"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Live QR Preview */}
            {bankAccountNumber && bankAccountName && (
              <div className="rounded-xl border border-primary/30 bg-primary-soft/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-primary uppercase">Xem trước mã VietQR của bạn</span>
                  <span className="text-3xs text-text-muted">Tự động gắn số tiền khi thanh toán</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.vietqr.io/image/${bankBin}-${bankAccountNumber}-compact2.png?accountName=${encodeURIComponent(bankAccountName)}`}
                    alt="VietQR Preview"
                    className="h-32 w-32 rounded-lg border border-border bg-white p-1 object-contain shadow-xs"
                  />
                  <div className="text-xs space-y-1 text-center sm:text-left">
                    <div className="font-bold text-foreground">{bankName}</div>
                    <div className="font-mono text-primary font-semibold">{bankAccountNumber}</div>
                    <div className="text-2xs text-text-secondary uppercase">{bankAccountName}</div>
                    <p className="text-3xs text-emerald-700 font-medium pt-1">
                      ✓ Đã kết nối mạng lưới Napas 24/7 (Miễn phí 100%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                {loading ? 'Đang lưu...' : 'Lưu thông tin ngân hàng'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Notification Preferences */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleSaveNotifications} className="rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-5">
            <div className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Kênh nhận thông báo
              </h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-subtle transition-colors">
                <div>
                  <span className="text-xs font-bold text-foreground">
                    {isClient ? 'Phản hồi lời mời & thương lượng hợp đồng' : 'Lời mời nhận dự án mới'}
                  </span>
                  <p className="text-2xs text-text-muted mt-0.5">
                    {isClient
                      ? 'Nhận thông báo khi ứng viên chấp nhận, từ chối hoặc đề xuất thương lượng bản thảo'
                      : 'Nhận email ngay khi khách hàng gửi bản thảo hợp đồng'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailInvitations}
                  onChange={(e) => setNotifications({ ...notifications, emailInvitations: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-subtle transition-colors">
                <div>
                  <span className="text-xs font-bold text-foreground">Cập nhật mốc nghiệm thu</span>
                  <p className="text-2xs text-text-muted mt-0.5">
                    {isClient
                      ? 'Thông báo khi người làm nộp bàn giao cột mốc cần bạn kiểm tra và nghiệm thu'
                      : 'Thông báo khi khách hàng phê duyệt mốc hoặc yêu cầu chỉnh sửa'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailMilestones}
                  onChange={(e) => setNotifications({ ...notifications, emailMilestones: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-subtle transition-colors">
                <div>
                  <span className="text-xs font-bold text-foreground">
                    {isClient ? 'Đánh giá mới từ đối tác' : 'Đánh giá từ khách hàng'}
                  </span>
                  <p className="text-2xs text-text-muted mt-0.5">
                    {isClient
                      ? 'Nhận thông báo khi đối tác gửi đánh giá sau khi hoàn thành hợp đồng'
                      : 'Nhận thông báo khi khách hàng gửi đánh giá sau khi hoàn thành dự án'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailReviews}
                  onChange={(e) => setNotifications({ ...notifications, emailReviews: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-0"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                Lưu tùy chọn thông báo
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-5 max-w-xl">
            <div className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Đổi mật khẩu tài khoản
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        )}

      </div>
    </DashboardLayout>
  );
}
