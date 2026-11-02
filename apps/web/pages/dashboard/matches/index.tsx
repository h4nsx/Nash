import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  AlertCircle,
  Sparkles,
  FileText,
  Clock,
  Briefcase,
  History,
  MessageSquare,
  ArrowRight,
  X,
  ExternalLink
} from 'lucide-react';

export interface ContractDraft {
  id: string;
  versionNumber: number;
  proposedBudget: number;
  proposedStartDate: string;
  proposedEndDate: string;
  contractContentHtml: string;
  createdById: string;
  createdByName: string;
  status: number;
  createdAt: string;
}

export interface Invitation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  senderId: string;
  status: number; // 0: Draft, 1: Pending, 2: Viewed, 3: Accepted, 4: Countered, 5: Declined, 6: Expired
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  contractDrafts: ContractDraft[];
}

const INVITATION_STATUS: Record<number, { label: string; color: string; bg: string; border: string }> = {
  0: { label: 'Bản Nháp', color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20' },
  1: { label: 'Đang Chờ Phản Hồi', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  2: { label: 'Đã Xem', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  3: { label: 'Đã Chấp Nhận', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  4: { label: 'Đang Thương Lượng', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  5: { label: 'Đã Từ Chối', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  6: { label: 'Đã Hết Hạn', color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
};

export default function MatchesPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  // Counter-offer modal state
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [counterBudget, setCounterBudget] = useState<string>('');
  const [counterStartDate, setCounterStartDate] = useState<string>('');
  const [counterEndDate, setCounterEndDate] = useState<string>('');
  const [counterNotes, setCounterNotes] = useState<string>('');
  const [counterError, setCounterError] = useState<string | null>(null);
  const [counterLoading, setCounterLoading] = useState(false);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<Invitation[]>('/handshake/invitations', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (res.success && res.data) {
        setInvitations(res.data);
        // If an invitation is currently selected, refresh its data reference
        if (selectedInvitation) {
          const updated = res.data.find((i) => i.id === selectedInvitation.id);
          if (updated) setSelectedInvitation(updated);
        } else if (res.data.length > 0) {
          setSelectedInvitation(res.data[0]);
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể tải danh sách lời mời');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    try {
      setProcessingId(id);
      const res = await apiClient(`/handshake/invitations/${id}/${action}`, {
        method: 'POST',
      });
      if (res.success) {
        await fetchInvitations();
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        alert(err.error?.message || `Không thể ${action === 'accept' ? 'chấp nhận' : 'từ chối'} lời mời`);
      } else {
        alert('Đã xảy ra lỗi khi kết nối với máy chủ');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const getLatestDraft = (inv: Invitation) => {
    if (!inv.contractDrafts || inv.contractDrafts.length === 0) return null;
    return [...inv.contractDrafts].sort((a, b) => b.versionNumber - a.versionNumber)[0];
  };

  const openCounterModal = (inv: Invitation) => {
    const latest = getLatestDraft(inv);
    if (latest) {
      setCounterBudget(latest.proposedBudget?.toString() || '');
      setCounterStartDate(latest.proposedStartDate ? latest.proposedStartDate.substring(0, 10) : '');
      setCounterEndDate(latest.proposedEndDate ? latest.proposedEndDate.substring(0, 10) : '');
      setCounterNotes('');
      setCounterError(null);
      setIsCounterModalOpen(true);
    }
  };

  const handleSendCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvitation) return;

    const budgetNum = parseFloat(counterBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setCounterError('Vui lòng nhập số ngân sách hợp lệ.');
      return;
    }

    if (!counterStartDate || !counterEndDate) {
      setCounterError('Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }

    if (new Date(counterEndDate) <= new Date(counterStartDate)) {
      setCounterError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    try {
      setCounterLoading(true);
      setCounterError(null);

      const latestDraft = getLatestDraft(selectedInvitation);
      const updatedHtml = counterNotes
        ? `${latestDraft?.contractContentHtml || ''}<br/><p><strong>Ghi chú thương lượng từ chuyên gia:</strong> ${counterNotes}</p>`
        : latestDraft?.contractContentHtml || '<p>Đề xuất thỏa thuận phiên bản mới.</p>';

      const payload = {
        proposedBudget: budgetNum,
        proposedStartDate: new Date(counterStartDate).toISOString(),
        proposedEndDate: new Date(counterEndDate).toISOString(),
        contractContentHtml: updatedHtml,
        contractContentJson: JSON.stringify({ notes: counterNotes }),
      };

      const res = await apiClient(`/handshake/invitations/${selectedInvitation.id}/counter`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setIsCounterModalOpen(false);
        await fetchInvitations();
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setCounterError(err.error?.message || 'Không thể gửi đề xuất thương lượng.');
      } else {
        setCounterError('Lỗi kết nối khi gửi dữ liệu.');
      }
    } finally {
      setCounterLoading(false);
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

  const latestDraft = selectedInvitation ? getLatestDraft(selectedInvitation) : null;
  // A user can accept/counter/decline if:
  // - Invitation status is Pending (1), Viewed (2), or Countered (4)
  // - AND the latest draft was NOT created by the current user (you cannot accept your own counter-offer)
  const isCreatedByMe =
    Boolean(latestDraft && user && latestDraft.createdByName && latestDraft.createdByName.toLowerCase().includes(user.firstName.toLowerCase()));
  const isActionable =
    selectedInvitation &&
    (selectedInvitation.status === 1 || selectedInvitation.status === 2 || selectedInvitation.status === 4) &&
    !isCreatedByMe;

  return (
    <DashboardLayout>
      <Head>
        <title>Lời mời trực tiếp & Ghép nối | NASH</title>
      </Head>

      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Inbox className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Lời mời & Thương lượng hợp đồng
            </h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Xem các lời mời được gửi trực tiếp từ khách hàng qua Smart Match. Bạn có thể chấp nhận, thương lượng ngân sách hoặc từ chối.
          </p>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Inbox List */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 flex items-center justify-between text-base font-semibold text-zinc-900 dark:text-white">
                <span>Hộp thư lời mời</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {invitations.length}
                </span>
              </h2>

              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                  <Inbox className="mx-auto mb-3 h-10 w-10 text-zinc-400 opacity-60" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Chưa có lời mời nào</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {invitations.map((inv) => {
                    const status = INVITATION_STATUS[inv.status] || INVITATION_STATUS[0];
                    const isActive = selectedInvitation?.id === inv.id;
                    const draft = getLatestDraft(inv);

                    return (
                      <button
                        key={inv.id}
                        onClick={() => setSelectedInvitation(inv)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          isActive
                            ? 'border-emerald-500/60 bg-emerald-50/40 shadow-xs dark:border-emerald-500/40 dark:bg-emerald-950/20'
                            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="line-clamp-1 font-semibold text-zinc-900 dark:text-white text-sm">
                            {inv.projectTitle}
                          </h3>
                          <span
                            className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="mb-2 truncate text-xs text-zinc-500 dark:text-zinc-400">
                          Khách hàng: <strong className="text-zinc-700 dark:text-zinc-300">{inv.clientName}</strong>
                        </p>

                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="h-3 w-3" />
                            {formatDate(inv.createdAt)}
                          </span>
                          {draft && (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                              {formatCurrency(draft.proposedBudget)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Invitation & Negotiation Details */}
          <div className="lg:col-span-2">
            {selectedInvitation ? (
              <div className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                {/* Header */}
                <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {selectedInvitation.projectTitle}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <Briefcase className="h-4 w-4" />
                        <span>
                          Khách hàng:{' '}
                          <strong className="text-zinc-800 dark:text-zinc-200">
                            {selectedInvitation.clientName}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>Hạn phản hồi: {formatDate(selectedInvitation.expiresAt)}</span>
                      </div>
                    </div>
                    {(() => {
                      const status = INVITATION_STATUS[selectedInvitation.status] || INVITATION_STATUS[0];
                      return (
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold border ${status.bg} ${status.color} ${status.border}`}
                        >
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Summary Cards */}
                  {latestDraft && (
                    <div className="mt-6 flex flex-wrap gap-4">
                      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Ngân sách đề xuất hiện tại</p>
                          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(latestDraft.proposedBudget)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Thời gian dự kiến</p>
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {formatDate(latestDraft.proposedStartDate)} — {formatDate(latestDraft.proposedEndDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Phiên bản dự thảo</p>
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            v{latestDraft.versionNumber} (bởi {latestDraft.createdByName || 'Khách hàng'})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                  {/* Project Description */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      Mô tả yêu cầu dự án
                    </h3>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300">
                      {selectedInvitation.projectDescription || 'Không có mô tả chi tiết.'}
                    </div>
                  </div>

                  {/* Contract Draft HTML */}
                  {latestDraft && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        Điều khoản hợp đồng dự thảo (Phiên bản {latestDraft.versionNumber})
                      </h3>
                      <div
                        className="prose prose-zinc max-w-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:prose-invert dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300"
                        dangerouslySetInnerHTML={{
                          __html: latestDraft.contractContentHtml || '<p>Không có nội dung điều khoản.</p>',
                        }}
                      />
                    </div>
                  )}

                  {/* Draft Version History if more than 1 version */}
                  {selectedInvitation.contractDrafts && selectedInvitation.contractDrafts.length > 1 && (
                    <div>
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <History className="h-4 w-4 text-purple-600" />
                        Lịch sử thương lượng ({selectedInvitation.contractDrafts.length} phiên bản)
                      </h3>
                      <div className="space-y-2">
                        {selectedInvitation.contractDrafts.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-850/60"
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                v{d.versionNumber}
                              </span>
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                Đề xuất bởi {d.createdByName || 'Khách hàng'}
                              </span>
                              <span className="text-zinc-400">• {formatDate(d.createdAt)}</span>
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(d.proposedBudget)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                {isActionable && (
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <button
                      onClick={() => handleAction(selectedInvitation.id, 'decline')}
                      disabled={processingId === selectedInvitation.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-semibold text-rose-600 shadow-xs transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/40 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/20"
                    >
                      {processingId === selectedInvitation.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Từ chối lời mời
                    </button>

                    <button
                      onClick={() => openCounterModal(selectedInvitation)}
                      disabled={processingId === selectedInvitation.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-semibold text-amber-700 shadow-xs transition hover:bg-amber-50 disabled:opacity-50 dark:border-amber-900/40 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-amber-950/20"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Thương lượng điều khoản
                    </button>

                    <button
                      onClick={() => handleAction(selectedInvitation.id, 'accept')}
                      disabled={processingId === selectedInvitation.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      {processingId === selectedInvitation.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Chấp nhận & Ký kết hợp đồng
                    </button>
                  </div>
                )}

                {/* If the current user just countered and is waiting for client response */}
                {selectedInvitation.status === 4 && isCreatedByMe && (
                  <div className="flex items-center justify-between border-t border-zinc-200 bg-amber-50/60 p-4 text-xs text-amber-800 dark:border-zinc-800 dark:bg-amber-950/20 dark:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span>
                        Bạn đã gửi đề xuất thương lượng mới (v{latestDraft?.versionNumber}). Đang chờ khách hàng phản hồi.
                      </span>
                    </div>
                  </div>
                )}

                {/* If already accepted */}
                {selectedInvitation.status === 3 && (
                  <div className="flex items-center justify-between border-t border-zinc-200 bg-emerald-50/60 p-4 dark:border-zinc-800 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Hợp đồng đã được kích hoạt thành công.</span>
                    </div>
                    <Link
                      href="/dashboard/work"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
                    >
                      Đến khu vực công việc <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[620px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Inbox className="h-8 w-8 opacity-60" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Chọn một lời mời</h3>
                <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
                  Chọn một lời mời từ danh sách bên trái để xem chi tiết dự án, ngân sách đề xuất và quyết định chấp nhận hoặc thương lượng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Counter Offer Modal */}
      {isCounterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Gửi đề xuất thương lượng
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Dự thảo phiên bản v{(latestDraft?.versionNumber || 1) + 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCounterModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendCounterOffer} className="mt-5 space-y-4">
              {counterError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{counterError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Ngân sách đề xuất mới (VND) *
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    value={counterBudget}
                    onChange={(e) => setCounterBudget(e.target.value)}
                    placeholder="VD: 15000000"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-zinc-400">
                    VND
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={counterStartDate}
                    onChange={(e) => setCounterStartDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={counterEndDate}
                    onChange={(e) => setCounterEndDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Lý do / Ghi chú cho khách hàng
                </label>
                <textarea
                  rows={3}
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="Giải thích lý do điều chỉnh ngân sách hoặc thời gian thực hiện..."
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCounterModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={counterLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  {counterLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  Gửi đề xuất thương lượng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
