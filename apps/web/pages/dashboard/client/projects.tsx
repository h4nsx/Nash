import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, apiUploadFile, ApiException } from '@/lib/api/client';
import { FreelancerProfileModal } from '@/components/modals/FreelancerProfileModal';
import { OfferComposerModal } from '@/components/modals/OfferComposerModal';
import {
  Briefcase,
  Users,
  Send,
  Sparkles,
  Plus,
  ChevronRight,
  AlertCircle,
  X,
  ArrowLeft,
  ArrowRight,
  Search,
  RefreshCw,
  Pencil,
  Rocket,
  Ban,
  EyeOff,
  CheckCircle2,
  Paperclip,
  UserCheck,
  ExternalLink
} from 'lucide-react';

interface CandidateMatch {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  headline?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  jobSuccessScore?: number;
  verifiedSkills?: string[];
  score: number;
  matchVersion: string;
  reasonCodes?: string[];
  reasons: string[];
  status: number; // 0: Generated, 1: Recommended, 2: Viewed, 3: Dismissed, 4: Expired
}

interface Skill {
  id: string;
  name: string;
  description?: string;
}

interface ProjectSkillRequirement {
  id?: string;
  skillId: string;
  skillName: string;
  isMandatory: boolean;
  minimumExperienceYears?: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  subCategory?: string;
  pricingType: number; // 0: FixedPrice, 1: Hourly
  budgetMin?: number;
  budgetMax?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  scope: number; // 0: Small, 1: Medium, 2: Large
  experienceLevel: number; // 0: Entry, 1: Intermediate, 2: Expert
  locationPreference?: string;
  preferredLanguage?: string;
  startDate?: string;
  endDate?: string;
  fileAttachments?: string[];
  status: number; // 0: Draft, 1: Published, 2: InProgress, 3: Completed, 4: Cancelled
  createdAt: string;
  skillRequirements: ProjectSkillRequirement[];
}

const REASON_CODE_LABELS: Record<string, string> = {
  required_skill: 'Đạt kỹ năng yêu cầu',
  verified_skill: 'Kỹ năng đã kiểm định',
  experience: 'Đủ năm kinh nghiệm',
  budget_fit: 'Phù hợp ngân sách',
  availability: 'Sẵn sàng nhận việc',
};

