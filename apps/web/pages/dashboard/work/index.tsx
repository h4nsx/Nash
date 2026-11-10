import { useState, useEffect, useId } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck2,
  MessageSquare,
  Check,
  RotateCcw
} from 'lucide-react';

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: number; // 0: Pending, 1: InProgress, 2: Submitted, 3: ChangesRequested, 4: Accepted
  submissionNotes: string;
  feedbackNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  agreedBudget: number;
  startDate: string;
  endDate: string;
  status: number; // 1: Active, 2: Completed, 3: Cancelled
  createdAt: string;
  milestones: Milestone[];
}

export default function WorkContractsPage() {
  const { user } = useAuth();
  const isClient = user?.role === 'Client';

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'action_needed'>('all');
  const [expandedContractIds, setExpandedContractIds] = useState<Record<string, boolean>>({});

  // Freelancer Submission Modal state
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Client Milestone Review modal state
  const [reviewMilestone, setReviewMilestone] = useState<Milestone | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const searchInputId = useId();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<Contract[]>('/work/contracts');
      if (res.success && res.data) {
        setContracts(res.data);
        const initialExpanded: Record<string, boolean> = {};
        res.data.forEach((c) => {
          if (c.status === 1) {
            initialExpanded[c.id] = true;
          }
        });
        setExpandedContractIds(initialExpanded);
      } else {
        setContracts([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể tải danh sách hợp đồng.');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const toggleContract = (contractId: string) => {
    setExpandedContractIds((prev) => ({
      ...prev,
      [contractId]: !prev[contractId],
    }));
  };

  const handleOpenSubmitModal = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setSubmissionNotes(milestone.submissionNotes || '');
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const handleCloseSubmitModal = () => {
    setSelectedMilestone(null);
    setSubmissionNotes('');
    setSubmitError(null);
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    if (!submissionNotes.trim()) {
      setSubmitError('Vui lòng nhập ghi chú hoặc đường dẫn bàn giao.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const res = await apiClient<{ message: string }>(
        `/work/milestones/${selectedMilestone.id}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ notes: submissionNotes }),
        }
      );

      if (res.success) {
        setSubmitSuccess('Đã gửi bàn giao thành công! Khách hàng sẽ nhận được thông báo.');
        setTimeout(() => {
          handleCloseSubmitModal();
          fetchContracts();
        }, 1000);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setSubmitError(err.error?.message || 'Không thể nộp mốc công việc.');
      } else {
        setSubmitError('Lỗi kết nối khi gửi dữ liệu.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Client: Accept milestone
  const handleAcceptMilestone = async (milestoneId: string) => {
    try {
      setReviewing(true);
      const res = await apiClient(`/work/milestones/${milestoneId}/accept`, {
        method: 'POST',
      });
      if (res.success) {
        setReviewMilestone(null);
        await fetchContracts();
      }
    } catch (err: unknown) {
      alert(err instanceof ApiException ? err.error.message : 'Nghiệm thu thất bại.');
    } finally {
      setReviewing(false);
    }
  };

  // Client: Request Changes
  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewMilestone) return;

    if (!reviewFeedback.trim()) {
      setReviewError('Vui lòng nhập lý do hoặc nội dung cần chỉnh sửa.');
      return;
    }

    try {
      setReviewing(true);
      setReviewError(null);
      const res = await apiClient(`/work/milestones/${reviewMilestone.id}/request-changes`, {
        method: 'POST',
        body: JSON.stringify({ feedback: reviewFeedback }),
      });
      if (res.success) {
        setReviewMilestone(null);
        setReviewFeedback('');
        await fetchContracts();
      }
    } catch (err: unknown) {
      setReviewError(err instanceof ApiException ? err.error.message : 'Yêu cầu sửa đổi thất bại.');
    } finally {
      setReviewing(false);
    }
  };

  const getContractStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center rounded-md bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success border border-emerald-200">
            Đang hoạt động
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-primary border border-brand-200">
            Đã hoàn thành
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center rounded-md bg-surface-subtle px-2.5 py-0.5 text-xs font-semibold text-text-muted border border-border">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getMilestoneStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5 text-2xs font-medium text-text-muted border border-border">
            <Clock className="h-3 w-3" />
            Chờ thực hiện
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-2xs font-medium text-primary border border-brand-200">
            <Clock className="h-3 w-3" />
            Đang làm
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-warning-bg px-2 py-0.5 text-2xs font-semibold text-warning border border-amber-200">
            Đã nộp • Chờ duyệt
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-danger-bg px-2 py-0.5 text-2xs font-semibold text-danger border border-rose-200">
            <AlertCircle className="h-3 w-3" />
            Cần chỉnh sửa
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-success-bg px-2 py-0.5 text-2xs font-semibold text-success border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Đã nghiệm thu
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
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

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.clientName && c.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.freelancerName && c.freelancerName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return c.status === 1;
    if (statusFilter === 'completed') return c.status === 2;
    if (statusFilter === 'action_needed') {
      if (isClient) {
        return c.milestones?.some((m) => m.status === 2);
      }
      return c.milestones?.some((m) => m.status === 0 || m.status === 1 || m.status === 3);
    }
    return true;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>{isClient ? 'Hợp đồng & Nghiệm thu | NASH' : 'Công việc & Mốc nghiệm thu | NASH'}</title>
      </Head>

      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isClient ? 'Hợp đồng & Nghiệm thu từng mốc' : 'Công việc & Tiến độ dự án'}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              {isClient
                ? 'Theo dõi tiến độ bàn giao của người làm, kiểm tra kết quả và giải ngân nghiệm thu rõ ràng theo thỏa thuận.'
                : 'Theo dõi việc cần làm, nộp kết quả theo từng mốc và nhận thanh toán rõ ràng khi hoàn thành.'}
            </p>
          </div>

          <button
            onClick={fetchContracts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-subtle transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground hover:bg-surface-subtle'
              }`}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground hover:bg-surface-subtle'
              }`}
            >
              Đang làm ({contracts.filter((c) => c.status === 1).length})
            </button>
            <button
              onClick={() => setStatusFilter('action_needed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'action_needed'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground hover:bg-surface-subtle'
              }`}
            >
              {isClient ? 'Cần duyệt' : 'Cần xử lý'}
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground hover:bg-surface-subtle'
              }`}
            >
              Đã xong ({contracts.filter((c) => c.status === 2).length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Tìm theo tên dự án, đối tác..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-danger-bg p-4 text-xs text-danger">
            {error}
          </div>
        )}

        {/* Contracts Content */}
        {loading ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-xs text-text-muted">
            Đang tải dữ liệu hợp đồng...
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
            <Briefcase className="h-9 w-9 text-text-muted opacity-40 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">
              {isClient ? 'Bạn chưa có hợp đồng nào đang chạy' : 'Bạn chưa có công việc nào đang chạy'}
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              {isClient
                ? 'Sau khi bạn gửi lời mời và hai bên chốt điều khoản hợp đồng tại mục Smart Match, dự án sẽ hiển thị tại đây.'
                : 'Sau khi nhận lời mời và đồng ý các điều khoản hợp đồng, bạn sẽ bắt đầu thực hiện theo từng mốc tại đây.'}
            </p>
            <div className="pt-1">
              {isClient ? (
                <Link
                  href="/dashboard/client/projects"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white transition-colors"
                >
                  Xem dự án & Top 3 Match →
                </Link>
              ) : (
                <Link
                  href="/dashboard/matches"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white transition-colors"
                >
                  Kiểm tra hộp thư lời mời →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map((contract) => {
              const isExpanded = !!expandedContractIds[contract.id];
              const totalMilestones = contract.milestones?.length || 0;
              const acceptedMilestones = contract.milestones?.filter((m) => m.status === 4).length || 0;

              return (
                <div
                  key={contract.id}
                  className="rounded-xl border border-border bg-surface shadow-2xs overflow-hidden transition-all"
                >
                  {/* Contract Header Card */}
                  <div
                    onClick={() => toggleContract(contract.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-subtle/50 transition-colors select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                          {contract.projectTitle}
                        </h2>
                        {getContractStatusBadge(contract.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                        <div>
                          {isClient ? 'Người thực hiện: ' : 'Khách hàng: '}
                          <strong className="text-foreground">
                            {isClient ? (contract.freelancerName || 'Freelancer') : contract.clientName}
                          </strong>
                        </div>
                        <div>•</div>
                        <div>
                          Ngân sách:{' '}
                          <strong className="text-foreground font-mono">
                            {formatCurrency(contract.agreedBudget)}
                          </strong>
                        </div>
                        <div>•</div>
                        <div>
                          Thời hạn: {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-foreground">
                          {acceptedMilestones}/{totalMilestones} mốc
                        </span>
                        <div className="text-2xs text-text-muted">Đã nghiệm thu</div>
                      </div>

                      <div className="text-text-muted">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Milestones List */}
                  {isExpanded && (
                    <div className="border-t border-border bg-surface-subtle/30 p-5 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                        Tiến độ các mốc thanh toán ({totalMilestones})
                      </div>

                      {totalMilestones === 0 ? (
                        <p className="text-xs text-text-muted italic">Hợp đồng này chưa tạo mốc bàn giao.</p>
                      ) : (
                        <div className="space-y-3">
                          {contract.milestones.map((milestone, idx) => {
                            const canSubmit = !isClient && (milestone.status === 0 || milestone.status === 1 || milestone.status === 3);
                            const canReview = isClient && milestone.status === 2;

                            return (
                              <div
                                key={milestone.id}
                                className="rounded-xl border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-brand-200 transition-colors"
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-navy-900 text-white font-bold text-2xs flex items-center justify-center shrink-0">
                                      #{idx + 1}
                                    </span>
                                    <h3 className="text-xs font-bold text-foreground">
                                      {milestone.title}
                                    </h3>
                                    {getMilestoneStatusBadge(milestone.status)}
                                  </div>

                                  {milestone.description && (
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                      {milestone.description}
                                    </p>
                                  )}

                                  {/* Notes & Feedback */}
                                  {milestone.feedbackNotes && (
                                    <div className="mt-2 text-xs rounded-lg bg-danger-bg p-2.5 text-danger border border-rose-200">
                                      <strong>Góp ý từ khách hàng:</strong> {milestone.feedbackNotes}
                                    </div>
                                  )}

                                  {milestone.submissionNotes && (
                                    <div className="mt-2 text-xs rounded-lg bg-brand-50 p-2.5 text-primary border border-brand-200">
                                      <strong>Nội dung nộp bàn giao:</strong> {milestone.submissionNotes}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                                  <div className="text-left sm:text-right">
                                    <div className="text-xs font-bold text-foreground font-mono">
                                      {formatCurrency(milestone.amount)}
                                    </div>
                                    <div className="text-2xs text-text-muted">
                                      Hạn: {formatDate(milestone.dueDate)}
                                    </div>
                                  </div>

                                  {/* Freelancer Action */}
                                  {canSubmit && (
                                    <button
                                      onClick={() => handleOpenSubmitModal(milestone)}
                                      className="rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                                    >
                                      Nộp bàn giao
                                    </button>
                                  )}

                                  {/* Client Review Actions */}
                                  {canReview && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setReviewMilestone(milestone);
                                          setReviewFeedback('');
                                          setReviewError(null);
                                        }}
                                        className="rounded-lg border border-border bg-surface hover:bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
                                      >
                                        Yêu cầu sửa
                                      </button>
                                      <button
                                        onClick={() => handleAcceptMilestone(milestone.id)}
                                        disabled={reviewing}
                                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                                      >
                                        {reviewing ? 'Đang duyệt...' : 'Nghiệm thu'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Deliverable Submission Modal for Freelancer */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Bàn giao mốc công việc</h3>
                <p className="text-xs text-text-muted mt-0.5">{selectedMilestone.title}</p>
              </div>
              <button
                onClick={handleCloseSubmitModal}
                className="rounded-lg p-1 text-text-muted hover:text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="mt-4 space-y-4">
              {submitError && (
                <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="rounded-lg bg-success-bg p-3 text-xs text-success border border-emerald-200">
                  {submitSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Ghi chú hoặc đường dẫn bàn giao (Git repo, Figma, tài liệu...)
                </label>
                <textarea
                  rows={4}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Mô tả công việc đã hoàn thành hoặc dán liên kết sản phẩm bàn giao..."
                  className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseSubmitModal}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Đang gửi...' : 'Xác nhận nộp bàn giao'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Changes Modal for Client */}
      {reviewMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Yêu cầu chỉnh sửa mốc</h3>
                <p className="text-xs text-text-muted mt-0.5">{reviewMilestone.title}</p>
              </div>
              <button
                onClick={() => setReviewMilestone(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRequestChanges} className="mt-4 space-y-4">
              {reviewError && (
                <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                  {reviewError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Nội dung góp ý & Chi tiết cần người làm bổ sung/chỉnh sửa
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Nêu rõ các điểm chưa đạt theo yêu cầu nghiệm thu của mốc..."
                  className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setReviewMilestone(null)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {reviewing ? 'Đang gửi...' : 'Gửi yêu cầu sửa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
