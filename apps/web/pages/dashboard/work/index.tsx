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
  DollarSign,
  Send,
  Search,
  RefreshCw,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  FileCheck,
  MessageSquare,
  Sparkles,
  ExternalLink,
  X
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

  // Generate unique accessible IDs
  const searchInputId = useId();
  const submissionNotesId = useId();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<Contract[]>('/work/contracts');
      if (res.success && res.data) {
        setContracts(res.data);
        // Expand active contracts by default
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
      setSubmitError('Vui lòng nhập ghi chú hoặc đường dẫn sản phẩm bàn giao.');
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

  // Status Helpers
  const getContractStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang tiến hành
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
            Hoàn thành
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
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
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <Clock className="h-3 w-3 text-zinc-400" />
            Chờ thực hiện
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
            <Clock className="h-3 w-3 text-sky-500" />
            Đang thực hiện
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Đã nộp - Chờ duyệt
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            <AlertCircle className="h-3 w-3 text-rose-500" />
            Cần chỉnh sửa
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
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
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Filter calculations
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

  // Analytics Metrics
  const activeContractsCount = contracts.filter((c) => c.status === 1).length;
  const pendingSubmissionCount = contracts.flatMap((c) => c.milestones || []).filter((m) => m.status === 0 || m.status === 1 || m.status === 3).length;
  const acceptedMilestonesCount = contracts.flatMap((c) => c.milestones || []).filter((m) => m.status === 4).length;
  const totalAgreedEarnings = contracts.reduce((sum, c) => sum + (c.agreedBudget || 0), 0);

  return (
    <DashboardLayout>
      <Head>
        <title>Công việc của tôi | NASH Chuyên Gia</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Sparkles className="mr-1 h-3 w-3" /> Chuyên gia
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
              Hợp đồng & Mốc công việc
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Theo dõi tiến độ, nộp sản phẩm bàn giao và nhận thanh toán theo các giai đoạn.
            </p>
          </div>

          <button
            onClick={fetchContracts}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Hợp đồng đang chạy
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">
              {activeContractsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Mốc cần nộp / Chỉnh sửa
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">
              {pendingSubmissionCount}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Mốc đã nghiệm thu
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">
              {acceptedMilestonesCount}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-5 backdrop-blur shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tổng giá trị hợp đồng
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">
              {formatCurrency(totalAgreedEarnings)}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === 'active'
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Đang làm ({contracts.filter((c) => c.status === 1).length})
            </button>
            <button
              onClick={() => setStatusFilter('action_needed')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === 'action_needed'
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Cần nộp bài ({pendingSubmissionCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === 'completed'
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Đã kết thúc ({contracts.filter((c) => c.status === 2).length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <label htmlFor={searchInputId} className="sr-only">
              Tìm theo dự án hoặc khách hàng
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id={searchInputId}
              type="text"
              placeholder="Tìm theo dự án, khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-xs shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="flex-1 text-sm">{error}</div>
            <button
              onClick={fetchContracts}
              className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-200"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-60 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-40 rounded bg-zinc-100 dark:bg-zinc-850" />
                  </div>
                  <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="mt-6 h-20 rounded-xl bg-zinc-50 dark:bg-zinc-800/50" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredContracts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white/50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
              <FolderOpen className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
              Chưa có công việc nào
            </h3>
            <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Không tìm thấy hợp đồng nào phù hợp với bộ lọc hiện tại.'
                : 'Bạn chưa có hợp đồng làm việc nào đang chạy. Hãy kiểm tra các lời mời từ khách hàng để bắt đầu!'}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dashboard/matches"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <FileCheck className="h-4 w-4" />
                Xem lời mời ghép nối
              </Link>
            </div>
          </div>
        )}

        {/* Contract List */}
        {!loading && filteredContracts.length > 0 && (
          <div className="space-y-6">
            {filteredContracts.map((contract) => {
              const isExpanded = !!expandedContractIds[contract.id];
              const milestones = contract.milestones || [];
              const completedMilestones = milestones.filter((m) => m.status === 4).length;
              const progressPercent =
                milestones.length > 0
                  ? Math.round((completedMilestones / milestones.length) * 100)
                  : 0;

              return (
                <div
                  key={contract.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  {/* Contract Header Banner */}
                  <div className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                            {contract.projectTitle}
                          </h2>
                          {getContractStatusBadge(contract.status)}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Khách hàng: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{contract.clientName || 'NASH Client'}</span> • Ký hợp đồng ngày {formatDate(contract.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-1 sm:items-end">
                        <span className="text-xs uppercase tracking-wider text-zinc-400">
                          Ngân sách thỏa thuận
                        </span>
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(contract.agreedBudget)}
                        </span>
                      </div>
                    </div>

                    {/* Timeline & Progress Bar */}
                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-3 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span>Thời hạn: {formatDate(contract.startDate)} — {formatDate(contract.endDate)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:col-span-2">
                        <span className="shrink-0 font-medium text-zinc-700 dark:text-zinc-300">
                          Tiến độ hoàn thành: {completedMilestones}/{milestones.length} mốc ({progressPercent}%)
                        </span>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Toggle Milestones Button */}
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/60">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Danh sách các mốc thanh toán ({milestones.length})
                      </span>
                      <button
                        onClick={() => toggleContract(contract.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        {isExpanded ? (
                          <>
                            Thu gọn <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Xem chi tiết các mốc <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Milestones Accordion */}
                  {isExpanded && (
                    <div className="border-t border-zinc-200 bg-zinc-50/70 p-6 dark:border-zinc-800 dark:bg-zinc-950/40">
                      {milestones.length === 0 ? (
                        <div className="py-6 text-center text-xs text-zinc-500">
                          Chưa có mốc thanh toán nào được cấu hình cho hợp đồng này.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {milestones.map((m, idx) => {
                            const canSubmit = m.status === 0 || m.status === 1 || m.status === 3;

                            return (
                              <div
                                key={m.id}
                                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                        {idx + 1}
                                      </span>
                                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                        {m.title}
                                      </h4>
                                      {getMilestoneStatusBadge(m.status)}
                                    </div>
                                    {m.description && (
                                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {m.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-right">
                                      <div className="text-xs text-zinc-400">Số tiền</div>
                                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                        {formatCurrency(m.amount)}
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-xs text-zinc-400">Hạn chót</div>
                                      <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                        {formatDate(m.dueDate)}
                                      </div>
                                    </div>

                                    {canSubmit && (
                                      <button
                                        onClick={() => handleOpenSubmitModal(m)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                      >
                                        <Send className="h-3.5 w-3.5" />
                                        {m.status === 3 ? 'Nộp lại sản phẩm' : 'Nộp bàn giao'}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Revision Warning Banner if changes requested */}
                                {m.status === 3 && m.feedbackNotes && (
                                  <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                                    <div>
                                      <span className="font-semibold">Phản hồi yêu cầu chỉnh sửa từ khách hàng:</span>{' '}
                                      {m.feedbackNotes}
                                    </div>
                                  </div>
                                )}

                                {/* Deliverable Notes submitted */}
                                {m.submissionNotes && (
                                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400">
                                    <FileCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                    <div>
                                      <span className="font-medium text-zinc-800 dark:text-zinc-200">Ghi chú đã nộp:</span>{' '}
                                      {m.submissionNotes}
                                    </div>
                                  </div>
                                )}
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

      {/* Submission Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Send className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Nộp báo cáo bàn giao mốc
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="mt-4 space-y-4">
              <div className="rounded-xl bg-zinc-50 p-3.5 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                <div className="font-semibold text-zinc-900 dark:text-white">
                  {selectedMilestone.title}
                </div>
                <div className="mt-1 flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Số tiền: {formatCurrency(selectedMilestone.amount)}</span>
                  <span>Hạn chót: {formatDate(selectedMilestone.dueDate)}</span>
                </div>
              </div>

              {selectedMilestone.status === 3 && selectedMilestone.feedbackNotes && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                  <span className="font-semibold">Lưu ý sửa đổi từ khách:</span> {selectedMilestone.feedbackNotes}
                </div>
              )}

              <div>
                <label htmlFor={submissionNotesId} className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Ghi chú & Liên kết sản phẩm (GitHub, Figma, Drive, v.v.)
                </label>
                <textarea
                  id={submissionNotesId}
                  rows={4}
                  required
                  placeholder="Ví dụ: Đã hoàn thiện thiết kế UI/UX theo yêu cầu. Link Figma: https://figma.com/..., Pull Request: https://github.com/..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              {submitError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                  {submitSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Xác nhận nộp bàn giao
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
