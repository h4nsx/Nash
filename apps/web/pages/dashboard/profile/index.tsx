import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  User,
  Briefcase,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Save,
  Star
} from 'lucide-react';

interface FreelancerProfile {
  id: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  isAvailable: boolean;
  bio: string;
  skills: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<FreelancerProfile>('/users/me/profile');
      if (res.success && res.data) {
        setProfile(res.data);
        setHourlyRate(res.data.hourlyRate?.toString() || '');
        setYearsOfExperience(res.data.yearsOfExperience?.toString() || '');
        setIsAvailable(res.data.isAvailable);
        setBio(res.data.bio || '');
      }
    } catch (err: any) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể tải hồ sơ');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : null,
        isAvailable,
        bio
      };

      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setSuccess('Cập nhật hồ sơ thành công!');
        fetchProfile();
      }
    } catch (err: any) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể cập nhật hồ sơ');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ');
      }
    } finally {
      setSaving(false);
      
      if (success) {
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Hồ sơ cá nhân | Nash</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Hồ sơ cá nhân</h1>
          </div>
          <p className="text-gray-400">Cập nhật thông tin chi tiết để thu hút khách hàng tiềm năng.</p>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Thông tin chuyên môn
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Trạng thái làm việc
                      </label>
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 w-max cursor-pointer" onClick={() => setIsAvailable(!isAvailable)}>
                        <div className={`w-10 h-5 rounded-full transition-colors relative ${isAvailable ? 'bg-primary' : 'bg-gray-600'}`}>
                          <div className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-all ${isAvailable ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className={`text-sm font-medium ${isAvailable ? 'text-white' : 'text-gray-400'}`}>
                          {isAvailable ? 'Đang nhận việc mới' : 'Tạm thời bận'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Mức giá theo giờ (VND)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="Ví dụ: 150000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          Số năm kinh nghiệm
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="number"
                            value={yearsOfExperience}
                            onChange={(e) => setYearsOfExperience(e.target.value)}
                            placeholder="Ví dụ: 3"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Giới thiệu bản thân
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Viết một đoạn ngắn giới thiệu về chuyên môn và kinh nghiệm của bạn..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors custom-scrollbar resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  Kỹ năng đã xác thực
                </h2>
                
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-white/10 bg-white/5">
                    <Star className="w-10 h-10 text-gray-500 mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-gray-400">
                      Bạn chưa có kỹ năng nào được xác thực. Hãy hoàn thành các bài kiểm tra kỹ năng để hiển thị ở đây.
                    </p>
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs text-gray-500 text-center">
                    Kỹ năng được tự động đồng bộ từ kết quả các bài đánh giá kỹ năng của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Không tìm thấy dữ liệu hồ sơ.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
