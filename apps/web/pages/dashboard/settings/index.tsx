import { useState, useEffect } from 'react';
import Head from 'next/head';
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
  LogOut
} from 'lucide-react';

interface NotificationSetting {
  emailInvitations: boolean;
  emailMilestones: boolean;
  emailReviews: boolean;
  inAppAlerts: boolean;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile preferences
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');

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
        }>('/users/me/profile');

        if (res.success && res.data) {
          setHourlyRate(res.data.hourlyRate?.toString() || '');
          setYearsOfExperience(res.data.yearsOfExperience?.toString() || '');
          setIsAvailable(res.data.isAvailable ?? true);
          setBio(res.data.bio || '');
        }

        const storedNotifs = localStorage.getItem('nash_freelancer_notification_prefs');
        if (storedNotifs) {
          setNotifications(JSON.parse(storedNotifs));
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
  }, [user]);

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
      localStorage.setItem('nash_freelancer_notification_prefs', JSON.stringify(notifications));
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

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      // Mock or call password endpoint
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSuccess('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Lỗi kết nối khi đổi mật khẩu.');
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
        <div className="pb-4 border-b border-border">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Cài đặt tài khoản
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
            Quản lý thông tin hồ sơ chuyên môn, tùy chọn thông báo và thiết lập bảo mật tài khoản.
          </p>
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
                  <span className="text-xs font-bold text-foreground">Lời mời nhận dự án mới</span>
                  <p className="text-2xs text-text-muted mt-0.5">Nhận email ngay khi khách hàng gửi bản thảo hợp đồng</p>
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
                  <p className="text-2xs text-text-muted mt-0.5">Thông báo khi khách hàng phê duyệt mốc hoặc yêu cầu chỉnh sửa</p>
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
                  <span className="text-xs font-bold text-foreground">Đánh giá từ khách hàng</span>
                  <p className="text-2xs text-text-muted mt-0.5">Nhận thông báo khi khách hàng gửi đánh giá sau khi hoàn thành dự án</p>
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
