import { useState, useEffect, useId } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Search,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  X,
  Plus
} from 'lucide-react';

export interface ProjectSkillRequirement {
  id: string;
  skillId: string;
  skillName: string;
  isMandatory: boolean;
  minimumExperienceYears?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  startDate?: string;
  endDate?: string;
  status: number;
  createdAt: string;
  skillRequirements: ProjectSkillRequirement[];
}

export interface Skill {
  id: string;
  name: string;
}

export default function PublicProjectsPage() {
  const { user } = useAuth();
  const searchInputId = useId();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [budgetRange, setBudgetRange] = useState<string>('all'); // 'all', 'under_20m', '20m_50m', 'over_50m'
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjectsAndSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsRes, skillsRes] = await Promise.allSettled([
        apiClient<Project[]>('/projects'),
        apiClient<Skill[]>('/skills'),
      ]);

      if (projectsRes.status === 'fulfilled' && projectsRes.value.success && projectsRes.value.data) {
        setProjects(projectsRes.value.data);
      } else {
        setProjects([]);
      }

      if (skillsRes.status === 'fulfilled' && skillsRes.value.success && skillsRes.value.data) {
        setSkills(skillsRes.value.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể tải danh sách dự án.');
      } else {
        setError('Có lỗi xảy ra khi kết nối máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndSkills();
  }, []);

  const formatCurrency = (val?: number) => {
    if (val == null) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Filter Logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill =
      selectedSkill === 'all' ||
      project.skillRequirements.some(
        (r) => r.skillName.toLowerCase() === selectedSkill.toLowerCase()
      );

    let matchesBudget = true;
    const max = project.budgetMax || project.budgetMin || 0;
    if (budgetRange === 'under_20m') matchesBudget = max < 20000000;
    else if (budgetRange === '20m_50m') matchesBudget = max >= 20000000 && max <= 50000000;
    else if (budgetRange === 'over_50m') matchesBudget = max > 50000000;

    return matchesSearch && matchesSkill && matchesBudget;
  });

  return (
    <div className="flex min-h-screen flex-col w-full bg-background selection:bg-brand-100 selection:text-primary">
      <Head>
        <title>Khám phá dự án & Việc làm | NASH</title>
        <meta
          name="description"
          content="Khám phá các dự án phần mềm minh bạch, chuẩn kỹ năng xác thực và hợp đồng trực tiếp tại NASH."
        />
      </Head>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Header & Subtitle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Sàn dự án đã xác minh
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Dự án đang tuyển người
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary max-w-2xl">
                Tất cả dự án đều có yêu cầu kỹ năng rõ ràng, ngân sách minh bạch và cam kết thanh toán theo từng mốc nghiệm thu.
              </p>
            </div>

            {/* Action button tailored by user role */}
            {user?.role === 'Freelancer' ? (
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors shrink-0 self-start md:self-auto"
              >
                <Sparkles className="h-4 w-4" /> Làm bài test kỹ năng
              </Link>
            ) : user?.role === 'Client' ? (
              <Link
                href="/dashboard/client/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors shrink-0 self-start md:self-auto"
              >
                <Plus className="h-4 w-4" /> Đăng dự án mới
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register?role=freelancer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-2xs transition-colors shrink-0"
                >
                  Ứng tuyển làm việc
                </Link>
                <Link
                  href="/register?role=client"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" /> Đăng dự án
                </Link>
              </div>
            )}
          </div>

          {/* Search & Filters Bar */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id={searchInputId}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên công việc, công nghệ (.NET, React, PostgreSQL)..."
                  className="w-full rounded-lg border border-border bg-surface-subtle py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              {/* Skill Filter Dropdown */}
              <div className="w-full md:w-56">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
                >
                  <option value="all">Tất cả kỹ năng</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Filter Dropdown */}
              <div className="w-full md:w-48">
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
                >
                  <option value="all">Mọi mức ngân sách</option>
                  <option value="under_20m">Dưới 20 triệu</option>
                  <option value="20m_50m">20 - 50 triệu</option>
                  <option value="over_50m">Trên 50 triệu</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs">
              <span className="text-2xs font-semibold text-text-muted uppercase shrink-0">Gợi ý nhanh:</span>
              {['C# .NET', 'ReactJS', 'PostgreSQL', 'Clean Architecture', 'Next.js & TypeScript'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedSkill(selectedSkill === tag ? 'all' : tag)}
                  className={`px-2.5 py-1 rounded-md text-2xs font-medium transition-colors cursor-pointer shrink-0 border ${
                    selectedSkill === tag
                      ? 'border-primary bg-primary text-white font-semibold'
                      : 'border-border bg-surface-subtle text-text-secondary hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Project List & Detail View */}
          {loading ? (
            <div className="rounded-xl border border-border bg-surface p-16 text-center text-xs text-text-muted">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Đang tải danh sách dự án...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
              {error}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-16 text-center space-y-3">
              <Briefcase className="h-10 w-10 text-text-muted opacity-40 mx-auto" />
              <h3 className="text-sm font-bold text-foreground">
                {projects.length === 0 ? 'Hiện tại chưa có dự án nào đang tuyển' : 'Không tìm thấy dự án phù hợp'}
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                {projects.length === 0
                  ? 'Các dự án mới từ khách hàng sẽ được hiển thị tại đây ngay khi xuất bản.'
                  : 'Thử đổi từ khóa tìm kiếm hoặc chọn lại bộ lọc kỹ năng để xem thêm các dự án khác.'}
              </p>
              {projects.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSkill('all');
                    setBudgetRange('all');
                  }}
                  className="rounded-lg border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-border bg-surface p-6 shadow-2xs hover:border-brand-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Đang nhận ghép nối
                        </span>
                        <span className="text-2xs text-text-muted">
                          Đăng ngày {formatDate(project.createdAt)}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                      >
                        {project.title}
                      </h2>

                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Budget & Action */}
                    <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <span className="text-2xs text-text-muted block">Ngân sách dự kiến</span>
                      <div className="text-base font-extrabold text-primary font-mono">
                        {project.budgetMin && project.budgetMax
                          ? `${formatCurrency(project.budgetMin)} – ${formatCurrency(project.budgetMax)}`
                          : formatCurrency(project.budgetMax || project.budgetMin)}
                      </div>
                    </div>
                  </div>

                  {/* Skills Requirements & Application CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-2xs font-semibold text-text-muted mr-1">Kỹ năng yêu cầu:</span>
                      {project.skillRequirements.map((req) => (
                        <span
                          key={req.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-2xs font-medium border ${
                            req.isMandatory
                              ? 'bg-primary-soft text-primary border-primary/20 font-semibold'
                              : 'bg-surface-subtle text-text-secondary border-border'
                          }`}
                        >
                          {req.isMandatory && <CheckCircle2 className="h-3 w-3 text-primary" />}
                          {req.skillName}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
                      >
                        Xem chi tiết
                      </button>
                      <Link
                        href="/register?role=freelancer"
                        className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
                      >
                        Nhận dự án này
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
              <div>
                <span className="text-2xs font-semibold text-primary uppercase tracking-wider">Chi tiết công việc</span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{selectedProject.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg text-text-muted hover:text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-surface-subtle border border-border text-xs">
              <div>
                <span className="text-2xs text-text-muted block">Ngân sách dự kiến</span>
                <span className="font-bold text-foreground font-mono text-sm text-primary">
                  {selectedProject.budgetMin && selectedProject.budgetMax
                    ? `${formatCurrency(selectedProject.budgetMin)} – ${formatCurrency(selectedProject.budgetMax)}`
                    : formatCurrency(selectedProject.budgetMax || selectedProject.budgetMin)}
                </span>
              </div>
              <div>
                <span className="text-2xs text-text-muted block">Thời hạn hoàn thành</span>
                <span className="font-bold text-foreground">
                  {formatDate(selectedProject.endDate) || 'Thỏa thuận theo tiến độ'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Mô tả công việc & Phạm vi</h4>
              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                {selectedProject.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Kỹ năng bắt buộc & kiểm định</h4>
              <div className="space-y-2">
                {selectedProject.skillRequirements.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${req.isMandatory ? 'text-primary' : 'text-text-muted'}`} />
                      <span className="font-semibold text-foreground">{req.skillName}</span>
                    </div>
                    <span className="text-2xs text-text-muted">
                      {req.isMandatory ? 'Bắt buộc đạt bài test' : 'Kỹ năng ưu tiên'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                Đóng
              </button>
              {user?.role === 'Freelancer' ? (
                <Link
                  href="/dashboard/profile"
                  className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Kiểm tra kỹ năng để nhận ghép nối
                </Link>
              ) : user?.role === 'Client' ? (
                <Link
                  href="/dashboard/client/projects"
                  className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Quản lý dự án của tôi
                </Link>
              ) : (
                <Link
                  href="/register?role=freelancer"
                  className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Đăng ký để nhận ghép nối Top 3
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

