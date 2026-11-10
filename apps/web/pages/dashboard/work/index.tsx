import { useState, useEffect, useId } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
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
  MessageSquare
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

export default function FreelancerWorkPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'action_needed'>('all');
  const [expandedContractIds, setExpandedContractIds] = useState<Record<string, boolean>>({});

  // Submission Modal state
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        setError(err.error?.message || 'Không thể tải danh sách công việc.');
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

  const handleCloseModal = () => {
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
          handleCloseModal();
          fetchContracts();
        }, 1200);
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

  const getContractStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Đang tiến hành
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-subtle px-2.5 py-0.5 text-xs font-semibold text-text-secondary border border-border">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Đã hoàn thành
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-semibold text-danger border border-rose-200">
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
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-2xs font-medium text-text-muted border border-border">
            <Clock className="h-3 w-3" />
            Chờ bắt đầu
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-2xs font-medium text-primary border border-brand-200">
            <Clock className="h-3 w-3" />
            Đang làm
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2 py-0.5 text-2xs font-semibold text-warning border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
            Đã nộp • Chờ duyệt
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-danger-bg px-2 py-0.5 text-2xs font-semibold text-danger border border-rose-200">
            <AlertCircle className="h-3 w-3" />
            Yêu cầu sửa đổi
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-2xs font-semibold text-success border border-emerald-200">
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
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'active') return c.status === 1;
    if (statusFilter === 'completed') return c.status === 2;
    if (statusFilter === 'action_needed') {
      return c.milestones?.some((m) => m.status === 0 || m.status === 1 || m.status === 3);
    }
    return true;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Công việc & Mốc nghiệm thu | NASH</title>
      </Head>

      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Công việc & Tiến độ dự án
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              Theo dõi việc cần làm, nộp kết quả theo từng mốc và nhận thanh toán rõ ràng khi hoàn thành.
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
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Đang làm ({contracts.filter((c) => c.status === 1).length})
            </button>
            <button
              onClick={() => setStatusFilter('action_needed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'action_needed'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Cần xử lý
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              Đã xong ({contracts.filter((c) => c.status === 2).length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Tìm theo tên dự án, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

        </div>

        {/* Contract List */}
        {loading ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-xs text-text-muted">
            Đang tải danh sách công việc...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-danger-bg p-6 text-center text-xs text-danger">
            {error}
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-text-muted opacity-40" />
            <h3 className="mt-2 text-sm font-bold text-foreground">Không tìm thấy hợp đồng phù hợp</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Các hợp đồng được kích hoạt qua quy trình Bắt tay trực tiếp sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map((contract) => {
              const isExpanded = !!expandedContractIds[contract.id];
              const totalMilestones = contract.milestones?.length || 0;
              const completedMilestones = contract.milestones?.filter((m) => m.status === 4).length || 0;

              return (
                <div
                  key={contract.id}
                  className="rounded-xl border border-border bg-surface shadow-2xs transition-colors overflow-hidden"
                >
                  {/* Contract Header Accordion Bar */}
                  <div
                    onClick={() => toggleContract(contract.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-subtle transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-base font-bold text-foreground">
                          {contract.projectTitle}
                        </h2>
                        {getContractStatusBadge(contract.status)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                        <span>Khách hàng: <strong className="text-foreground">{contract.clientName}</strong></span>
                        <span>•</span>
                        <span>Ngân sách: <strong className="text-foreground font-mono">{formatCurrency(contract.agreedBudget)}</strong></span>
                        <span>•</span>
                        <span>Thời hạn: <strong className="text-foreground">{formatDate(contract.startDate)} – {formatDate(contract.endDate)}</strong></span>
                        <span>•</span>
                        <Link
                          href={`/dashboard/work/${contract.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <FileCheck2 className="h-3.5 w-3.5" /> Xem Hợp đồng A4
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-semibold text-foreground font-mono">
                          {completedMilestones}/{totalMilestones} mốc
                        </span>
                        <div className="text-2xs text-text-muted">Đã hoàn thành</div>
                      </div>

                      <div className="p-1 rounded-md text-text-muted hover:text-foreground">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Milestones Content (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-border bg-surface-subtle/40 p-5 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                        Danh sách các mốc nghiệm thu ({totalMilestones})
                      </div>

                      {totalMilestones === 0 ? (
                        <p className="text-xs text-text-muted py-2">Hợp đồng này chưa tạo mốc nghiệm thu.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {contract.milestones.map((milestone, idx) => {
                            const canSubmit = milestone.status === 0 || milestone.status === 1 || milestone.status === 3;

                            return (
                              <div
                                key={milestone.id}
                                className="rounded-lg border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xs font-mono font-bold text-text-muted">
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
                                    <div className="mt-2 text-xs rounded bg-danger-bg p-2 text-danger border border-rose-200">
                                      <strong>Phản hồi từ Khách hàng:</strong> {milestone.feedbackNotes}
                                    </div>
                                  )}

                                  {milestone.submissionNotes && (
                                    <div className="mt-1 text-2xs text-text-muted">
                                      Ghi chú nộp gần nhất: {milestone.submissionNotes}
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

                                  {canSubmit && (
                                    <button
                                      onClick={() => handleOpenSubmitModal(milestone)}
                                      className="rounded-lg bg-primary hover:bg-primary-hover px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                                    >
                                      Nộp bàn giao
                                    </button>
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

      {/* Deliverable Submission Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Bàn giao mốc công việc</h3>
                <p className="text-xs text-text-muted mt-0.5">{selectedMilestone.title}</p>
              </div>
              <button
                onClick={handleCloseModal}
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
                  onClick={handleCloseModal}
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
    </DashboardLayout>
  );
}