const PROJECT_STATUS_META: Record<number, { label: string; dot: string; badge: string }> = {
  0: { label: 'Bản nháp (Draft)', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  1: { label: 'Đang tuyển (Published)', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  2: { label: 'Đang thực hiện', dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-800 border-sky-200' },
  3: { label: 'Đã hoàn thành', dot: 'bg-primary', badge: 'bg-brand-50 text-primary border-brand-200' },
  4: { label: 'Đã đóng / Hủy', dot: 'bg-zinc-400', badge: 'bg-surface-subtle text-text-muted border-border' },
};

const formatVnd = (amount?: number | null) => {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatHourlyVnd = (amount?: number | null) => {
  if (amount == null) return '0 ₫/giờ';
  return `${new Intl.NumberFormat('vi-VN').format(amount)} ₫/giờ`;
};

export default function ClientProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [projectSearch, setProjectSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | number>('all');

  // Create / Edit Wizard state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [creating, setCreating] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [publishImmediately, setPublishImmediately] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web & Software Development');
  const [subCategory, setSubCategory] = useState('Fullstack Development');
  const [description, setDescription] = useState('');
  const [fileAttachments, setFileAttachments] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Step 2: Skills
  const [selectedSkillRequirements, setSelectedSkillRequirements] = useState<ProjectSkillRequirement[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<number>(1);

  // Step 3: Scope & Dates
  const [scope, setScope] = useState<number>(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationPreference, setLocationPreference] = useState('Worldwide');
  const [preferredLanguage, setPreferredLanguage] = useState('Tiếng Việt & Tiếng Anh');

  // Step 4: Pricing & Budget (VND)
  const [pricingType, setPricingType] = useState<number>(0);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [hourlyRateMin, setHourlyRateMin] = useState('');
  const [hourlyRateMax, setHourlyRateMax] = useState('');

  // Selected project & Smart Match state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  // Project lifecycle actions state
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [closingProject, setClosingProject] = useState<Project | null>(null);
  const [closingLoading, setClosingLoading] = useState(false);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // Offer Composer & Candidate Profile Modal state
  const [inspectFreelancerId, setInspectFreelancerId] = useState<string | null>(null);
  const [offerTarget, setOfferTarget] = useState<{ id: string; name: string } | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady && typeof router.query.q === 'string') {
      setProjectSearch(router.query.q);
    }
  }, [router.isReady, router.query.q]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [projRes, skillsRes] = await Promise.all([
        apiClient<Project[]>('/projects/my-projects'),
        apiClient<Skill[]>('/skills'),
      ]);

      if (projRes.success && projRes.data) {
        setProjects(projRes.data);
        setSelectedProjectId((prev) => {
          if (prev && projRes.data!.some((p) => p.id === prev)) return prev;
          return projRes.data!.length > 0 ? projRes.data![0].id : null;
        });
      }
      if (skillsRes.success && skillsRes.data) {
        setAvailableSkills(skillsRes.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error.message || 'Lỗi khi tải danh sách dự án.');
      } else {
        setError('Không thể kết nối đến máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || null;

  const fetchMatchesForProject = useCallback(async (projectId: string) => {
    try {
      setLoadingMatches(true);
      setMatchError(null);
      const res = await apiClient<CandidateMatch[]>(`/projects/${projectId}/matches`);
      if (res.success && res.data) {
        setCandidates(res.data.filter((m) => m.status !== 3));
      } else {
        setCandidates([]);
      }
    } catch (err: unknown) {
      setCandidates([]);
      if (err instanceof ApiException) {
        setMatchError(err.error.message || 'Không thể tải danh sách Smart Match.');
      }
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  useEffect(() => {
    if (!activeProject || activeProject.status === 0) {
      setCandidates([]);
      setMatchError(null);
      return;
    }
    fetchMatchesForProject(activeProject.id);
  }, [activeProject?.id, activeProject?.status, fetchMatchesForProject]);

  const handleGenerateMatches = async (projectId: string) => {
    try {
      setGeneratingMatches(true);
      setMatchError(null);
      const res = await apiClient<CandidateMatch[]>(`/projects/${projectId}/matches/generate`, {
        method: 'POST',
      });
      if (res.success && res.data) {
        setCandidates(res.data.filter((m) => m.status !== 3));
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setMatchError(err.error.message || 'Không thể chạy thuật toán Smart Match.');
      } else {
        setMatchError('Lỗi kết nối khi chạy Smart Match.');
      }
    } finally {
      setGeneratingMatches(false);
    }
  };

  const handleDismissMatch = async (match: CandidateMatch) => {
    try {
      setDismissingId(match.id);
      setMatchError(null);
      const res = await apiClient(`/projects/matches/${match.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 3 }), // Dismissed
      });
      if (res.success) {
        setCandidates((prev) => prev.filter((c) => c.id !== match.id));
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setMatchError(err.error.message || 'Không thể bỏ qua ứng viên này.');
      } else {
        setMatchError('Lỗi kết nối khi cập nhật trạng thái ứng viên.');
      }
    } finally {
      setDismissingId(null);
    }
  };

  const handleToggleSkill = (skill: Skill) => {
    const existing = selectedSkillRequirements.find((s) => s.skillId === skill.id);
    if (existing) {
      setSelectedSkillRequirements((prev) => prev.filter((s) => s.skillId !== skill.id));
    } else {
      setSelectedSkillRequirements((prev) => [
        ...prev,
        {
          skillId: skill.id,
          skillName: skill.name,
          isMandatory: true,
          minimumExperienceYears: 2,
        },
      ]);
    }
  };

  const handleUpdateSkillMandatory = (skillId: string, isMandatory: boolean) => {
    setSelectedSkillRequirements((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, isMandatory } : s))
    );
  };

  const resetForm = () => {
    setEditingProject(null);
    setWizardStep(1);
    setWizardError(null);
    setTitle('');
    setCategory('Web & Software Development');
    setSubCategory('Fullstack Development');
    setDescription('');
    setFileAttachments([]);
    setSelectedSkillRequirements([]);
    setSkillSearch('');
    setExperienceLevel(1);
    setScope(1);
    setStartDate('');
    setEndDate('');
    setLocationPreference('Worldwide');
    setPreferredLanguage('Tiếng Việt & Tiếng Anh');
    setPricingType(0);
    setBudgetMin('');
    setBudgetMax('');
    setHourlyRateMin('');
    setHourlyRateMax('');
    setPublishImmediately(true);
  };

  const openEditWizard = (proj: Project) => {
    setEditingProject(proj);
    setWizardStep(1);
    setWizardError(null);
    setTitle(proj.title);
    setCategory(proj.category || 'Web & Software Development');
    setSubCategory(proj.subCategory || '');
    setDescription(proj.description);
    setFileAttachments(proj.fileAttachments || []);
    setSelectedSkillRequirements(proj.skillRequirements || []);
    setSkillSearch('');
    setExperienceLevel(proj.experienceLevel ?? 1);
    setScope(proj.scope ?? 1);
    setStartDate(proj.startDate ? proj.startDate.substring(0, 10) : '');
    setEndDate(proj.endDate ? proj.endDate.substring(0, 10) : '');
    setLocationPreference(proj.locationPreference || 'Worldwide');
    setPreferredLanguage(proj.preferredLanguage || 'Tiếng Việt & Tiếng Anh');
    setPricingType(proj.pricingType ?? 0);
    setBudgetMin(proj.budgetMin != null ? String(proj.budgetMin) : '');
    setBudgetMax(proj.budgetMax != null ? String(proj.budgetMax) : '');
    setHourlyRateMin(proj.hourlyRateMin != null ? String(proj.hourlyRateMin) : '');
    setHourlyRateMax(proj.hourlyRateMax != null ? String(proj.hourlyRateMax) : '');
    setPublishImmediately(false);
    setShowCreateModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setWizardError(null);

    try {
      const basePayload = {
        title,
        description,
        category,
        subCategory,
        pricingType,
        budgetMin: budgetMin ? parseFloat(budgetMin) : null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        hourlyRateMin: hourlyRateMin ? parseFloat(hourlyRateMin) : null,
        hourlyRateMax: hourlyRateMax ? parseFloat(hourlyRateMax) : null,
        scope,
        experienceLevel,
        locationPreference,
        preferredLanguage,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        fileAttachments,
      };

      if (editingProject) {
        const projId = editingProject.id;
        await apiClient(`/projects/${projId}`, {
          method: 'PUT',
          body: JSON.stringify(basePayload),
        });

        const oldReqs = editingProject.skillRequirements || [];
        const removed = oldReqs.filter(
          (o) => !selectedSkillRequirements.some((n) => n.skillId === o.skillId)
        );
        for (const rem of removed) {
          await apiClient(`/projects/${projId}/skills/${rem.skillId}`, {
            method: 'DELETE',
          });
        }

        for (const req of selectedSkillRequirements) {
          const prev = oldReqs.find((o) => o.skillId === req.skillId);
          if (
            !prev ||
            prev.isMandatory !== req.isMandatory ||
            prev.minimumExperienceYears !== req.minimumExperienceYears
          ) {
            await apiClient(`/projects/${projId}/skills`, {
              method: 'POST',
              body: JSON.stringify({
                skillId: req.skillId,
                isMandatory: req.isMandatory,
                minimumExperienceYears: req.minimumExperienceYears || 1,
              }),
            });
          }
        }

        if (publishImmediately) {
          await apiClient(`/projects/${projId}/publish`, { method: 'POST' });
          await handleGenerateMatches(projId);
          setActionBanner('Đã cập nhật, xuất bản dự án và chạy Smart Match Top 3.');
        } else {
          setActionBanner('Đã cập nhật bản nháp dự án thành công.');
        }

        setShowCreateModal(false);
        resetForm();
        await fetchProjects();
        setSelectedProjectId(projId);
      } else {
        const res = await apiClient<{ id: string }>('/projects', {
          method: 'POST',
          body: JSON.stringify({
            ...basePayload,
            skillRequirements: selectedSkillRequirements.map((s) => ({
              skillId: s.skillId,
              isMandatory: s.isMandatory,
              minimumExperienceYears: s.minimumExperienceYears || 1,
            })),
          }),
        });

        if (res.success && res.data) {
          const newProjId = res.data.id;
          if (publishImmediately) {
            await apiClient(`/projects/${newProjId}/publish`, { method: 'POST' });
            await handleGenerateMatches(newProjId);
            setActionBanner('Đã đăng dự án và tìm Top 3 ứng viên Smart Match!');
          } else {
            setActionBanner('Đã lưu dự án dưới dạng Bản nháp.');
          }
          setShowCreateModal(false);
          resetForm();
          await fetchProjects();
          setSelectedProjectId(newProjId);
        }
      }
    } catch (err: unknown) {
      setWizardError(
        err instanceof ApiException ? err.error.message : 'Lưu dự án thất bại. Vui lòng thử lại.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handlePublishDraft = async (project: Project) => {
    try {
      setPublishingId(project.id);
      setError(null);
      setActionBanner(null);
      await apiClient(`/projects/${project.id}/publish`, { method: 'POST' });
      await fetchProjects();
      await handleGenerateMatches(project.id);
      setActionBanner(`Đã xuất bản dự án "${project.title}" và chạy Smart Match Top 3.`);
    } catch (err: unknown) {
      setError(err instanceof ApiException ? err.error.message : 'Không thể xuất bản dự án.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleCloseProject = async () => {
    if (!closingProject) return;
    try {
      setClosingLoading(true);
      setError(null);
      await apiClient(`/projects/${closingProject.id}/close`, { method: 'POST' });
      setActionBanner(`Đã đóng dự án "${closingProject.title}".`);
      setClosingProject(null);
      await fetchProjects();
    } catch (err: unknown) {
      setError(err instanceof ApiException ? err.error.message : 'Không thể đóng dự án.');
      setClosingProject(null);
    } finally {
      setClosingLoading(false);
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingFile(true);
      setWizardError(null);
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiUploadFile<{ url: string }>('/media/upload', formData);
      if (res.success && res.data?.url) {
        setFileAttachments((prev) => [...prev, res.data!.url]);
      }
    } catch (err: unknown) {
      setWizardError(err instanceof ApiException ? err.error.message : 'Tải tệp đính kèm thất bại.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const filteredProjects = projects.filter((proj) => {
    const query = projectSearch.trim().toLowerCase();
    const matchesQuery =
      !query ||
      proj.title.toLowerCase().includes(query) ||
      proj.description.toLowerCase().includes(query) ||
      (proj.category && proj.category.toLowerCase().includes(query));

    if (!matchesQuery) return false;
    if (statusFilter !== 'all' && proj.status !== statusFilter) return false;
    return true;
  });

  const renderProjectBudget = (proj: Project) => {
    if (proj.pricingType === 1) {
      return `${formatHourlyVnd(proj.hourlyRateMin)} – ${formatHourlyVnd(proj.hourlyRateMax)}`;
    }
    return `${formatVnd(proj.budgetMin)} – ${formatVnd(proj.budgetMax)}`;
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Quản Lý Dự Án & Tuyển Dụng | NASH Client Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Quản Lý Dự Án & Smart Match Top 3
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Đăng tin tuyển dụng chuẩn hóa, lọc ứng viên chính xác bằng thuật toán Explainable Matching.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Đăng dự án tuyển dụng mới
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionBanner && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{actionBanner}</span>
            </div>
            <button
              onClick={() => setActionBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main 2-Column Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Dự án của bạn ({filteredProjects.length}/{projects.length})
                </h2>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tiêu đề, mô tả dự án..."
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'all' as const, label: 'Tất cả' },
                  { key: 0, label: 'Nháp' },
                  { key: 1, label: 'Đang tuyển' },
                  { key: 2, label: 'Đang chạy' },
                  { key: 3, label: 'Hoàn thành' },
                  { key: 4, label: 'Đã đóng' },
                ].map((tab) => (
                  <button
                    key={String(tab.key)}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`rounded-lg px-2.5 py-1 text-3xs font-semibold border transition-colors cursor-pointer ${
                      statusFilter === tab.key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-text-secondary border-border hover:bg-surface-subtle'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-surface text-xs text-text-muted">
                Đang tải danh sách dự án...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                <Briefcase className="h-10 w-10 text-text-muted mb-2 stroke-1" />
                <p className="text-xs font-bold text-foreground">
                  {projects.length === 0 ? 'Chưa có dự án nào' : 'Không tìm thấy dự án khớp bộ lọc'}
                </p>
                <p className="text-2xs text-text-muted mt-1 max-w-xs">
                  {projects.length === 0
                    ? 'Bấm "Đăng dự án tuyển dụng mới" để tìm các Freelancer sở hữu huy hiệu năng lực chuẩn hóa.'
                    : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredProjects.map((proj) => {
                  const isSelected = proj.id === selectedProjectId;
                  const statusMeta = PROJECT_STATUS_META[proj.status] || PROJECT_STATUS_META[0];
                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary-soft/30 shadow-xs'
                          : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-subtle/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${statusMeta.dot}`} />
                            <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {proj.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-2xs text-text-secondary line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'text-primary translate-x-1' : 'text-text-muted'
                          }`}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-3xs text-text-muted">
                        <span className="font-semibold text-foreground font-mono">
                          {renderProjectBudget(proj)}
                        </span>
                        <span>•</span>
                        <span>{proj.skillRequirements?.length || 0} kỹ năng yêu cầu</span>
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 font-bold border ${statusMeta.badge}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Smart Match Top 3 for Active Project (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-5">
              {activeProject ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/70 pb-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-0.5 text-3xs font-bold text-primary">
                        <Sparkles className="h-3 w-3" /> Thuật Toán Khớp Lệnh Explainable Match
                      </div>
                      <h2 className="text-base font-bold text-foreground">{activeProject.title}</h2>
                      <p className="text-2xs text-text-muted">
                        {activeProject.category || 'Công nghệ thông tin'} •{' '}
                        {activeProject.experienceLevel === 2
                          ? 'Yêu cầu: Chuyên gia (Expert)'
                          : activeProject.experienceLevel === 0
                          ? 'Yêu cầu: Cơ bản (Entry)'
                          : 'Yêu cầu: Trung cấp (Intermediate)'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-2xs text-text-muted">Ngân sách dự kiến</div>
                      <div className="text-sm font-extrabold text-foreground font-mono">
                        {activeProject.pricingType === 1
                          ? `${formatHourlyVnd(activeProject.hourlyRateMin)} – ${formatHourlyVnd(activeProject.hourlyRateMax)}`
                          : formatVnd(activeProject.budgetMax ?? activeProject.budgetMin ?? 0)}
                      </div>
                    </div>
                  </div>

                  {/* Project Lifecycle Action Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {activeProject.status === 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditWizard(activeProject)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Chỉnh sửa bản nháp
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePublishDraft(activeProject)}
                          disabled={publishingId === activeProject.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                          <Rocket className="h-3.5 w-3.5" />
                          {publishingId === activeProject.id
                            ? 'Đang xuất bản...'
                            : 'Xuất bản & Tìm Top 3'}
                        </button>
                      </>
                    )}

                    {activeProject.status === 1 && (
                      <button
                        type="button"
                        onClick={() => handleGenerateMatches(activeProject.id)}
                        disabled={generatingMatches}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary-soft/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft/60 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${generatingMatches ? 'animate-spin' : ''}`}
                        />
                        {generatingMatches ? 'Đang tính toán...' : 'Làm mới Smart Match'}
                      </button>
                    )}

                    {(activeProject.status === 0 || activeProject.status === 1) && (
                      <button
                        type="button"
                        onClick={() => setClosingProject(activeProject)}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Đóng dự án
                      </button>
                    )}
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <span className="text-2xs font-semibold text-text-muted">
                      Kỹ năng bắt buộc & ưu tiên:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProject.skillRequirements.map((req) => (
                        <span
                          key={req.skillId}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-3xs font-semibold border ${
                            req.isMandatory
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-surface-subtle text-foreground border-border'
                          }`}
                        >
                          {req.skillName}
                          <span className="opacity-60 text-4xs">
                            ({req.isMandatory ? 'Bắt buộc' : 'Ưu tiên'})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project File Attachments */}
                  {activeProject.fileAttachments && activeProject.fileAttachments.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-2xs font-semibold text-text-muted">
                        Tài liệu đặc tả đính kèm ({activeProject.fileAttachments.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activeProject.fileAttachments.map((fileUrl, idx) => (
                          <a
                            key={idx}
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-2xs font-medium text-primary hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            Tài liệu #{idx + 1}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top 3 Matches Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" /> Top Ứng Viên Phù Hợp Nhất
                      </h3>
                      <span className="text-3xs text-text-muted">Tối đa 3 ứng viên xuất sắc nhất</span>
                    </div>

                    {inviteSuccess && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
                        <span>{inviteSuccess}</span>
                        <Link
                          href="/dashboard/matches"
                          className="text-primary underline hover:text-primary-hover"
                        >
                          Xem trong Lời mời & Bắt tay →
                        </Link>
                      </div>
                    )}

                    {matchError && (
                      <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
                        {matchError}
                      </div>
                    )}

                    {loadingMatches || generatingMatches ? (
                      <div className="flex h-36 items-center justify-center text-xs text-text-muted">
                        Đang phân tích và tính toán điểm khớp lệnh...
                      </div>
                    ) : candidates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border bg-surface-subtle/50 p-6 text-center text-xs text-text-muted space-y-2">
                        {activeProject.status === 0 ? (
                          <p>
                            Dự án đang ở trạng thái Nháp. Hãy bấm &quot;Xuất bản &amp; Tìm Top 3&quot; để hệ thống tự động tìm ứng viên.
                          </p>
                        ) : activeProject.status === 4 ? (
                          <p>Dự án này đã đóng.</p>
                        ) : (
                          <>
                            <p>
                              Hiện chưa có ứng viên nào đáp ứng đầy đủ 100% các điều kiện kỹ năng bắt buộc hoặc chưa có dữ liệu Smart Match.
                            </p>
                            {activeProject.status === 1 && (
                              <button
                                type="button"
                                onClick={() => handleGenerateMatches(activeProject.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover cursor-pointer"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                Chạy Smart Match ngay
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {candidates.map((cand, idx) => (
                          <div
                            key={cand.id || cand.freelancerId}
                            className="rounded-xl border border-border bg-surface-subtle/40 p-4 transition-all hover:border-primary/50 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-sm">
                                  {cand.freelancerName?.[0] || 'F'}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-xs font-bold text-foreground">
                                      {cand.freelancerName}
                                    </h4>
                                    {idx === 0 && (
                                      <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-4xs font-extrabold">
                                        TOP 1 MATCH
                                      </span>
                                    )}
                                    {cand.matchVersion && (
                                      <span className="rounded bg-surface px-1.5 py-0.5 text-4xs font-mono text-text-muted border border-border">
                                        {cand.matchVersion}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-2xs text-text-muted">
                                    Xếp hạng #{idx + 1}
                                    {cand.headline ? ` • ${cand.headline}` : ''}
                                    {cand.yearsOfExperience != null ? ` • ${cand.yearsOfExperience} năm KN` : ''}
                                    {cand.hourlyRate ? ` • ${formatHourlyVnd(cand.hourlyRate)}` : ''}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-base font-black text-primary">
                                  {Math.round(cand.score)}%
                                </span>
                                <div className="text-3xs text-text-muted">Điểm tương thích</div>
                              </div>
                            </div>

                            {/* Reason Code Pills & Explanation */}
                            <div className="rounded-lg bg-surface p-2.5 border border-border text-2xs space-y-2">
                              {cand.reasonCodes && cand.reasonCodes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {cand.reasonCodes.map((code) => (
                                    <span
                                      key={code}
                                      className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-4xs font-semibold text-emerald-700"
                                    >
                                      {REASON_CODE_LABELS[code] || code}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="font-semibold text-foreground">
                                Căn cứ giải thích khớp lệnh:
                              </div>
                              {cand.reasons && cand.reasons.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-0.5 text-text-secondary text-3xs">
                                  {cand.reasons.map((reason, rIdx) => (
                                    <li key={rIdx} className="text-emerald-700 font-medium">
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-3xs text-text-muted">
                                  Đáp ứng các yêu cầu kỹ năng bắt buộc và khả năng sẵn sàng nhận việc.
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setInspectFreelancerId(cand.freelancerId)}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                              >
                                <UserCheck className="h-3.5 w-3.5 text-primary" />
                                Xem hồ sơ đầy đủ
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissMatch(cand)}
                                disabled={dismissingId === cand.id}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-subtle hover:text-foreground disabled:opacity-50 cursor-pointer"
                              >
                                <EyeOff className="h-3 w-3" />
                                {dismissingId === cand.id ? 'Đang ẩn...' : 'Bỏ qua'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setOfferTarget({
                                    id: cand.freelancerId,
                                    name: cand.freelancerName,
                                  })
                                }
                                disabled={activeProject.status !== 1}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                <Send className="h-3 w-3" />
                                Gửi lời mời &amp; Hợp đồng
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-64 items-center justify-center text-xs text-text-muted">
                  Chọn một dự án ở danh sách bên trái để xem ứng viên Smart Match.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Project Creation / Edit Wizard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header & Step Indicator */}
            <div className="border-b border-border bg-surface-subtle p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {editingProject
                      ? 'Chỉnh Sửa Dự Án Bản Nháp'
                      : 'Đăng Tin Tuyển Dụng & Dự Án Mới'}
                  </h3>
                  <p className="text-2xs text-text-muted">
                    Bước {wizardStep}/4:{' '}
                    {wizardStep === 1
                      ? 'Tiêu đề & Chuyên ngành'
                      : wizardStep === 2
                      ? 'Kỹ năng & Trình độ yêu cầu'
                      : wizardStep === 3
                      ? 'Quy mô & Mốc thời gian'
                      : 'Ngân sách & Hình thức thanh toán (VND)'}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1.5 text-text-muted hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      step <= wizardStep ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Modal Body: Wizard Steps */}
            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6 space-y-4">
              {wizardError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  {wizardError}
                </div>
              )}

              {/* STEP 1: Title & Category */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Tiêu đề công việc / dự án <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: Xây dựng hệ thống Web Fullstack .NET 8 & Next.js"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Lĩnh vực chính</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      >
                        <option value="Web & Software Development">Phát triển Phần mềm & Web</option>
                        <option value="Mobile App Development">Lập trình Di động (iOS / Android)</option>
                        <option value="AI, Machine Learning & Data">Trí tuệ nhân tạo & Dữ liệu</option>
                        <option value="UI/UX & Product Design">Thiết kế Giao diện & Trải nghiệm (UI/UX)</option>
                        <option value="DevOps & Cloud Solutions">Hạ tầng Cloud & DevOps</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Phân ngành cụ thể</label>
                      <input
                        type="text"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        placeholder="VD: Fullstack Engineering"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Mô tả chi tiết bài toán & Yêu cầu bàn giao <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả cụ thể bối cảnh dự án, các tính năng cần phát triển, yêu cầu bảo mật, tiến độ và tiêu chí nghiệm thu sản phẩm..."
                      className="w-full rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-foreground focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  {/* Step 1 File Attachments */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-foreground">
                      Tài liệu đặc tả / Đính kèm (PDF, Word, Excel, Ảnh, ZIP • tối đa 10 MB)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-border/40 cursor-pointer">
                        <Paperclip className="h-3.5 w-3.5 text-primary" />
                        <span>{uploadingFile ? 'Đang tải lên...' : 'Chọn tệp đính kèm'}</span>
                        <input
                          type="file"
                          disabled={uploadingFile}
                          onChange={handleAttachmentUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {fileAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {fileAttachments.map((url, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-2xs text-foreground"
                          >
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              Tài liệu #{idx + 1}
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                setFileAttachments((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="text-text-muted hover:text-rose-600 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Skills & Requirements */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Chọn các kỹ năng yêu cầu (Nhấn để chọn/bỏ chọn) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Tìm kiếm kỹ năng trong danh mục..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground mb-2"
                    />

                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 border border-border rounded-lg bg-surface-subtle">
                      {availableSkills
                        .filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()))
                        .map((skill) => {
                          const isSelected = selectedSkillRequirements.some(
                            (s) => s.skillId === skill.id
                          );
                          return (
                            <button
                              type="button"
                              key={skill.id}
                              onClick={() => handleToggleSkill(skill)}
                              className={`rounded-lg px-2.5 py-1 text-2xs font-semibold transition-colors cursor-pointer border ${
                                isSelected
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-surface text-foreground border-border hover:bg-border/40'
                              }`}
                            >
                              {isSelected ? `✓ ${skill.name}` : `+ ${skill.name}`}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {selectedSkillRequirements.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-2xs font-bold text-foreground">
                        Cấu hình tiêu chí cho từng kỹ năng đã chọn:
                      </div>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {selectedSkillRequirements.map((req) => (
                          <div
                            key={req.skillId}
                            className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface text-xs"
                          >
                            <span className="font-bold text-foreground">{req.skillName}</span>
                            <label className="flex items-center gap-1.5 text-2xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={req.isMandatory}
                                onChange={(e) =>
                                  handleUpdateSkillMandatory(req.skillId, e.target.checked)
                                }
                                className="rounded border-border text-primary"
                              />
                              <span
                                className={
                                  req.isMandatory ? 'font-bold text-rose-600' : 'text-text-muted'
                                }
                              >
                                {req.isMandatory ? 'Bắt buộc' : 'Ưu tiên'}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <label className="text-xs font-semibold text-foreground">
                      Cấp độ kinh nghiệm mong muốn
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { level: 0, label: 'Entry Level', desc: 'Cơ bản / 1 năm' },
                        { level: 1, label: 'Intermediate', desc: 'Thực chiến / 2-4 năm' },
                        { level: 2, label: 'Expert / Lead', desc: 'Chuyên sâu / 5+ năm' },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.level}
                          onClick={() => setExperienceLevel(item.level)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            experienceLevel === item.level
                              ? 'border-primary bg-primary-soft text-foreground'
                              : 'border-border bg-surface text-text-secondary hover:bg-surface-subtle'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-3xs text-text-muted">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Scope & Timeline */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Quy mô dự án</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { s: 0, label: 'Dự án Nhỏ', time: '1 - 2 tuần' },
                        { s: 1, label: 'Dự án Vừa', time: '1 - 3 tháng' },
                        { s: 2, label: 'Dự án Lớn', time: '> 3 - 6 tháng' },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.s}
                          onClick={() => setScope(item.s)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            scope === item.s
                              ? 'border-primary bg-primary-soft text-foreground'
                              : 'border-border bg-surface text-text-secondary hover:bg-surface-subtle'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-3xs text-text-muted">{item.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Ngày bắt đầu dự kiến
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Hạn chót bàn giao (Deadline)
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Ưu tiên vị trí địa lý
                      </label>
                      <input
                        type="text"
                        value={locationPreference}
                        onChange={(e) => setLocationPreference(e.target.value)}
                        placeholder="Worldwide / Việt Nam"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Ngôn ngữ trao đổi chính
                      </label>
                      <input
                        type="text"
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        placeholder="Tiếng Việt & Tiếng Anh"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Budget & Pricing (VND) */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Hình thức chi trả thù lao
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPricingType(0)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          pricingType === 0
                            ? 'border-primary bg-primary-soft text-foreground'
                            : 'border-border bg-surface text-text-secondary hover:bg-surface-subtle'
                        }`}
                      >
                        <div className="text-xs font-bold">Giá trọn gói (Fixed Price)</div>
                        <div className="text-3xs text-text-muted">Chi trả theo cột mốc nghiệm thu</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricingType(1)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          pricingType === 1
                            ? 'border-primary bg-primary-soft text-foreground'
                            : 'border-border bg-surface text-text-secondary hover:bg-surface-subtle'
                        }`}
                      >
                        <div className="text-xs font-bold">Theo giờ (Hourly Rate)</div>
                        <div className="text-3xs text-text-muted">
                          Chi trả dựa trên số giờ làm việc thực tế
                        </div>
                      </button>
                    </div>
                  </div>

                  {pricingType === 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Ngân sách tối thiểu (VND)
                        </label>
                        <input
                          type="number"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                          placeholder="VD: 10000000"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground font-mono focus:border-primary focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Ngân sách tối đa (VND)
                        </label>
                        <input
                          type="number"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                          placeholder="VD: 30000000"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground font-mono focus:border-primary focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Mức thù lao giờ tối thiểu (VND/giờ)
                        </label>
                        <input
                          type="number"
                          value={hourlyRateMin}
                          onChange={(e) => setHourlyRateMin(e.target.value)}
                          placeholder="VD: 250000"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground font-mono focus:border-primary focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Mức thù lao giờ tối đa (VND/giờ)
                        </label>
                        <input
                          type="number"
                          value={hourlyRateMax}
                          onChange={(e) => setHourlyRateMax(e.target.value)}
                          placeholder="VD: 500000"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground font-mono focus:border-primary focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-primary/40 bg-primary-soft/20 p-4 space-y-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={publishImmediately}
                        onChange={(e) => setPublishImmediately(e.target.checked)}
                        className="rounded border-border text-primary"
                      />
                      <span className="font-bold text-foreground">
                        Xuất bản ngay & Tự động chạy Smart Match tìm Top 3 ứng viên
                      </span>
                    </label>
                    <p className="text-3xs text-text-muted pl-5">
                      Nếu không chọn, dự án sẽ được lưu dưới dạng Bản nháp (Draft) và bạn có thể chỉnh sửa tiếp sau.
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setWizardStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
                  </button>
                ) : (
                  <div />
                )}

                {wizardStep < 4 ? (
                  <button
                    type="button"
                    disabled={wizardStep === 1 && (!title || !description)}
                    onClick={() =>
                      setWizardStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Tiếp tục <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    {creating
                      ? 'Đang lưu...'
                      : editingProject
                      ? 'Lưu thay đổi dự án'
                      : 'Hoàn tất & Tạo dự án'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <FreelancerProfileModal
        freelancerId={inspectFreelancerId}
        onClose={() => setInspectFreelancerId(null)}
        onInvite={(fl) => {
          setInspectFreelancerId(null);
          if (activeProject?.status === 1) {
            setOfferTarget(fl);
          }
        }}
      />

      <OfferComposerModal
        isOpen={Boolean(offerTarget)}
        onClose={() => setOfferTarget(null)}
        freelancer={offerTarget}
        fixedProject={activeProject}
        onSuccess={(invitedName) => {
          setInviteSuccess(
            `Đã gửi lời mời hợp tác kèm bản thảo hợp đồng tới ${invitedName}!`
          );
        }}
      />

      {/* Close Project Confirmation Modal */}
      {closingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Xác nhận đóng dự án</h3>
              <button
                type="button"
                onClick={() => setClosingProject(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Bạn có chắc chắn muốn đóng dự án <strong>{closingProject.title}</strong>? Sau khi đóng, dự án sẽ chuyển sang trạng thái Đã đóng / Hủy và không thể tiếp tục tuyển thêm ứng viên.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setClosingProject(null)}
                className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={closingLoading}
                onClick={handleCloseProject}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {closingLoading ? 'Đang đóng...' : 'Xác nhận đóng dự án'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
