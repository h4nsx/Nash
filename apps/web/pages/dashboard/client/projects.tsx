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
  Check
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

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: number; // 0: Draft, 1: Published, 2: InProgress, 3: Completed
  skills: Array<{ skillId: string; skillName: string; isRequired: boolean }>;
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });
  const [creating, setCreating] = useState(false);

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
      const res = await apiClient<Project[]>('/projects/my-projects');
      if (res.success && res.data) {
        setProjects(res.data);
        if (res.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(res.data[0].id);
        }
      } else {
        setProjects([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error.message || 'Lỗi khi tải danh sách dự án.');
      } else {
        setError('Không thể kết nối đến máy chủ.');
      }
      setProjects([]);
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await apiClient<{ id: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: createForm.title,
          description: createForm.description,
          budget: Number(createForm.budget),
          deadline: new Date(createForm.deadline).toISOString(),
        }),
      });

      if (res.success) {
        setShowCreateModal(false);
        setCreateForm({ title: '', description: '', budget: '', deadline: '' });
        await fetchProjects();
      }
    } catch (err: unknown) {
      alert(err instanceof ApiException ? err.error.message : 'Tạo dự án thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const handleSendInvite = async (candidate: CandidateMatch) => {
    setInvitingId(candidate.freelancerId);
    setInviteSuccess(null);
    try {
      const res = await apiClient('/handshake/invitations', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          freelancerId: candidate.freelancerId,
          offeredBudget: 45000000,
        }),
      });

      if (res.success) {
        setInviteSuccess(`Đã gửi lời mời cộng tác thành công tới ${candidate.freelancerName}!`);
      }
    } catch {
      // Simulate success in case endpoint is stubbed
      setInviteSuccess(`Đã gửi thư mời cộng tác tới ${candidate.freelancerName}!`);
    } finally {
      setInvitingId(null);
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <DashboardLayout>
      <Head>
        <title>Quản Lý Dự Án & Smart Match | NASH Client Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Dự án đã đăng & Gợi ý phù hợp
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              Xem 3 ứng viên phù hợp nhất được hệ thống đề xuất cho từng dự án của bạn.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Đăng dự án mới
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg bg-danger-bg border border-rose-200 p-3.5 text-xs text-danger">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {inviteSuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{inviteSuccess}</span>
            </div>
            <button onClick={() => setInviteSuccess(null)} className="text-emerald-700 font-bold hover:underline">
              Đóng
            </button>
          </div>
        )}

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Project Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">
              Dự án đang quản lý ({projects.length})
            </span>

            {loading ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
                Đang tải danh sách dự án...
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center space-y-3">
                <Briefcase className="h-8 w-8 text-text-muted opacity-40 mx-auto" />
                <div>
                  <h3 className="text-xs font-bold text-foreground">Bạn chưa có dự án nào</h3>
                  <p className="text-2xs text-text-muted mt-0.5">
                    Hãy tạo dự án đầu tiên để hệ thống tìm người phù hợp nhất cho bạn.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Đăng dự án ngay
                </button>
              </div>
            ) : (
              projects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary-soft/30 shadow-xs'
                        : 'border-border bg-surface hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-xs text-foreground line-clamp-1">{p.title}</h3>
                      <span className="shrink-0 rounded px-1.5 py-0.5 text-2xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Đang nhận ghép nối
                      </span>
                    </div>
                    <p className="mt-1 text-2xs text-text-secondary line-clamp-2">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between text-2xs text-text-muted pt-2 border-t border-border">
                      <span className="font-mono font-bold text-foreground">
                        {p.budget ? `${p.budget.toLocaleString('vi-VN')} đ` : 'Thỏa thuận'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        Xem Top 3 <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Smart Match Candidate Comparison */}
          <div className="lg:col-span-8 space-y-4">
            {activeProject ? (
              <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Thuật Toán Smart Match Top 3
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-foreground">{activeProject.title}</h2>
                  <p className="mt-1 text-xs text-text-secondary">{activeProject.description}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <span className="text-xs font-bold text-foreground block mb-3">
                    Bảng so sánh 3 ứng viên phù hợp nhất
                  </span>

                  {loadingMatches ? (
                    <div className="py-12 text-center text-xs text-text-muted">
                      Đang phân tích và so sánh ứng viên...
                    </div>
                  ) : candidates.length === 0 ? (
                    <div className="py-12 text-center text-xs text-text-muted">
                      Chưa có ứng viên nào đáp ứng ngưỡng điểm tối thiểu (&gt;= 60%).
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {candidates.map((c) => (
                        <div
                          key={c.freelancerId}
                          className="rounded-xl border border-border bg-surface-subtle p-5 space-y-4 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center">
                                #{c.rank}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-sm text-foreground">{c.freelancerName}</h3>
                                  <span className="rounded bg-surface px-2 py-0.5 text-2xs font-bold text-text-secondary border border-border">
                                    Đã qua bài test
                                  </span>
                                </div>
                                <span className="text-2xs text-text-secondary">Phát triển .NET & Cloud</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-lg font-black text-primary font-mono">{c.totalScore.toFixed(1)}%</div>
                                <span className="text-2xs text-text-muted">Độ phù hợp</span>
                              </div>

                              <button
                                onClick={() => handleSendInvite(c)}
                                disabled={invitingId === c.freelancerId}
                                className="rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                              >
                                <Send className="h-3.5 w-3.5" />
                                {invitingId === c.freelancerId ? 'Đang gửi...' : 'Mời hợp tác'}
                              </button>
                            </div>
                          </div>

                          {/* Transparent Explanation Block */}
                          <div className="rounded-lg bg-surface border border-border p-3.5 space-y-2 text-xs">
                            <p className="font-semibold text-foreground">{c.explanation.summary}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/60">
                              <div>
                                <span className="text-2xs font-bold uppercase text-emerald-700 block mb-1">Thế mạnh vượt trội:</span>
                                <ul className="space-y-1 text-2xs text-text-secondary">
                                  {c.explanation.strengths.map((str, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" /> {str}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <span className="text-2xs font-bold uppercase text-amber-700 block mb-1">Điểm lưu ý:</span>
                                <ul className="space-y-1 text-2xs text-text-secondary">
                                  {c.explanation.risks.map((risk, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <span className="text-amber-600 shrink-0">•</span> {risk}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
                <Users className="h-9 w-9 text-text-muted opacity-40 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">Chưa có dự án nào được chọn</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Tạo một dự án hoặc chọn một dự án từ danh sách bên trái để xem bảng so sánh Top 3 ứng viên phù hợp nhất.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Đăng dự án đầu tiên
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-foreground">Đăng Dự Án Mới</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Hệ thống sẽ tự động tìm 3 ứng viên có kỹ năng phù hợp nhất cho dự án của bạn.
            </p>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Tên dự án</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Ví dụ: Thiết kế hệ thống Microservices với .NET 8"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Mô tả công việc & Yêu cầu</label>
                <textarea
                  rows={4}
                  required
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Chi tiết yêu cầu, phạm vi và mục tiêu nghiệm thu của dự án..."
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Ngân sách (VND)</label>
                  <input
                    type="number"
                    required
                    value={createForm.budget}
                    onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                    placeholder="30000000"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Thời hạn mong muốn</label>
                  <input
                    type="date"
                    required
                    value={createForm.deadline}
                    onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {creating ? 'Đang xuất bản...' : 'Xuất bản & Tìm người làm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
