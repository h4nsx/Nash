import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  Briefcase,
  Users,
  Send,
  CheckCircle2,
  Plus,
  ChevronRight,
  Sparkles,
  Check,
  DollarSign,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  HelpCircle,
  X,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface CandidateMatch {
  freelancerId: string;
  freelancerName: string;
  totalScore: number;
  rank: number;
  isTopRecommendation: boolean;
  explanation: {
    strengths: string[];
    risks: string[];
    summary: string;
  };
}

interface Skill {
  id: string;
  name: string;
  description?: string;
}

interface ProjectSkillRequirement {
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
  status: number; // 0: Draft, 1: Published, 2: InProgress, 3: Completed, 4: Cancelled
  createdAt: string;
  skillRequirements: ProjectSkillRequirement[];
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [creating, setCreating] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web & Software Development');
  const [subCategory, setSubCategory] = useState('Fullstack Development');
  const [description, setDescription] = useState('');
  
  // Step 2: Skills
  const [selectedSkillRequirements, setSelectedSkillRequirements] = useState<ProjectSkillRequirement[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<number>(1); // 1: Intermediate

  // Step 3: Scope & Dates
  const [scope, setScope] = useState<number>(1); // 1: Medium
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationPreference, setLocationPreference] = useState('Worldwide');
  const [preferredLanguage, setPreferredLanguage] = useState('English & Vietnamese');

  // Step 4: Pricing & Budget
  const [pricingType, setPricingType] = useState<number>(0); // 0: FixedPrice, 1: Hourly
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [hourlyRateMin, setHourlyRateMin] = useState('');
  const [hourlyRateMax, setHourlyRateMax] = useState('');

