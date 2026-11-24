import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Calendar,
  Languages
} from 'lucide-react';

interface PortfolioItem {
  id?: string;
  title: string;
  role: string;
  description: string;
  liveUrl?: string;
  repoUrl?: string;
  techStack: string[];
  imageUrls: string[];
}

interface WorkExperience {
  id?: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  description: string;
}

interface Education {
  id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface LanguageProficiency {
  id?: string;
  language: string;
  proficiencyLevel: string;
}

interface FullFreelancerProfile {
  id: string;
  headline: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  isAvailable: boolean;
  bio: string;
  city: string;
  country: string;
  timezone: string;
  hoursPerWeek: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioItems: PortfolioItem[];
  workExperiences: WorkExperience[];
  educations: Education[];
  certifications: Certification[];
  languages: LanguageProficiency[];
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [headline, setHeadline] = useState('');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('UTC+7');
  const [hoursPerWeek, setHoursPerWeek] = useState('> 30 hrs/week');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Collections
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<LanguageProficiency[]>([]);

  // Item Modals
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [techStackInput, setTechStackInput] = useState('');
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editingLang, setEditingLang] = useState<LanguageProficiency | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient<FullFreelancerProfile>('/users/me/profile');
        if (res.success && res.data) {
          const p = res.data;
          setHeadline(p.headline || '');
          setHourlyRate(p.hourlyRate != null ? p.hourlyRate.toString() : '');
          setYearsOfExperience(p.yearsOfExperience != null ? p.yearsOfExperience.toString() : '');
          setIsAvailable(p.isAvailable);
          setBio(p.bio || '');
          setCity(p.city || '');
          setCountry(p.country || '');
          setTimezone(p.timezone || 'UTC+7');
          setHoursPerWeek(p.hoursPerWeek || '> 30 hrs/week');
          setGithubUrl(p.githubUrl || '');
          setLinkedinUrl(p.linkedinUrl || '');
          setWebsiteUrl(p.websiteUrl || '');
          setPortfolioItems(p.portfolioItems || []);
          setWorkExperiences(p.workExperiences || []);
          setEducations(p.educations || []);
          setCertifications(p.certifications || []);
          setLanguages(p.languages || []);
        }
      } catch (err: unknown) {
        if (err instanceof ApiException) {
          setError(err.error.message || 'Lỗi khi tải thông tin hồ sơ.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const payload = {
        headline,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        isAvailable,
        bio,
        city,
        country,
        timezone,
        hoursPerWeek,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        websiteUrl: websiteUrl || null,
        portfolioItems,
        workExperiences,
        educations,
        certifications,
        languages
      };

      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setSuccess('Cập nhật hồ sơ & portfolio thành công!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(res.message || 'Không thể cập nhật hồ sơ.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error.message || 'Lỗi lưu thông tin.');
      } else {
        setError('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Helper Portfolio Add/Remove
  const handleSavePortfolioItem = () => {
    if (!editingPortfolio || !editingPortfolio.title) return;
    const techStack = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedItem = { ...editingPortfolio, techStack };
    setPortfolioItems((prev) => [...prev, updatedItem]);
    setEditingPortfolio(null);
    setTechStackInput('');
  };

  const handleRemovePortfolioItem = (idx: number) => {
    setPortfolioItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper Experience Add/Remove
  const handleSaveExperience = () => {
    if (!editingExperience || !editingExperience.companyName) return;
    setWorkExperiences((prev) => [...prev, editingExperience]);
    setEditingExperience(null);
  };

  const handleRemoveExperience = (idx: number) => {
    setWorkExperiences((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper Education Add/Remove
  const handleSaveEducation = () => {
    if (!editingEducation || !editingEducation.school) return;
    setEducations((prev) => [...prev, editingEducation]);
    setEditingEducation(null);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper Certification Add/Remove
  const handleSaveCert = () => {
    if (!editingCert || !editingCert.name) return;
    setCertifications((prev) => [...prev, editingCert]);
    setEditingCert(null);
  };

  const handleRemoveCert = (idx: number) => {
    setCertifications((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper Language Add/Remove
  const handleSaveLanguage = () => {
    if (!editingLang || !editingLang.language) return;
    setLanguages((prev) => [...prev, editingLang]);
    setEditingLang(null);
  };

  const handleRemoveLanguage = (idx: number) => {
    setLanguages((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-xs text-text-muted">
          Đang tải dữ liệu hồ sơ...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Chỉnh Sửa Hồ Sơ & Portfolio | NASH</title>
      </Head>

      <form onSubmit={handleSave} className="mx-auto max-w-4xl space-y-6 pb-12">
        {/* Top bar navigation & Actions */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Xem hồ sơ công khai
            </Link>
            <div>
              <h1 className="text-base font-bold text-foreground">Hồ Sơ & Portfolio Toàn Diện</h1>
              <p className="text-2xs text-text-muted">Chuẩn hóa thông tin năng lực để tối ưu thuật toán Smart Match.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Header & General Identity */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">1. Tiêu Đề Nghề Nghiệp & Trạng Thái</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">
                Tiêu đề chuyên môn (Professional Headline) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ví dụ: Senior Fullstack Engineer (.NET / React / Cloud Architect)"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Mức thù lao mong muốn ($/giờ)</label>
              <input
                type="number"
                step="0.5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="VD: 30"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Số năm kinh nghiệm làm việc</label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                placeholder="VD: 5"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Thời gian có thể làm việc / tuần</label>
              <select
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              >
                <option value="> 30 hrs/week">Hơn 30 giờ/tuần (Toàn thời gian)</option>
                <option value="< 30 hrs/week">Dưới 30 giờ/tuần (Bán thời gian)</option>
                <option value="As needed">Linh hoạt theo từng dự án</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Trạng thái nhận việc</label>
              <div className="flex items-center gap-4 pt-1.5">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="isAvailable"
                    checked={isAvailable === true}
                    onChange={() => setIsAvailable(true)}
                    className="text-primary border-border focus:ring-0"
                  />
                  <span className="font-medium text-emerald-700">Sẵn sàng nhận dự án mới</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="isAvailable"
                    checked={isAvailable === false}
                    onChange={() => setIsAvailable(false)}
                    className="text-primary border-border focus:ring-0"
                  />
                  <span className="font-medium text-text-muted">Đang bận / Tạm ngưng</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Thành phố & Quốc gia</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Thành phố (VD: Hà Nội)"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Quốc gia (VD: Việt Nam)"
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Múi giờ làm việc</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="VD: UTC+7 (Indochina Time)"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 2. Professional Bio */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">2. Giới Thiệu Chuyên Môn (Overview / Bio)</h2>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={6}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Mô tả tóm tắt kinh nghiệm làm việc, giải pháp công nghệ đã thực hiện, phong cách làm việc và cam kết của bạn đối với khách hàng..."
              className="w-full rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-text-muted">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-text-muted">LinkedIn URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-3xs font-semibold text-text-muted">Website Cá Nhân</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourdomain.com"
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 3. Portfolio Showcase Items */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">3. Dự Án Tiêu Biểu (Portfolio Showcase)</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingPortfolio({
                  title: '',
                  role: '',
                  description: '',
                  liveUrl: '',
                  repoUrl: '',
                  techStack: [],
                  imageUrls: []
                });
                setTechStackInput('');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-border/60 transition-colors border border-border cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm Dự Án
            </button>
          </div>

          {portfolioItems.length === 0 ? (
            <p className="text-2xs text-text-muted italic">Chưa có dự án nào trong portfolio.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {portfolioItems.map((item, idx) => (
                <div key={idx} className="relative rounded-xl border border-border bg-surface-subtle/50 p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                      <p className="text-2xs font-medium text-primary">{item.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioItem(idx)}
                      className="text-text-muted hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-2xs text-text-secondary line-clamp-3">{item.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.techStack?.map((t, tIdx) => (
                      <span key={tIdx} className="rounded-md bg-surface px-1.5 py-0.5 text-3xs font-medium text-foreground border border-border">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Portfolio Modal Inline */}
          {editingPortfolio && (
            <div className="rounded-xl border border-primary/40 bg-primary-soft/10 p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground">Thêm Dự Án Mới</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Tên dự án *"
                  value={editingPortfolio.title}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, title: e.target.value })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
                />
                <input
                  type="text"
                  placeholder="Vai trò của bạn (VD: Lead Frontend) *"
                  value={editingPortfolio.role}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, role: e.target.value })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
                />
                <input
                  type="url"
                  placeholder="Live URL Demo"
                  value={editingPortfolio.liveUrl || ''}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, liveUrl: e.target.value })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
                />
                <input
                  type="url"
                  placeholder="GitHub Repository URL"
                  value={editingPortfolio.repoUrl || ''}
                  onChange={(e) => setEditingPortfolio({ ...editingPortfolio, repoUrl: e.target.value })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
                />
              </div>
              <input
                type="text"
                placeholder="Công nghệ sử dụng (cách nhau bởi dấu phẩy: React, .NET, PostgreSQL)"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
              />
              <textarea
                rows={3}
                placeholder="Mô tả bài toán, cách giải quyết và kết quả..."
                value={editingPortfolio.description}
                onChange={(e) => setEditingPortfolio({ ...editingPortfolio, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPortfolio(null)}
                  className="px-3 py-1 rounded-lg border border-border text-xs"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSavePortfolioItem}
                  className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold"
                >
                  Xác nhận thêm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Work Experience */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">4. Kinh Nghiệm Làm Việc (Work Experience)</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingExperience({
                  companyName: '',
                  position: '',
                  startDate: new Date().toISOString().split('T')[0],
                  isCurrentRole: true,
                  description: ''
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-border/60 transition-colors border border-border cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm Kinh Nghiệm
            </button>
          </div>

          {workExperiences.length === 0 ? (
            <p className="text-2xs text-text-muted italic">Chưa có kinh nghiệm làm việc nào được liệt kê.</p>
          ) : (
            <div className="space-y-3">
              {workExperiences.map((exp, idx) => (
                <div key={idx} className="flex items-start justify-between rounded-xl border border-border bg-surface-subtle/50 p-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">{exp.position}</div>
                    <div className="text-2xs text-primary font-medium">{exp.companyName}</div>
                    <div className="text-3xs text-text-muted">
                      {new Date(exp.startDate).toLocaleDateString('vi-VN')} - {exp.isCurrentRole ? 'Hiện tại' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : 'Không rõ')}
                    </div>
                    <p className="text-2xs text-text-secondary mt-1">{exp.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-text-muted hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {editingExperience && (
            <div className="rounded-xl border border-primary/40 bg-primary-soft/10 p-4 space-y-3">
              <h4 className="text-xs font-bold text-foreground">Thêm Kinh Nghiệm Làm Việc</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Công ty / Tổ chức *"
                  value={editingExperience.companyName}
                  onChange={(e) => setEditingExperience({ ...editingExperience, companyName: e.target.value })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
                />
                <input
                  type="text"
                  placeholder="Vị trí / Chức danh *"
                  value={editingExperience.position}
                  onChange={(e) => setEditingExperience({ ...editingExperience, position: e.target.value })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
                />
                <div className="space-y-1">
                  <label className="text-3xs text-text-muted">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={editingExperience.startDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs text-text-muted">Ngày kết thúc</label>
                  <input
                    type="date"
                    disabled={editingExperience.isCurrentRole}
                    value={editingExperience.endDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground disabled:opacity-50"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingExperience.isCurrentRole}
                  onChange={(e) => setEditingExperience({ ...editingExperience, isCurrentRole: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                <span>Hiện vẫn đang công tác tại vị trí này</span>
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả trách nhiệm & thành tích đạt được..."
                value={editingExperience.description}
                onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingExperience(null)}
                  className="px-3 py-1 rounded-lg border border-border text-xs"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveExperience}
                  className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold"
                >
                  Xác nhận thêm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Education & Certifications */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Education */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Học Vấn (Education)</h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingEducation({
                    school: '',
                    degree: '',
                    fieldOfStudy: '',
                    startYear: new Date().getFullYear() - 4,
                    endYear: new Date().getFullYear()
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-border/60 border border-border cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Thêm
              </button>
            </div>

            {educations.length === 0 ? (
              <p className="text-2xs text-text-muted italic">Chưa có thông tin học vấn.</p>
            ) : (
              <div className="space-y-2">
                {educations.map((edu, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs">
                    <div>
                      <div className="font-bold text-foreground">{edu.school}</div>
                      <div className="text-2xs text-text-secondary">{edu.degree} - {edu.fieldOfStudy}</div>
                      <div className="text-3xs text-text-muted">{edu.startYear} - {edu.endYear || 'Hiện tại'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-text-muted hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingEducation && (
              <div className="rounded-xl border border-primary/40 bg-primary-soft/10 p-3 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Trường đại học / học viện *"
                  value={editingEducation.school}
                  onChange={(e) => setEditingEducation({ ...editingEducation, school: e.target.value })}
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 text-xs"
                />
                <input
                  type="text"
                  placeholder="Bằng cấp (VD: Cử nhân, Kỹ sư)"
                  value={editingEducation.degree}
                  onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })}
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 text-xs"
                />
                <input
                  type="text"
                  placeholder="Chuyên ngành (VD: Khoa học máy tính)"
                  value={editingEducation.fieldOfStudy}
                  onChange={(e) => setEditingEducation({ ...editingEducation, fieldOfStudy: e.target.value })}
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Năm bắt đầu"
                    value={editingEducation.startYear}
                    onChange={(e) => setEditingEducation({ ...editingEducation, startYear: parseInt(e.target.value) })}
                    className="w-1/2 rounded border border-border bg-surface px-2.5 py-1 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Năm kết thúc"
                    value={editingEducation.endYear || ''}
                    onChange={(e) => setEditingEducation({ ...editingEducation, endYear: parseInt(e.target.value) })}
                    className="w-1/2 rounded border border-border bg-surface px-2.5 py-1 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button type="button" onClick={() => setEditingEducation(null)} className="px-2.5 py-1 rounded border">Hủy</button>
                  <button type="button" onClick={handleSaveEducation} className="px-2.5 py-1 rounded bg-primary text-white font-semibold">Lưu</button>
                </div>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Chứng Chỉ Quốc Tế</h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingCert({
                    name: '',
                    issuer: '',
                    credentialId: '',
                    credentialUrl: ''
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-border/60 border border-border cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Thêm
              </button>
            </div>

            {certifications.length === 0 ? (
              <p className="text-2xs text-text-muted italic">Chưa có chứng chỉ quốc tế.</p>
            ) : (
              <div className="space-y-2">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs">
                    <div>
                      <div className="font-bold text-foreground">{cert.name}</div>
                      <div className="text-2xs text-text-secondary">{cert.issuer}</div>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-3xs text-primary underline inline-flex items-center gap-0.5 mt-0.5">
                          Xem xác thực <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCert(idx)}
                      className="text-text-muted hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingCert && (
              <div className="rounded-xl border border-primary/40 bg-primary-soft/10 p-3 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Tên chứng chỉ (VD: AWS Certified Solutions Architect) *"
                  value={editingCert.name}
                  onChange={(e) => setEditingCert({ ...editingCert, name: e.target.value })}
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 text-xs"
                />
                <input
                  type="text"
                  placeholder="Tổ chức cấp (VD: Amazon Web Services)"
                  value={editingCert.issuer}
                  onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 text-xs"
                />
                <input
                  type="url"
                  placeholder="Đường link chứng nhận online"
                  value={editingCert.credentialUrl || ''}
                  onChange={(e) => setEditingCert({ ...editingCert, credentialUrl: e.target.value })}
                  className="w-full rounded border border-border bg-surface px-2.5 py-1 text-xs"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button type="button" onClick={() => setEditingCert(null)} className="px-2.5 py-1 rounded border">Hủy</button>
                  <button type="button" onClick={handleSaveCert} className="px-2.5 py-1 rounded bg-primary text-white font-semibold">Lưu</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Languages */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">6. Ngôn Ngữ Giao Tiếp (Languages)</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingLang({
                  language: '',
                  proficiencyLevel: 'Fluent'
                })
              }
              className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-border/60 border border-border cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Thêm Ngôn Ngữ
            </button>
          </div>

          {languages.length === 0 ? (
            <p className="text-2xs text-text-muted italic">Chưa cập nhật ngôn ngữ giao tiếp.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {languages.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs">
                  <span className="font-bold text-foreground">{l.language}</span>
                  <span className="text-2xs text-text-muted">({l.proficiencyLevel})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(idx)}
                    className="text-text-muted hover:text-rose-600 ml-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {editingLang && (
            <div className="rounded-xl border border-primary/40 bg-primary-soft/10 p-3 flex items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Ngôn ngữ (VD: Tiếng Anh)"
                value={editingLang.language}
                onChange={(e) => setEditingLang({ ...editingLang, language: e.target.value })}
                className="flex-1 rounded border border-border bg-surface px-2.5 py-1 text-xs"
              />
              <select
                value={editingLang.proficiencyLevel}
                onChange={(e) => setEditingLang({ ...editingLang, proficiencyLevel: e.target.value })}
                className="rounded border border-border bg-surface px-2.5 py-1 text-xs"
              >
                <option value="Native or Bilingual">Bản ngữ (Native)</option>
                <option value="Fluent">Lưu loát (Fluent)</option>
                <option value="Conversational">Giao tiếp tốt (Conversational)</option>
                <option value="Basic">Cơ bản (Basic)</option>
              </select>
              <button type="button" onClick={handleSaveLanguage} className="px-3 py-1 rounded bg-primary text-white font-semibold">Lưu</button>
              <button type="button" onClick={() => setEditingLang(null)} className="px-2.5 py-1 rounded border">Hủy</button>
            </div>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu thay đổi...' : 'Lưu tất cả thay đổi'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
