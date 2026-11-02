import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  Search,
  Briefcase,
  DollarSign,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Filter,
  X,
  Layers,
  Award
} from 'lucide-react';

interface ProjectSkillRequirement {
  id: string;
  skillId: string;
  skillName: string;
  isMandatory: boolean;
  minimumExperienceYears?: number;
}

interface Project {
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

interface VerifiedSkill {
  id: string;
  skillId: string;
  skillName: string;
  score: number;
}

export default function ProjectsExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkill[]>([]);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'matched'>('all');

  // Project details modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // Load saved bookmarks from local storage
    try {
      const stored = localStorage.getItem('nash_saved_projects');
      if (stored) {
        setSavedProjectIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projRes, skillsRes] = await Promise.allSettled([
          apiClient<Project[]>('/projects', {
            headers: { 'Cache-Control': 'no-cache' },
          }),
          apiClient<VerifiedSkill[]>('/skills/me/verified'),
        ]);

        if (projRes.status === 'fulfilled' && projRes.value.success && projRes.value.data) {
          setProjects(projRes.value.data);
        }
        if (skillsRes.status === 'fulfilled' && skillsRes.value.success && skillsRes.value.data) {
          setVerifiedSkills(skillsRes.value.data);
        }
      } catch (err: unknown) {
        if (err instanceof ApiException) {
          setError(err.error?.message || 'Không thể tải danh sách dự án');
        } else {
          setError('Đã xảy ra lỗi khi kết nối với máy chủ');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSaveProject = (projectId: string) => {
    setSavedProjectIds((prev) => {
      const isSaved = prev.includes(projectId);
      const updated = isSaved ? prev.filter((id) => id !== projectId) : [...prev, projectId];
      localStorage.setItem('nash_saved_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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

  // Extract all distinct skills across projects for the filter dropdown
  const allAvailableSkills = Array.from(
    new Set(projects.flatMap((p) => p.skillRequirements.map((r) => r.skillName)))
  );

  // Check if current freelancer has verified skills required by this project
  const getMatchingVerifiedSkills = (project: Project) => {
    const verifiedNames = verifiedSkills.map((v) => v.skillName.toLowerCase());
    return project.skillRequirements.filter((r) =>
      verifiedNames.includes(r.skillName.toLowerCase())
    );
  };

  // Filtered projects logic
  const filteredProjects = projects.filter((p) => {
    // Search query filter
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skillRequirements.some((r) => r.skillName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Skill filter
    if (
      selectedSkillFilter !== 'all' &&
      !p.skillRequirements.some((r) => r.skillName.toLowerCase() === selectedSkillFilter.toLowerCase())
    ) {
      return false;
    }

    // Tab filter
    if (activeTab === 'saved') {
      return savedProjectIds.includes(p.id);
    }
    if (activeTab === 'matched') {
      return getMatchingVerifiedSkills(p).length > 0;
    }

    return true;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Khám phá dự án & Cơ hội | NASH Chuyên Gia</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Thị trường dự án
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
              Cơ hội việc làm & Dự án xuất bản
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Khám phá các yêu cầu tuyển dụng đang mở. Hệ thống Smart Match sẽ tự động giới thiệu bạn với khách hàng khi hồ sơ của bạn đạt độ tương thích cao.
            </p>
          </div>
        </header>

        {/* Tab Filters & Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              Tất cả dự án ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('matched')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'matched'
                  ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              Khớp kỹ năng của tôi ({projects.filter((p) => getMatchingVerifiedSkills(p).length > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'saved'
                  ? 'bg-zinc-900 text-white dark:bg-emerald-600 dark:text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Đã lưu ({savedProjectIds.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Skill Selector */}
            {allAvailableSkills.length > 0 && (
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <option value="all">Tất cả kỹ năng</option>
                {allAvailableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            )}

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, kỹ năng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {/* Project List */}
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-zinc-400 opacity-60" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              Không tìm thấy dự án phù hợp
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              {searchQuery || selectedSkillFilter !== 'all' || activeTab !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.'
                : 'Hiện tại chưa có dự án nào được xuất bản trên nền tảng.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const isSaved = savedProjectIds.includes(project.id);
              const matchedVerified = getMatchingVerifiedSkills(project);

              return (
                <div
                  key={project.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div>
                    {/* Top row: Title and Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {matchedVerified.length > 0 && (
                          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Phù hợp kỹ năng đã xác thực
                          </span>
                        )}
                        <h3 className="line-clamp-2 text-base font-bold text-zinc-900 dark:text-white">
                          {project.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleSaveProject(project.id)}
                        className={`rounded-lg p-1.5 transition ${
                          isSaved
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
                            : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                        }`}
                        title={isSaved ? 'Bỏ lưu' : 'Lưu dự án'}
                      >
                        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Budget Badge */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      <span>
                        {formatCurrency(project.budgetMin)}
                        {project.budgetMax ? ` — ${formatCurrency(project.budgetMax)}` : ''}
                      </span>
                    </div>

                    {/* Description preview */}
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {project.description}
                    </p>

                    {/* Skill Requirement Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.skillRequirements.slice(0, 4).map((req) => (
                        <span
                          key={req.id}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                            req.isMandatory
                              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          {req.skillName}
                          {req.isMandatory && ' *'}
                        </span>
                      ))}
                      {project.skillRequirements.length > 4 && (
                        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800">
                          +{project.skillRequirements.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(project.createdAt)}
                    </span>

                    <button
                      onClick={() => setSelectedProject(project)}
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      Chi tiết <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Dự án đã xuất bản
                </span>
                <h2 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
                  {selectedProject.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Budget & Timeline Card */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div>
                  <span className="text-xs text-zinc-400">Ngân sách dự kiến</span>
                  <p className="mt-0.5 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedProject.budgetMin)}
                    {selectedProject.budgetMax ? ` — ${formatCurrency(selectedProject.budgetMax)}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-zinc-400">Thời gian thực hiện</span>
                  <p className="mt-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {selectedProject.startDate ? formatDate(selectedProject.startDate) : 'Thỏa thuận'}
                    {selectedProject.endDate ? ` — ${formatDate(selectedProject.endDate)}` : ''}
                  </p>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Mô tả chi tiết dự án
                </h3>
                <div className="mt-2 whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300">
                  {selectedProject.description}
                </div>
              </div>

              {/* Skills Required */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Kỹ năng yêu cầu
                </h3>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedProject.skillRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {req.skillName}
                        </span>
                        {req.isMandatory && (
                          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                            Bắt buộc
                          </span>
                        )}
                      </div>
                      {req.minimumExperienceYears && (
                        <span className="text-zinc-400">≥ {req.minimumExperienceYears} năm KN</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Match Note */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles className="h-4 w-4" />
                  Cơ chế kết nối NASH Direct Handshake
                </div>
                <p className="mt-1 leading-relaxed">
                  Tại NASH, bạn không cần phải viết proposal hay nộp đơn cạnh tranh spam. Thuật toán Smart Match sẽ tự động đánh giá hồ sơ và các chứng chỉ kiểm định của bạn. Nếu bạn thuộc <strong>Top 3 chuyên gia phù hợp nhất</strong>, khách hàng sẽ gửi lời mời trực tiếp đến mục <strong>Lời mời & Ghép nối</strong> của bạn.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  onClick={() => toggleSaveProject(selectedProject.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {savedProjectIds.includes(selectedProject.id) ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-emerald-600" /> Đã lưu dự án
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" /> Lưu dự án này
                    </>
                  )}
                </button>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Award className="h-4 w-4" /> Kiểm định kỹ năng liên quan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
