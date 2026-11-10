import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  Search,
  Briefcase,
  Calendar,
  Clock,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles
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
    try {
      const stored = localStorage.getItem('nash_saved_projects');
      if (stored) {
        setSavedProjectIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }

    fetchData();
  }, []);

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
        setError(err.error?.message || 'Không thể tải danh sách dự án.');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedProjectIds((prev) => {
      let updated: string[];
      if (prev.includes(projectId)) {
        updated = prev.filter((id) => id !== projectId);
      } else {
        updated = [...prev, projectId];
      }
      try {
        localStorage.setItem('nash_saved_projects', JSON.stringify(updated));
      } catch {
        // Storage full/disabled
      }
      return updated;
    });
  };

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

  // Check matching eligibility
  const isFreelancerEligible = (project: Project) => {
    const mandatoryReqs = project.skillRequirements.filter((r) => r.isMandatory);
    if (mandatoryReqs.length === 0) return true;
    return mandatoryReqs.every((req) =>
      verifiedSkills.some((vs) => vs.skillName.toLowerCase() === req.skillName.toLowerCase())
    );
  };

  // Unique skills in list
  const availableSkills = Array.from(
    new Set(
      projects.flatMap((p) => p.skillRequirements.map((r) => r.skillName))
    )
  );

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedSkillFilter !== 'all') {
      const hasSkill = p.skillRequirements.some(
        (r) => r.skillName.toLowerCase() === selectedSkillFilter.toLowerCase()
      );
      if (!hasSkill) return false;
    }

    if (activeTab === 'saved') {
      return savedProjectIds.includes(p.id);
    }

    if (activeTab === 'matched') {
      return isFreelancerEligible(p);
    }

    return true;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Khám phá dự án | NASH</title>
      </Head>

      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Tìm dự án phù hợp với bạn
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              Xem các dự án đang tuyển người, kiểm tra yêu cầu kỹ năng và lưu lại dự án bạn quan tâm.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Tất cả ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('matched')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'matched'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Phù hợp với tôi ({projects.filter(isFreelancerEligible).length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Đã lưu ({savedProjectIds.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {availableSkills.length > 0 && (
              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="rounded-lg border border-border bg-surface py-1.5 px-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tất cả kỹ năng</option>
                {availableSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            )}

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-xs text-text-muted">
            Đang tải danh sách dự án...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-danger-bg p-6 text-center text-xs text-danger">
            {error}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-text-muted opacity-40 mb-2" />
            <h3 className="text-sm font-bold text-foreground">Không tìm thấy dự án nào</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc kỹ năng.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const isSaved = savedProjectIds.includes(project.id);
              const eligible = isFreelancerEligible(project);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="rounded-xl border border-border bg-surface p-5 shadow-2xs hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground line-clamp-1">
                          {project.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                          <span>Đăng ngày: {formatDate(project.createdAt)}</span>
                          {project.startDate && project.endDate && (
                            <>
                              <span>•</span>
                              <span>{formatDate(project.startDate)} – {formatDate(project.endDate)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(project.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isSaved
                            ? 'border-primary bg-primary-soft text-primary'
                            : 'border-border bg-surface text-text-muted hover:text-foreground'
                        }`}
                        title={isSaved ? 'Bỏ lưu' : 'Lưu dự án'}
                      >
                        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Skill Requirements */}
                    <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-1.5">
                      {project.skillRequirements.map((req) => {
                        const hasVerified = verifiedSkills.some(
                          (vs) => vs.skillName.toLowerCase() === req.skillName.toLowerCase()
                        );

                        return (
                          <span
                            key={req.id}
                            className={`inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded border ${
                              hasVerified
                                ? 'bg-success-bg text-success border-emerald-200'
                                : req.isMandatory
                                ? 'bg-surface-subtle text-foreground border-border font-medium'
                                : 'bg-surface text-text-muted border-border'
                            }`}
                          >
                            {hasVerified && <CheckCircle2 className="h-3 w-3" />}
                            {req.skillName}
                            {req.isMandatory && ' (Bắt buộc)'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="text-2xs text-text-muted block">Ngân sách dự kiến</span>
                      <span className="font-bold text-foreground font-mono">
                        {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
                      </span>
                    </div>

                    {eligible ? (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-primary border border-brand-200">
                        Đủ điều kiện Smart Match
                      </span>
                    ) : (
                      <span className="text-2xs text-text-muted">
                        Chưa đủ kỹ năng bắt buộc
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-primary">
                  Chi Tiết Dự Án
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-surface-subtle border border-border">
                <div>
                  <span className="text-text-muted block text-2xs">Ngân sách dự toán</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(selectedProject.budgetMin)} – {formatCurrency(selectedProject.budgetMax)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-2xs">Thời hạn thực hiện</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(selectedProject.startDate)} – {formatDate(selectedProject.endDate)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground mb-1">Mô tả dự án</h4>
                <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground mb-2">Yêu cầu kỹ năng</h4>
                <div className="space-y-1.5">
                  {selectedProject.skillRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-lg border border-border bg-surface flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-foreground">
                        {req.skillName}
                        {req.isMandatory ? ' (Bắt buộc)' : ' (Ưu tiên)'}
                      </span>
                      {req.minimumExperienceYears && (
                        <span className="text-2xs text-text-muted font-mono">
                          Tối thiểu {req.minimumExperienceYears} năm KN
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-lg bg-foreground hover:bg-navy-800 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
