import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Inbox,
  CheckCircle2,
  Calendar,
  Clock,
  History,
  X,
  RefreshCw,
  Handshake,
  DollarSign
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
  0: { label: 'Bản nháp', color: 'text-text-muted', bg: 'bg-surface-subtle', border: 'border-border' },
  1: { label: 'Chờ bạn trả lời', color: 'text-primary', bg: 'bg-brand-50', border: 'border-brand-200' },
  2: { label: 'Đã xem', color: 'text-info', bg: 'bg-info-bg', border: 'border-sky-200' },
  3: { label: 'Đã chốt hợp đồng', color: 'text-success', bg: 'bg-success-bg', border: 'border-emerald-200' },
  4: { label: 'Đang thương lượng giá', color: 'text-warning', bg: 'bg-warning-bg', border: 'border-amber-200' },
  5: { label: 'Đã từ chối', color: 'text-danger', bg: 'bg-danger-bg', border: 'border-rose-200' },
  6: { label: 'Hết hạn phản hồi', color: 'text-text-muted', bg: 'bg-surface-subtle', border: 'border-border' },
};

export default function MatchesPage() {
  const { user } = useAuth();
  const isClient = user?.role === 'Client';
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
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.success && res.data) {
        setInvitations(res.data);
        if (selectedInvitation) {
          const updated = res.data.find((i) => i.id === selectedInvitation.id);
          if (updated) setSelectedInvitation(updated);
        } else if (res.data.length > 0) {
          setSelectedInvitation(res.data[0]);
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể tải danh sách lời mời.');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ.');
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
        alert(err.error?.message || `Không thể ${action === 'accept' ? 'chấp nhận' : 'từ chối'} lời mời.`);
      } else {
        alert('Đã xảy ra lỗi khi kết nối với máy chủ.');
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
        ? `${latestDraft?.contractContentHtml || ''}<br/><p><strong>Ghi chú thương lượng:</strong> ${counterNotes}</p>`
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
  const isCreatedByMe =
    Boolean(latestDraft && user && latestDraft.createdByName && latestDraft.createdByName.toLowerCase().includes(user.firstName.toLowerCase()));
  const isActionable =
    selectedInvitation &&
    (selectedInvitation.status === 1 || selectedInvitation.status === 2 || selectedInvitation.status === 4) &&
    !isCreatedByMe;

  return (
    <DashboardLayout>
      <Head>
        <title>Lời mời & Thương lượng hợp đồng | NASH</title>
      </Head>

      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isClient ? 'Lời mời & Trao đổi hợp đồng với người làm' : 'Lời mời hợp tác & Trao đổi hợp đồng'}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              {isClient
                ? 'Theo dõi phản hồi từ ứng viên bạn đã mời, trao đổi mức ngân sách và chốt điều khoản để tạo hợp đồng.'
                : 'Xem các dự án khách hàng mời bạn làm việc. Bạn có thể đồng ý ngay để ký hợp đồng hoặc đề xuất lại mức giá và thời gian.'}
            </p>
          </div>

          <button
            onClick={fetchInvitations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-danger-bg p-4 text-xs text-danger">
            {error}
          </div>
        )}

        {/* Master-Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Invitations List (4 cols) */}
          <div className="lg:col-span-4 rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Hộp thư ({invitations.length})
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-text-muted">
                Đang tải lời mời...
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="mx-auto h-8 w-8 text-text-muted opacity-40 mb-2" />
                <p className="text-xs text-text-secondary">Chưa có lời mời nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv) => {
                  const status = INVITATION_STATUS[inv.status] || INVITATION_STATUS[0];
                  const isSelected = selectedInvitation?.id === inv.id;
                  const draft = getLatestDraft(inv);

                  return (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvitation(inv)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary-soft shadow-2xs'
                          : 'border-border bg-surface hover:bg-surface-subtle'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-foreground line-clamp-1">
                          {inv.projectTitle}
                        </h3>
                        <span className={`text-2xs font-semibold px-2 py-0.5 rounded border ${status.bg} ${status.color} ${status.border} shrink-0`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-1.5 text-2xs text-text-muted">
                        Từ: <strong className="text-foreground">{inv.clientName}</strong>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-2xs pt-2 border-t border-border">
                        <span className="text-text-muted font-mono">{formatDate(inv.createdAt)}</span>
                        {draft && (
                          <span className="font-bold text-foreground font-mono">
                            {formatCurrency(draft.proposedBudget)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Invitation & Contract Draft Details (8 cols) */}
          <div className="lg:col-span-8">
            {selectedInvitation ? (
              <div className="rounded-xl border border-border bg-surface shadow-2xs overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-semibold text-primary uppercase tracking-wider">
                          Dự Án Ghép Nối
                        </span>
                        <span className={`text-2xs font-semibold px-2 py-0.5 rounded border ${INVITATION_STATUS[selectedInvitation.status]?.bg} ${INVITATION_STATUS[selectedInvitation.status]?.color} ${INVITATION_STATUS[selectedInvitation.status]?.border}`}>
                          {INVITATION_STATUS[selectedInvitation.status]?.label}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-foreground mt-1">
                        {selectedInvitation.projectTitle}
                      </h2>
                    </div>

                    {/* Action Buttons */}
                    {isActionable && (
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(selectedInvitation.id, 'decline')}
                          disabled={processingId === selectedInvitation.id}
                          className="rounded-lg border border-border bg-surface hover:bg-danger-bg hover:text-danger hover:border-rose-200 px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => openCounterModal(selectedInvitation)}
                          disabled={processingId === selectedInvitation.id}
                          className="rounded-lg border border-border bg-surface hover:bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                        >
                          Thương lượng
                        </button>
                        <button
                          onClick={() => handleAction(selectedInvitation.id, 'accept')}
                          disabled={processingId === selectedInvitation.id}
                          className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
                        >
                          Chấp nhận & Ký hợp đồng
                        </button>
                      </div>
                    )}
                  </div>

                  {isCreatedByMe && selectedInvitation.status === 4 && (
                    <div className="rounded-lg bg-brand-50 p-3 text-xs text-primary border border-brand-200">
                      Bạn đã gửi đề xuất thương lượng mới nhất. Đang chờ khách hàng xem xét và phản hồi.
                    </div>
                  )}

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {selectedInvitation.projectDescription || 'Khách hàng chưa nhập mô tả chi tiết dự án.'}
                  </p>
                </div>

                {/* Latest Draft Overview */}
                {latestDraft && (
                  <div className="p-6 border-b border-border bg-surface-subtle/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Điều khoản hiện tại (Bản thảo v{latestDraft.versionNumber})
                      </span>
                      <span className="text-2xs text-text-muted">
                        Đề xuất bởi: <strong className="text-foreground">{latestDraft.createdByName}</strong> lúc {formatDate(latestDraft.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg border border-border bg-surface">
                        <span className="text-2xs text-text-muted block">Ngân sách đề xuất</span>
                        <span className="text-sm font-bold text-foreground font-mono mt-0.5 block">
                          {formatCurrency(latestDraft.proposedBudget)}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-surface">
                        <span className="text-2xs text-text-muted block">Ngày bắt đầu dự kiến</span>
                        <span className="text-xs font-semibold text-foreground mt-0.5 block">
                          {formatDate(latestDraft.proposedStartDate)}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-surface">
                        <span className="text-2xs text-text-muted block">Ngày hoàn thành dự kiến</span>
                        <span className="text-xs font-semibold text-foreground mt-0.5 block">
                          {formatDate(latestDraft.proposedEndDate)}
                        </span>
                      </div>
                    </div>

                    {latestDraft.contractContentHtml && (
                      <div className="mt-4 p-4 rounded-lg border border-border bg-surface text-xs text-text-secondary leading-relaxed space-y-2">
                        <div className="text-2xs font-bold uppercase tracking-wider text-text-muted">
                          Nội dung thỏa thuận
                        </div>
                        <div
                          className="prose prose-xs max-w-none text-xs text-text-secondary"
                          dangerouslySetInnerHTML={{ __html: latestDraft.contractContentHtml }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Draft History Timeline */}
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
                    <History className="h-4 w-4" />
                    Lịch sử các phiên bản thương lượng bất biến
                  </div>

                  <div className="space-y-3">
                    {selectedInvitation.contractDrafts
                      .sort((a, b) => b.versionNumber - a.versionNumber)
                      .map((draft) => (
                        <div
                          key={draft.id}
                          className="p-3.5 rounded-lg border border-border bg-surface flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-foreground">Bản thảo v{draft.versionNumber}</span>
                            <span className="text-text-muted ml-2">bởi {draft.createdByName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-foreground font-mono">
                              {formatCurrency(draft.proposedBudget)}
                            </span>
                            <span className="text-2xs text-text-muted">
                              {formatDate(draft.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
                <Handshake className="h-9 w-9 text-text-muted opacity-40 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">
                  {isClient ? 'Chưa có lời mời nào được gửi' : 'Hộp thư chưa có lời mời mới'}
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {isClient
                    ? 'Hãy truy cập trang Quản lý dự án để xem Top 3 Smart Match và gửi lời mời hợp tác tới ứng viên phù hợp.'
                    : 'Khi khách hàng chọn bạn từ danh sách đề xuất, thông báo và điều khoản thỏa thuận sẽ hiển thị đầy đủ tại đây.'}
                </p>
                <div className="pt-1">
                  {isClient ? (
                    <Link
                      href="/dashboard/client/projects"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      Xem các dự án & Top 3 đề xuất →
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/profile"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      Làm bài thi kỹ năng để nhận lời mời →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Counter Offer Modal */}
      {isCounterModalOpen && selectedInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Thương lượng điều khoản mới</h3>
                <p className="text-xs text-text-muted mt-0.5">Tạo bản thảo hợp đồng phiên bản mới</p>
              </div>
              <button
                onClick={() => setIsCounterModalOpen(false)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendCounterOffer} className="mt-4 space-y-4">
              {counterError && (
                <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                  {counterError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Ngân sách đề xuất (VND)
                </label>
                <input
                  type="number"
                  value={counterBudget}
                  onChange={(e) => setCounterBudget(e.target.value)}
                  placeholder="Ví dụ: 30000000"
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={counterStartDate}
                    onChange={(e) => setCounterStartDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Ngày hoàn thành
                  </label>
                  <input
                    type="date"
                    value={counterEndDate}
                    onChange={(e) => setCounterEndDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Ghi chú đề xuất gửi khách hàng
                </label>
                <textarea
                  rows={3}
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  placeholder="Lý do điều chỉnh thời gian hoặc ngân sách..."
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCounterModalOpen(false)}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={counterLoading}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {counterLoading ? 'Đang gửi...' : 'Gửi đề xuất thương lượng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
