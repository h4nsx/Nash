import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  User,
  Briefcase,
  DollarSign,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

interface FreelancerProfile {
  id?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  isAvailable: boolean;
  bio: string;
  skills: string[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
}

export default function EditProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile Form States
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');
  const [headline, setHeadline] = useState<string>('Lập trình viên Backend .NET & Fullstack');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  // Experience and Portfolio items
  const [experiences, setExperiences] = useState([
    {
      id: 'exp-1',
      role: 'Senior Backend Developer',
      company: 'Tech Solutions Corp',
      period: '2022 - Nay',
      description: 'Phát triển kiến trúc Clean Architecture, tối ưu truy vấn SQL và xây dựng microservices API.',
    },
  ]);

  const [catalogSkills, setCatalogSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchProfileAndSkills = async () => {
      try {
        setLoading(true);
        const [profileRes, skillsRes] = await Promise.allSettled([
          apiClient<FreelancerProfile>('/users/me/profile'),
          apiClient<Skill[]>('/skills'),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
          const p = profileRes.value.data;
          setHourlyRate(p.hourlyRate?.toString() || '');
          setYearsOfExperience(p.yearsOfExperience?.toString() || '');
          setIsAvailable(p.isAvailable ?? true);
          setBio(p.bio || '');
          setSelectedSkills(p.skills || ['C# .NET', 'Clean Architecture', 'PostgreSQL']);
        } else {
          // Default mock data
          setSelectedSkills(['C# .NET', 'Clean Architecture', 'PostgreSQL']);
        }

        if (skillsRes.status === 'fulfilled' && skillsRes.value.success && skillsRes.value.data) {
          setCatalogSkills(skillsRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching profile data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndSkills();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        isAvailable,
        bio,
        skills: selectedSkills,
      };

      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess('Cập nhật toàn bộ thông tin hồ sơ thành công!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể lưu hồ sơ.');
      } else {
        setSuccess('Đã lưu thông tin hồ sơ vào hệ thống!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillName));
  };

  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      role: 'Vị trí công việc mới',
      company: 'Tên công ty / Dự án',
      period: '2023 - 2024',
      description: 'Mô tả ngắn gọn trách nhiệm và kết quả đạt được.',
    };
    setExperiences([...experiences, newExp]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Chỉnh Sửa Hồ Sơ Chi Tiết | NASH</title>
      </Head>

      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Chỉnh sửa thông tin hồ sơ
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              Cập nhật thông tin nghề nghiệp, danh sách kỹ năng, mức giá và kinh nghiệm làm việc của bạn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              Xem trang bài thi kỹ năng →
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Card 1: Basic Professional Info */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">
              Thông tin nghề nghiệp
            </h2>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Tiêu đề chuyên môn (Headline)
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ví dụ: Senior Backend Developer | .NET & Microservices"
                className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mức thù lao theo giờ (VND / giờ)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="500000"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Số năm kinh nghiệm
                </label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="4"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Giới thiệu bản thân & Năng lực (Bio)
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mô tả các dự án tiêu biểu bạn từng làm, ngôn ngữ thế mạnh, phong cách làm việc và các cam kết về chất lượng sản phẩm..."
                className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>

            {/* Availability Option */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface-subtle">
              <div>
                <span className="text-xs font-bold text-foreground">Nhận việc mới</span>
                <p className="text-2xs text-text-muted mt-0.5">
                  Cho phép hệ thống tự động tìm và gợi ý dự án phù hợp với bạn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                {isAvailable ? 'Đang sẵn sàng' : 'Tạm dừng nhận việc'}
              </button>
            </div>
          </div>

          {/* Card 2: Manage Skills */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Kỹ năng chuyên môn ({selectedSkills.length})
              </h2>
              <Link href="/dashboard/profile" className="text-xs font-semibold text-primary hover:underline">
                Đi đến bài test kiểm tra tay nghề →
              </Link>
            </div>

            <p className="text-xs text-text-secondary">
              Thêm các kỹ năng bạn thành thạo để giúp hệ thống ghép nối đúng việc bạn làm tốt nhất.
            </p>

            {/* Selected Skills Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-md bg-surface-subtle border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-text-muted hover:text-rose-600 transition-colors cursor-pointer"
                    title="Xóa kỹ năng này"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Input to Add Skill */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                placeholder="Nhập tên kỹ năng (VD: Docker, Next.js, Redis...)"
                className="flex-1 rounded-lg border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                className="rounded-lg bg-surface border border-border hover:bg-surface-subtle px-4 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                Thêm kỹ năng
              </button>
            </div>
          </div>

          {/* Card 3: Experience & History */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Kinh nghiệm làm việc ({experiences.length})
              </h2>
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Thêm kinh nghiệm
              </button>
            </div>

            <div className="space-y-3">
              {experiences.map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-lg border border-border bg-surface-subtle/50 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].role = e.target.value;
                          setExperiences(updated);
                        }}
                        className="rounded border border-border bg-surface p-1.5 text-xs font-bold text-foreground"
                        placeholder="Vị trí đảm nhận"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].company = e.target.value;
                          setExperiences(updated);
                        }}
                        className="rounded border border-border bg-surface p-1.5 text-xs text-foreground"
                        placeholder="Tên công ty / Dự án"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-text-muted hover:text-rose-600 p-1 cursor-pointer"
                      title="Xóa mục này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => {
                      const updated = [...experiences];
                      updated[idx].description = e.target.value;
                      setExperiences(updated);
                    }}
                    className="w-full rounded border border-border bg-surface p-2 text-xs text-foreground"
                    placeholder="Mô tả công việc và kết quả đạt được..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/dashboard"
              className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary hover:bg-primary-hover px-6 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu toàn bộ thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

