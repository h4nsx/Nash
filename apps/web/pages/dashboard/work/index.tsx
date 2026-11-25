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
  RotateCcw,
  FileText,
  Star,
  Pencil,
  Trash2
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

export interface ContractReview {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  reviews?: ContractReview[];
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

  // Client Create Milestone modal state
  const [targetContractForMilestone, setTargetContractForMilestone] = useState<Contract | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [createMilestoneError, setCreateMilestoneError] = useState<string | null>(null);

  // Client Edit / Delete Milestone state
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editMilestoneTitle, setEditMilestoneTitle] = useState('');
  const [editMilestoneDescription, setEditMilestoneDescription] = useState('');
  const [editMilestoneAmount, setEditMilestoneAmount] = useState('');
  const [editMilestoneDueDate, setEditMilestoneDueDate] = useState('');
  const [updatingMilestone, setUpdatingMilestone] = useState(false);
  const [updateMilestoneError, setUpdateMilestoneError] = useState<string | null>(null);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);

  // Cancel Contract modal state
  const [targetContractToCancel, setTargetContractToCancel] = useState<Contract | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingContract, setCancellingContract] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Complete Contract modal state
  const [targetContractToComplete, setTargetContractToComplete] = useState<Contract | null>(null);
  const [completingContract, setCompletingContract] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completedContractPromptId, setCompletedContractPromptId] = useState<string | null>(null);

  // Pay Milestone (VietQR & Card) modal state
  const [payingMilestone, setPayingMilestone] = useState<Milestone | null>(null);
  const [paymentQrData, setPaymentQrData] = useState<{
    milestoneId: string;
    contractId: string;
    projectTitle: string;
    milestoneTitle: string;
    amount: number;
    currency: string;
    bankBin: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    memo: string;
    vietQrUrl: string;
    transactionCode: string;
  } | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [paymentTab, setPaymentTab] = useState<'vietqr' | 'card'>('vietqr');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  // Client: Open Payment Modal (VietQR)
  const handleOpenPaymentModal = async (milestone: Milestone) => {
    setPayingMilestone(milestone);
    setPaymentQrData(null);
    setLoadingQr(true);
    setPaymentSuccess(false);
    setPaymentTab('vietqr');

    try {
      const res = await apiClient<any>(`/payments/milestones/${milestone.id}/qr`);
      if (res.success && res.data) {
        setPaymentQrData(res.data);
      }
    } catch (err: unknown) {
      alert(err instanceof ApiException ? err.error.message : 'Không thể tạo mã VietQR thanh toán.');
    } finally {
      setLoadingQr(false);
    }
  };

  // Client: Confirm payment completed
  const handleConfirmTransfer = async () => {
    if (!payingMilestone) return;

    try {
      setConfirmingPayment(true);
      const res = await apiClient(`/payments/milestones/${payingMilestone.id}/confirm-transfer`, {
        method: 'POST'
      });

      if (res.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setPayingMilestone(null);
          fetchContracts();
        }, 1500);
      }
    } catch (err: unknown) {
      alert(err instanceof ApiException ? err.error.message : 'Xác nhận thanh toán thất bại.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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

  // Client: Create Milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetContractForMilestone) return;

    try {
      setCreatingMilestone(true);
      setCreateMilestoneError(null);

      const res = await apiClient(`/work/contracts/${targetContractForMilestone.id}/milestones`, {
        method: 'POST',
        body: JSON.stringify({
          title: newMilestoneTitle,
          description: newMilestoneDescription,
          amount: parseFloat(newMilestoneAmount),
          dueDate: new Date(newMilestoneDueDate).toISOString()
        })
      });

      if (res.success) {
        setTargetContractForMilestone(null);
        setNewMilestoneTitle('');
        setNewMilestoneDescription('');
        setNewMilestoneAmount('');
        setNewMilestoneDueDate('');
        await fetchContracts();
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setCreateMilestoneError(err.error?.message || 'Không thể tạo mốc thanh toán.');
      } else {
        setCreateMilestoneError('Lỗi kết nối khi gửi dữ liệu.');
      }
    } finally {
      setCreatingMilestone(false);
    }
  };

  // Client: Update Milestone
  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;

    try {
      setUpdatingMilestone(true);
      setUpdateMilestoneError(null);

      const res = await apiClient(`/work/milestones/${editingMilestone.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editMilestoneTitle,
          description: editMilestoneDescription,
          amount: parseFloat(editMilestoneAmount),
          dueDate: new Date(editMilestoneDueDate).toISOString(),
        }),
      });

      if (res.success) {
        setEditingMilestone(null);
        await fetchContracts();
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setUpdateMilestoneError(err.error?.message || 'Không thể cập nhật cột mốc.');
      } else {
        setUpdateMilestoneError('Lỗi kết nối khi cập nhật cột mốc.');
      }
    } finally {
      setUpdatingMilestone(false);
    }
  };

  // Client: Delete Pending Milestone
  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      setDeletingMilestoneId(milestoneId);
      const res = await apiClient(`/work/milestones/${milestoneId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        await fetchContracts();
      }
    } catch (err: unknown) {
      alert(err instanceof ApiException ? err.error.message : 'Không thể xóa cột mốc.');
    } finally {
      setDeletingMilestoneId(null);
    }
  };

  // Cancel Contract
  const handleCancelContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetContractToCancel) return;

    try {
      setCancellingContract(true);
      setCancelError(null);

      const res = await apiClient(`/work/contracts/${targetContractToCancel.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({
          reason: cancelReason || 'Hai bên thống nhất dừng hợp đồng.'
        })
      });

      if (res.success) {
        setTargetContractToCancel(null);
        setCancelReason('');
        await fetchContracts();
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setCancelError(err.error?.message || 'Không thể hủy hợp đồng.');
      } else {
        setCancelError('Lỗi kết nối khi gửi yêu cầu.');
      }
    } finally {
      setCancellingContract(false);
    }
  };

  // Client: Complete Contract
  const handleCompleteContract = async () => {
    if (!targetContractToComplete) return;

    try {
      setCompletingContract(true);
      setCompleteError(null);
      const res = await apiClient(`/work/contracts/${targetContractToComplete.id}/complete`, {
        method: 'POST',
      });
      if (res.success) {
        const finishedId = targetContractToComplete.id;
        setTargetContractToComplete(null);
        setCompletedContractPromptId(finishedId);
        await fetchContracts();
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setCompleteError(err.error?.message || 'Không thể hoàn thành hợp đồng.');
      } else {
        setCompleteError('Lỗi kết nối khi hoàn thành hợp đồng.');
      }
    } finally {
      setCompletingContract(false);
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

        {completedContractPromptId && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <span>
              Hợp đồng đã được đánh dấu hoàn thành! Bạn có thể gửi đánh giá cho đối tác ngay bây giờ.
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/work/${completedContractPromptId}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Star className="h-3.5 w-3.5" /> Đánh giá đối tác
              </Link>
              <button
                type="button"
                onClick={() => setCompletedContractPromptId(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
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

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <Link
                        href={`/dashboard/work/${contract.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-2xs font-semibold text-foreground hover:bg-surface-subtle transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Xem hợp đồng & In
                      </Link>

                      {contract.status === 2 && (
                        <Link
                          href={`/dashboard/work/${contract.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-2xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Đánh giá đối tác
                        </Link>
                      )}

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
                  {isExpanded && (() => {
                    const allocatedBudget = contract.milestones?.reduce((sum, m) => sum + (m.amount || 0), 0) || 0;
                    const remainingBudget = Math.max(0, (contract.agreedBudget || 0) - allocatedBudget);
                    const allocationPct = contract.agreedBudget > 0
                      ? Math.min(100, Math.round((allocatedBudget / contract.agreedBudget) * 100))
                      : 0;

                    return (
                    <div className="border-t border-border bg-surface-subtle/30 p-5 space-y-3">
                      {/* Milestone Budget Allocation Bar */}
                      <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            Phân bổ ngân sách cột mốc ({allocationPct}%)
                          </span>
                          <div className="font-mono text-2xs text-text-secondary">
                            Đã phân bổ: <strong className="text-foreground">{formatCurrency(allocatedBudget)}</strong> / {formatCurrency(contract.agreedBudget)}
                            {remainingBudget > 0 && (
                              <span className="ml-2 text-emerald-700 font-semibold">
                                • Còn lại: {formatCurrency(remainingBudget)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${allocationPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                          Tiến độ các mốc thanh toán ({totalMilestones})
                        </div>
                        {isClient && contract.status === 1 && (
                          <div className="flex flex-wrap items-center gap-2">
                            {(totalMilestones === 0 || acceptedMilestones === totalMilestones) && (
                              <button
                                onClick={() => {
                                  setTargetContractToComplete(contract);
                                  setCompleteError(null);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-2xs font-semibold text-white hover:bg-emerald-700 cursor-pointer shadow-2xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Hoàn thành hợp đồng
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setTargetContractForMilestone(contract);
                                setNewMilestoneTitle('');
                                setNewMilestoneDescription('');
                                setNewMilestoneAmount('');
                                setNewMilestoneDueDate('');
                                setCreateMilestoneError(null);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-surface border border-border px-2.5 py-1 text-2xs font-semibold text-primary hover:bg-surface-subtle cursor-pointer shadow-2xs"
                            >
                              + Thêm mốc mới
                            </button>
                            <button
                              onClick={() => {
                                setTargetContractToCancel(contract);
                                setCancelReason('');
                                setCancelError(null);
                              }}
                              className="text-2xs font-semibold text-rose-600 hover:underline cursor-pointer"
                            >
                              Hủy hợp đồng
                            </button>
                          </div>
                        )}
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

                                  {/* Client Edit / Delete Actions for Eligible Milestones */}
                                  {isClient && contract.status === 1 && milestone.status !== 2 && milestone.status !== 4 && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMilestone(milestone);
                                          setEditMilestoneTitle(milestone.title);
                                          setEditMilestoneDescription(milestone.description || '');
                                          setEditMilestoneAmount(String(milestone.amount));
                                          setEditMilestoneDueDate(
                                            milestone.dueDate ? milestone.dueDate.substring(0, 10) : ''
                                          );
                                          setUpdateMilestoneError(null);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-2xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
                                        title="Chỉnh sửa cột mốc"
                                      >
                                        <Pencil className="h-3 w-3" /> Sửa
                                      </button>
                                      {milestone.status === 0 && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMilestone(milestone.id)}
                                          disabled={deletingMilestoneId === milestone.id}
                                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-2xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 cursor-pointer"
                                          title="Xóa cột mốc chờ"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          {deletingMilestoneId === milestone.id ? '...' : 'Xóa'}
                                        </button>
                                      )}
                                    </div>
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
                                        onClick={() => handleOpenPaymentModal(milestone)}
                                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                                      >
                                        Thanh toán & Nghiệm thu
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
                    );
                  })()}

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

      {/* Client: Edit Milestone Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Chỉnh Sửa Cột Mốc</h3>
                <p className="text-2xs text-text-muted mt-0.5">{editingMilestone.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {updateMilestoneError && (
              <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                {updateMilestoneError}
              </div>
            )}

            <form onSubmit={handleUpdateMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Tiêu đề mốc *</label>
                <input
                  type="text"
                  required
                  value={editMilestoneTitle}
                  onChange={(e) => setEditMilestoneTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Mô tả yêu cầu bàn giao</label>
                <textarea
                  rows={3}
                  value={editMilestoneDescription}
                  onChange={(e) => setEditMilestoneDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Số tiền (VND) *</label>
                  <input
                    type="number"
                    required
                    value={editMilestoneAmount}
                    onChange={(e) => setEditMilestoneAmount(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Hạn chót *</label>
                  <input
                    type="date"
                    required
                    value={editMilestoneDueDate}
                    onChange={(e) => setEditMilestoneDueDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updatingMilestone}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-1.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {updatingMilestone ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client: Add New Milestone Modal */}
      {targetContractForMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Thêm Cột Mốc Bàn Giao Mới</h3>
                <p className="text-2xs text-text-muted mt-0.5">{targetContractForMilestone.projectTitle}</p>
              </div>
              <button
                onClick={() => setTargetContractForMilestone(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {createMilestoneError && (
              <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                {createMilestoneError}
              </div>
            )}

            <form onSubmit={handleCreateMilestone} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">Tiêu đề mốc *</label>
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="VD: Hoàn thành thiết kế giao diện & luồng người dùng"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">Mô tả yêu cầu bàn giao</label>
                <textarea
                  rows={3}
                  value={newMilestoneDescription}
                  onChange={(e) => setNewMilestoneDescription(e.target.value)}
                  placeholder="Mô tả các tiêu chí để mốc này được nghiệm thu..."
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Số tiền thanh toán (VND) *</label>
                  <input
                    type="number"
                    required
                    value={newMilestoneAmount}
                    onChange={(e) => setNewMilestoneAmount(e.target.value)}
                    placeholder="VD: 5000000"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Hạn chót (Deadline) *</label>
                  <input
                    type="date"
                    required
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setTargetContractForMilestone(null)}
                  className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingMilestone}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-1.5 text-xs font-semibold text-white shadow-xs"
                >
                  {creatingMilestone ? 'Đang tạo...' : 'Xác nhận thêm mốc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Contract Confirmation Modal */}
      {targetContractToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Xác nhận hoàn thành hợp đồng</h3>
              <button
                type="button"
                onClick={() => setTargetContractToComplete(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {completeError && (
              <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                {completeError}
              </div>
            )}

            <p className="text-xs text-text-secondary leading-relaxed">
              Tất cả các mốc của hợp đồng <strong>{targetContractToComplete.projectTitle}</strong> đã được nghiệm thu. Bạn có muốn đóng và đánh dấu hợp đồng này là <strong>Hoàn thành</strong> để mở tính năng đánh giá đối tác?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setTargetContractToComplete(null)}
                className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                Chưa hoàn thành
              </button>
              <button
                type="button"
                disabled={completingContract}
                onClick={handleCompleteContract}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {completingContract ? 'Đang xác nhận...' : 'Hoàn thành hợp đồng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Contract Modal */}
      {targetContractToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Hủy & Dừng Hợp Đồng</h3>
              <button
                onClick={() => setTargetContractToCancel(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {cancelError && (
              <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelContract} className="space-y-3 text-xs">
              <p className="text-text-secondary text-2xs leading-relaxed">
                Bạn có chắc chắn muốn dừng hợp đồng cho dự án <strong>{targetContractToCancel.projectTitle}</strong>? Các mốc chưa được nghiệm thu sẽ bị hủy bỏ.
              </p>

              <div>
                <label className="block font-semibold text-foreground mb-1">Lý do dừng hợp đồng *</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nêu rõ lý do hai bên thống nhất dừng hợp đồng..."
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setTargetContractToCancel(null)}
                  className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={cancellingContract}
                  className="rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  {cancellingContract ? 'Đang xử lý...' : 'Xác nhận hủy hợp đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client: Pay Milestone Modal with VietQR and Card Tabs */}
      {payingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-subtle">
              <div>
                <h3 className="text-sm font-bold text-foreground">Thanh toán & Nghiệm thu Cột mốc</h3>
                <p className="text-2xs text-text-muted mt-0.5">{payingMilestone.title}</p>
              </div>
              <button
                onClick={() => setPayingMilestone(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-foreground">Thanh toán & Nghiệm thu Thành công!</h4>
                <p className="text-xs text-text-secondary">
                  Cột mốc đã được xác nhận hoàn tất. Freelancer sẽ nhận được thông báo nghiệm thu ngay lập tức.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* 2-Option Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-subtle border border-border">
                  <button
                    type="button"
                    onClick={() => setPaymentTab('vietqr')}
                    className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      paymentTab === 'vietqr'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-foreground'
                    }`}
                  >
                    <span>Quét mã VietQR (Napas 24/7)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('card')}
                    className={`relative flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      paymentTab === 'card'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-foreground'
                    }`}
                  >
                    <span>Thẻ Visa / MasterCard</span>
                    <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.2 text-4xs font-bold">
                      Sắp ra mắt
                    </span>
                  </button>
                </div>

                {/* Option 1: VietQR Active Tab */}
                {paymentTab === 'vietqr' && (
                  <div className="space-y-4">
                    {loadingQr ? (
                      <div className="flex h-48 items-center justify-center text-xs text-text-muted">
                        Đang tạo mã VietQR thanh toán...
                      </div>
                    ) : paymentQrData ? (
                      <>
                        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-primary/30 bg-primary-soft/10 p-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={paymentQrData.vietQrUrl}
                            alt="VietQR Payment Code"
                            className="h-44 w-44 rounded-xl border border-border bg-white p-2 object-contain shadow-xs shrink-0"
                          />

                          <div className="space-y-2 text-xs w-full">
                            <div>
                              <span className="text-3xs text-text-muted block">Số tiền cần thanh toán</span>
                              <span className="text-base font-extrabold text-foreground font-mono text-primary">
                                {paymentQrData.amount.toLocaleString()} VND
                              </span>
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-border/60">
                              <div className="flex items-center justify-between">
                                <span className="text-2xs text-text-muted">Ngân hàng:</span>
                                <span className="font-semibold text-foreground text-2xs">{paymentQrData.bankName}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-2xs text-text-muted">Số tài khoản:</span>
                                <div className="flex items-center gap-1 font-mono font-bold text-foreground text-2xs">
                                  <span>{paymentQrData.bankAccountNumber}</span>
                                  <button
                                    onClick={() => copyToClipboard(paymentQrData.bankAccountNumber, 'acc')}
                                    className="text-primary hover:underline text-3xs ml-1"
                                  >
                                    {copiedField === 'acc' ? 'Đã chép!' : 'Sao chép'}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-2xs text-text-muted">Chủ tài khoản:</span>
                                <span className="font-semibold text-foreground text-2xs uppercase">
                                  {paymentQrData.bankAccountName}
                                </span>
                              </div>

                              <div className="flex items-center justify-between bg-white dark:bg-surface p-1.5 rounded-lg border border-border">
                                <span className="text-3xs text-text-muted">Nội dung CK:</span>
                                <div className="flex items-center gap-1 font-mono font-bold text-primary text-2xs">
                                  <span>{paymentQrData.memo}</span>
                                  <button
                                    onClick={() => copyToClipboard(paymentQrData.memo, 'memo')}
                                    className="text-primary hover:underline text-3xs ml-1"
                                  >
                                    {copiedField === 'memo' ? 'Đã chép!' : 'Sao chép'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-2xs text-emerald-800 space-y-0.5">
                          <div className="font-semibold">Lưu ý khi chuyển khoản:</div>
                          <p>
                            Vui lòng giữ nguyên mã nội dung chuyển khoản <strong>{paymentQrData.memo}</strong> để hệ thống tự động đối soát và khớp lệnh tức thì.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-xs text-rose-600">
                        Không thể tải thông tin thanh toán.
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setPayingMilestone(null)}
                        className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle"
                      >
                        Đóng
                      </button>
                      <button
                        type="button"
                        disabled={confirmingPayment}
                        onClick={handleConfirmTransfer}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
                      >
                        {confirmingPayment ? 'Đang xác nhận...' : 'Thanh toán thành công'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Option 2: Card Locked Tab */}
                {paymentTab === 'card' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center space-y-2">
                      <span className="inline-block rounded-full bg-amber-200 text-amber-900 px-2 py-0.5 text-3xs font-bold">
                        Tạm khóa thử nghiệm
                      </span>
                      <h4 className="text-xs font-bold text-foreground">
                        Cổng thanh toán Thẻ Quốc tế (Visa / MasterCard)
                      </h4>
                      <p className="text-2xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                        Phương thức thanh toán qua thẻ quốc tế đang hoàn tất kết nối cổng PCI-DSS. Để tiết kiệm chi phí giao dịch, vui lòng sử dụng quét mã VietQR 24/7 (Miễn phí 100%).
                      </p>
                    </div>

                    <div className="space-y-3 opacity-40 pointer-events-none select-none">
                      <div>
                        <label className="block text-2xs font-semibold text-text-muted mb-1">Số thẻ (Card Number)</label>
                        <input
                          type="text"
                          disabled
                          placeholder="4111 2222 3333 4444"
                          className="w-full rounded-lg border border-border bg-surface-subtle p-2 text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-2xs font-semibold text-text-muted mb-1">Hạn dùng (MM/YY)</label>
                          <input
                            type="text"
                            disabled
                            placeholder="12/28"
                            className="w-full rounded-lg border border-border bg-surface-subtle p-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-2xs font-semibold text-text-muted mb-1">Mã bảo mật CVV</label>
                          <input
                            type="text"
                            disabled
                            placeholder="•••"
                            className="w-full rounded-lg border border-border bg-surface-subtle p-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setPaymentTab('vietqr')}
                        className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-1.5 text-xs font-semibold text-white shadow-xs"
                      >
                        Chuyển sang Quét mã VietQR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