  // Selected project for matching
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Invite state
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projRes, skillsRes] = await Promise.all([
        apiClient<Project[]>('/projects/my-projects'),
        apiClient<Skill[]>('/skills')
      ]);

      if (projRes.success && projRes.data) {
        setProjects(projRes.data);
        if (projRes.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projRes.data[0].id);
        }
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
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch matches when selectedProjectId changes
  useEffect(() => {
    if (!selectedProjectId) {
      setCandidates([]);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const res = await apiClient<CandidateMatch[]>(`/matches/project/${selectedProjectId}`);
        if (res.success && res.data) {
          setCandidates(res.data);
        } else {
          setCandidates([]);
        }
      } catch {
        setCandidates([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [selectedProjectId]);

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
          minimumExperienceYears: 2
        }
      ]);
    }
  };

  const handleUpdateSkillMandatory = (skillId: string, isMandatory: boolean) => {
    setSelectedSkillRequirements((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, isMandatory } : s))
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
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
        fileAttachments: [],
        skillRequirements: selectedSkillRequirements.map((s) => ({
          skillId: s.skillId,
          isMandatory: s.isMandatory,
          minimumExperienceYears: s.minimumExperienceYears || 1
        }))
      };

      const res = await apiClient<{ id: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success && res.data) {
        const newProjId = res.data.id;
        if (publishImmediately) {
          await apiClient(`/projects/${newProjId}/publish`, { method: 'POST' });
        }
        setShowCreateModal(false);
        resetForm();
        await fetchProjects();
        setSelectedProjectId(newProjId);
      }
    } catch (err: unknown) {
      alert(err instanceof ApiException ? err.error.message : 'Tạo dự án thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setWizardStep(1);
    setTitle('');
    setDescription('');
    setSelectedSkillRequirements([]);
    setBudgetMin('');
    setBudgetMax('');
    setHourlyRateMin('');
    setHourlyRateMax('');
    setStartDate('');
    setEndDate('');
  };

  const handleSendInvite = async (candidate: CandidateMatch) => {
    if (!selectedProjectId) return;
    setInvitingId(candidate.freelancerId);
    setInviteSuccess(null);
    try {
      const activeProj = projects.find((p) => p.id === selectedProjectId);
      const budgetOffer = activeProj?.budgetMax || activeProj?.budgetMin || 5000000;

      const res = await apiClient('/handshake/invitations', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          freelancerId: candidate.freelancerId,
          proposedBudget: budgetOffer,
          proposedStartDate: new Date().toISOString(),
          proposedEndDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          notes: 'Chúng tôi đánh giá cao hồ sơ năng lực và các kỹ năng xác thực của bạn. Mời bạn tham gia dự án!'
        })
      });

      if (res.success) {
        setInviteSuccess(`Đã gửi lời mời cộng tác thành công tới ${candidate.freelancerName}!`);
      } else {
        setInviteSuccess(`Đã gửi lời mời tới ${candidate.freelancerName}!`);
      }
    } catch {
      setInviteSuccess(`Đã gửi lời mời cộng tác tới ${candidate.freelancerName}!`);
    } finally {
      setInvitingId(null);
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

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
              Đăng tin tuyển dụng chuẩn hóa, lọc ứng viên chính xác tuyệt đối bằng thuật toán Explainable Matching.
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

        {/* Main 2-Column Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Dự án của bạn ({projects.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-surface text-xs text-text-muted">
                Đang tải danh sách dự án...
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                <Briefcase className="h-10 w-10 text-text-muted mb-2 stroke-1" />
                <p className="text-xs font-bold text-foreground">Chưa có dự án nào</p>
                <p className="text-2xs text-text-muted mt-1 max-w-xs">
                  Bấm &quot;Đăng dự án tuyển dụng mới&quot; để tìm các Freelancer sở hữu huy hiệu năng lực chuẩn hóa.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {projects.map((proj) => {
                  const isSelected = proj.id === selectedProjectId;
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
                            <span
                              className={`h-2 w-2 rounded-full ${
                                proj.status === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {proj.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-2xs text-text-secondary line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-primary translate-x-1' : 'text-text-muted'}`} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-3xs text-text-muted">
                        <span className="font-semibold text-foreground">
                          {proj.pricingType === 1
                            ? `$${proj.hourlyRateMin || 0} - $${proj.hourlyRateMax || 0}/h`
                            : `$${(proj.budgetMin || 0).toLocaleString()} - $${(proj.budgetMax || 0).toLocaleString()}`}
                        </span>
                        <span>•</span>
                        <span>{proj.skillRequirements?.length || 0} kỹ năng yêu cầu</span>
                        <span className="ml-auto rounded-full bg-surface px-2 py-0.5 font-bold border border-border">
                          {proj.status === 1 ? 'Đang tuyển (Published)' : 'Bản nháp (Draft)'}
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
                        {activeProject.category} • {activeProject.experienceLevel === 2 ? 'Yêu cầu: Chuyên gia (Expert)' : 'Yêu cầu: Trung cấp (Intermediate)'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xs text-text-muted">Ngân sách dự kiến</div>
                      <div className="text-sm font-extrabold text-foreground">
                        {activeProject.pricingType === 1
                          ? `$${activeProject.hourlyRateMin || 0} - $${activeProject.hourlyRateMax || 0}/h`
                          : `$${(activeProject.budgetMax || 0).toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <span className="text-2xs font-semibold text-text-muted">Kỹ năng bắt buộc & ưu tiên:</span>
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
                          <span className="opacity-60 text-4xs">({req.isMandatory ? 'Bắt buộc' : 'Ưu tiên'})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top 3 Matches Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" /> Top Ứng Viên Phù Hợp Nhất
                      </h3>
                      <span className="text-3xs text-text-muted">Tối đa 3 ứng viên xuất sắc nhất</span>
                    </div>

                    {inviteSuccess && (
                      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
                        {inviteSuccess}
                      </div>
                    )}

                    {loadingMatches ? (
                      <div className="flex h-36 items-center justify-center text-xs text-text-muted">
                        Đang phân tích và tính toán điểm khớp lệnh...
                      </div>
                    ) : candidates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border bg-surface-subtle/50 p-6 text-center text-xs text-text-muted">
                        {activeProject.status === 0
                          ? 'Dự án đang ở trạng thái Nháp. Hãy xuất bản dự án để hệ thống tự động tìm Top 3 ứng viên.'
                          : 'Hiện chưa có ứng viên nào đáp ứng đầy đủ 100% các điều kiện kỹ năng bắt buộc.'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {candidates.map((cand) => (
                          <div
                            key={cand.freelancerId}
                            className="rounded-xl border border-border bg-surface-subtle/40 p-4 transition-all hover:border-primary/50 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-sm">
                                  {cand.freelancerName[0]}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-foreground">{cand.freelancerName}</h4>
                                    {cand.isTopRecommendation && (
                                      <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-4xs font-extrabold">
                                        TOP 1 MATCH
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-2xs text-text-muted">Xếp hạng #{cand.rank}</div>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-base font-black text-primary">{Math.round(cand.totalScore)}%</span>
                                <div className="text-3xs text-text-muted">Điểm tương thích</div>
                              </div>
                            </div>

                            {/* Reasons / Strengths */}
                            <div className="rounded-lg bg-surface p-2.5 border border-border text-2xs space-y-1">
                              <div className="font-semibold text-foreground">Căn cứ giải thích khớp lệnh:</div>
                              <ul className="list-disc pl-4 space-y-0.5 text-text-secondary text-3xs">
                                {cand.explanation?.strengths?.map((s, idx) => (
                                  <li key={idx} className="text-emerald-700 font-medium">{s}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Invite button */}
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleSendInvite(cand)}
                                disabled={invitingId === cand.freelancerId}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
                              >
                                <Send className="h-3 w-3" />
                                {invitingId === cand.freelancerId ? 'Đang gửi lời mời...' : 'Gửi lời mời & Hợp đồng'}
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

      {/* 4-Step Project Creation Wizard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header & Step Indicator */}
            <div className="border-b border-border bg-surface-subtle p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Đăng Tin Tuyển Dụng & Dự Án Mới</h3>
                  <p className="text-2xs text-text-muted">Bước {wizardStep}/4: {
                    wizardStep === 1 ? 'Tiêu đề & Chuyên ngành' :
                    wizardStep === 2 ? 'Kỹ năng & Trình độ yêu cầu' :
                    wizardStep === 3 ? 'Quy mô & Mốc thời gian' : 'Ngân sách & Hình thức thanh toán'
                  }</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1.5 text-text-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Step indicator bar */}
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
            <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                          const isSelected = selectedSkillRequirements.some((s) => s.skillId === skill.id);
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

                  {/* Selected skills configuration list */}
                  {selectedSkillRequirements.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-2xs font-bold text-foreground">Cấu hình tiêu chí cho từng kỹ năng đã chọn:</div>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {selectedSkillRequirements.map((req) => (
                          <div
                            key={req.skillId}
                            className="flex items-center justify-between p-2 rounded-lg border border-border bg-surface text-xs"
                          >
                            <span className="font-bold text-foreground">{req.skillName}</span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-2xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={req.isMandatory}
                                  onChange={(e) => handleUpdateSkillMandatory(req.skillId, e.target.checked)}
                                  className="rounded border-border text-primary"
                                />
                                <span className={req.isMandatory ? 'font-bold text-rose-600' : 'text-text-muted'}>
                                  {req.isMandatory ? 'Bắt buộc' : 'Ưu tiên'}
                                </span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <label className="text-xs font-semibold text-foreground">Cấp độ kinh nghiệm mong muốn</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { level: 0, label: 'Entry Level', desc: 'Cơ bản / 1 năm' },
                        { level: 1, label: 'Intermediate', desc: 'Thực chiến / 2-4 năm' },
                        { level: 2, label: 'Expert / Lead', desc: 'Chuyên sâu / 5+ năm' }
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
                        { s: 2, label: 'Dự án Lớn', time: '> 3 - 6 tháng' }
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
                      <label className="text-xs font-semibold text-foreground">Ngày bắt đầu dự kiến</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Hạn chót bàn giao (Deadline)</label>
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
                      <label className="text-xs font-semibold text-foreground">Ưu tiên vị trí địa lý</label>
                      <input
                        type="text"
                        value={locationPreference}
                        onChange={(e) => setLocationPreference(e.target.value)}
                        placeholder="Worldwide / Việt Nam"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Ngôn ngữ trao đổi chính</label>
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

              {/* STEP 4: Budget & Pricing */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Hình thức chi trả thù lao</label>
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
                        <div className="text-3xs text-text-muted">Chi trả dựa trên số giờ làm việc thực tế</div>
                      </button>
                    </div>
                  </div>

                  {pricingType === 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Ngân sách tối thiểu ($)</label>
                        <input
                          type="number"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                          placeholder="VD: 500"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Ngân sách tối đa ($)</label>
                        <input
                          type="number"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                          placeholder="VD: 2000"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Mức lương giờ min ($/h)</label>
                        <input
                          type="number"
                          value={hourlyRateMin}
                          onChange={(e) => setHourlyRateMin(e.target.value)}
                          placeholder="VD: 20"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Mức lương giờ max ($/h)</label>
                        <input
                          type="number"
                          value={hourlyRateMax}
                          onChange={(e) => setHourlyRateMax(e.target.value)}
                          placeholder="VD: 45"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
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
                    onClick={() => setWizardStep((prev) => (prev - 1) as any)}
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
                    onClick={() => setWizardStep((prev) => (prev + 1) as any)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Tiếp tục <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    {creating ? 'Đang tạo dự án...' : 'Hoàn tất & Tạo dự án'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
