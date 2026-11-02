import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Settings,
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Mail,
  Smartphone,
  LogOut,
  Radio
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
    // Load existing settings
    const fetchProfileSettings = async () => {
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
          setIsAvailable(res.data.isAvailable);
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

    fetchProfileSettings();
  }, []);

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const payload = {
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : null,
        isAvailable,
        bio,
      };

      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess('Đã lưu cấu hình tài khoản & tỷ giá thành công!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể lưu cài đặt.');
      } else {
        setError('Lỗi kết nối khi lưu cài đặt.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('nash_freelancer_notification_prefs', JSON.stringify(notifications));
      setSuccess('Đã cập nhật cài đặt thông báo!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Không thể lưu cài đặt thông báo.');
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setSuccess('Mật khẩu của bạn đã được cập nhật thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Cài đặt tài khoản | NASH Chuyên Gia</title>
      </Head>

      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Tùy chỉnh hệ thống
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            Cài đặt tài khoản & Tùy chọn
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Quản lý thiết lập nhận diện công việc, thông báo dự án và bảo mật tài khoản cá nhân.
          </p>
        </div>

        {/* Global Notifications / Alerts */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p>{success}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <User className="h-4 w-4" />
            Thông tin & Thuật toán
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'notifications'
                ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <Bell className="h-4 w-4" />
            Thông báo & SignalR
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'security'
                ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <Shield className="h-4 w-4" />
            Bảo mật & Phiên đăng nhập
          </button>
        </div>

        {/* Tab 1: Profile & Algorithm Settings */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Tài khoản chuyên gia ({user?.lastName} {user?.firstName})
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Email đăng ký: <strong className="text-zinc-800 dark:text-zinc-200">{user?.email}</strong> • Vai trò: Chuyên gia (Freelancer)
              </p>
            </div>

            <form onSubmit={handleSaveProfileSettings} className="mt-6 space-y-6">
              {/* Availability */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Trạng thái làm việc
                </label>
                <div
                  onClick={() => setIsAvailable(!isAvailable)}
                  className="mt-2 flex w-max cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
                >
                  <div
                    className={`relative h-5 w-10 rounded-full transition-colors ${
                      isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  >
                    <div
                      className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-xs transition-all ${
                        isAvailable ? 'left-5' : 'left-1'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {isAvailable ? 'Đang nhận việc mới (Availability = 100%)' : 'Đang tạm dừng nhận dự án'}
                  </span>
                </div>
              </div>

              {/* Rate & Experience */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Mức giá giờ làm việc mặc định (VND)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="VD: 300000"
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                  <span className="mt-1 block text-[11px] text-zinc-400">
                    Smart Match sẽ so sánh với ngân sách của dự án để tính điểm Budget Fit.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Số năm kinh nghiệm làm việc
                  </label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="VD: 5"
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                  <span className="mt-1 block text-[11px] text-zinc-400">
                    Chiếm 15% trọng số đánh giá xếp hạng ứng viên Top 3.
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Tiểu sử tóm tắt (Bio)
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mô tả kỹ năng và kinh nghiệm..."
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Notifications & SignalR */}
        {activeTab === 'notifications' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Cài đặt nhận thông báo thời gian thực
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Kết nối trực tiếp với SignalR Hub (`/hubs/notifications`) để nhận thông báo tức thời.
              </p>
            </div>

            <form onSubmit={handleSaveNotificationSettings} className="mt-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Lời mời ghép nối dự án mới
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Gửi thông báo ngay khi thuật toán Smart Match ghép nối bạn với khách hàng.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailInvitations}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emailInvitations: e.target.checked })
                    }
                    className="h-4 w-4 rounded-sm border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Cập nhật mốc thanh toán & Phản hồi
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Nhận thông báo khi khách hàng nghiệm thu mốc hoặc gửi yêu cầu chỉnh sửa (Changes Requested).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailMilestones}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emailMilestones: e.target.checked })
                    }
                    className="h-4 w-4 rounded-sm border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Đánh giá từ khách hàng
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Thông báo khi hợp đồng hoàn thành và nhận được điểm sao đánh giá mới.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailReviews}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emailReviews: e.target.checked })
                    }
                    className="h-4 w-4 rounded-sm border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Save className="h-4 w-4" />
                  Lưu tùy chọn thông báo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & Session */}
        {activeTab === 'security' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Bảo mật tài khoản & Đổi mật khẩu
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Cập nhật mật khẩu để bảo vệ tài khoản và hợp đồng của bạn.
              </p>
            </div>

            <form onSubmit={handleSaveSecurity} className="mt-6 space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Mật khẩu hiện tại *
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Mật khẩu mới *
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Xác nhận mật khẩu mới *
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Save className="h-4 w-4" />
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Đăng xuất khỏi thiết bị
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Xóa phiên cookie HTTP-only hiện tại và đăng xuất khỏi NASH.
              </p>
              <div className="mt-4">
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
