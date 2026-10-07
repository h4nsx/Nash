import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
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
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

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
  status: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  contractDrafts: ContractDraft[];
}

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

const INVITATION_STATUS = {
  0: { label: 'Bản Nháp', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
  1: { label: 'Đang Chờ', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  2: { label: 'Đã Xem', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  3: { label: 'Đã Chấp Nhận', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  4: { label: 'Đang Thương Lượng', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  5: { label: 'Đã Từ Chối', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  6: { label: 'Đã Hết Hạn', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' }
};

export default function MatchesPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<Invitation[]>('/handshake/invitations', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (res.success && res.data) {
        setInvitations(res.data);
      }
    } catch (err: any) {
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
      await apiClient(`/handshake/invitations/${id}/${action}`, {
        method: 'POST'
      });
      await fetchInvitations();
      if (selectedInvitation?.id === id) {
        setSelectedInvitation(null);
      }
    } catch (err: any) {
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
    return inv.contractDrafts[0];
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Lời mời trực tiếp | Nash</title>
      </Head>

      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Lời mời trực tiếp</h1>
          </div>
          <p className="text-gray-400">Xem và quản lý các lời mời dự án từ khách hàng.</p>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lời mời List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                <span>Hộp thư đến</span>
                <span className="text-xs font-medium bg-primary/20 text-primary px-2.5 py-1 rounded-full">
                  {invitations.length}
                </span>
              </h2>

              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                  <Inbox className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400 text-sm">Chưa có lời mời nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map(inv => {
                    const status = INVITATION_STATUS[inv.status as keyof typeof INVITATION_STATUS];
                    const isActive = selectedInvitation?.id === inv.id;

                    return (
                      <button
                        key={inv.id}
                        onClick={() => setSelectedInvitation(inv)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
                          isActive 
                            ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white truncate pr-2">{inv.projectTitle}</h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-3 truncate">Khách hàng: {inv.clientName}</p>
                        
                        <div className="flex items-center text-xs text-gray-500 gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(inv.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chi tiết lời mời */}
          <div className="lg:col-span-2">
            {selectedInvitation ? (
              <div className="glass-panel rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col h-full min-h-[600px]">
                <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedInvitation.projectTitle}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Briefcase className="w-4 h-4" />
                        <span>Từ khách hàng: <strong className="text-white">{selectedInvitation.clientName}</strong></span>
                      </div>
                    </div>
                    {(() => {
                      const status = INVITATION_STATUS[selectedInvitation.status as keyof typeof INVITATION_STATUS];
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    {(() => {
                      const draft = getLatestDraft(selectedInvitation);
                      if (!draft) return null;
                      return (
                        <>
                          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <div>
                              <p className="text-xs text-gray-400">Ngân sách đề xuất</p>
                              <p className="font-semibold text-emerald-400">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(draft.proposedBudget)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-400">Thời gian dự kiến</p>
                              <p className="font-medium text-white text-sm">
                                {new Date(draft.proposedStartDate).toLocaleDateString('vi-VN')} - {new Date(draft.proposedEndDate).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-primary" />
                        Mô tả dự án
                      </h3>
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5">
                        {selectedInvitation.projectDescription || 'Không có mô tả chi tiết.'}
                      </div>
                    </div>

                    {getLatestDraft(selectedInvitation) && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Nội dung hợp đồng đề xuất
                        </h3>
                        <div 
                          className="prose prose-invert max-w-none text-sm text-gray-300 bg-white/[0.02] p-4 rounded-xl border border-white/5"
                          dangerouslySetInnerHTML={{ __html: getLatestDraft(selectedInvitation)!.contractContentHtml || '<p>Không có nội dung HTML.</p>' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {selectedInvitation.status === 1 && (
                  <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleAction(selectedInvitation.id, 'decline')}
                      disabled={processingId === selectedInvitation.id}
                      className="px-6 py-2.5 rounded-xl font-medium text-red-400 hover:text-white bg-red-400/10 hover:bg-red-500 transition-all border border-red-400/20 hover:border-red-500 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === selectedInvitation.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleAction(selectedInvitation.id, 'accept')}
                      disabled={processingId === selectedInvitation.id}
                      className="px-6 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === selectedInvitation.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Chấp nhận
                    </button>
                  </div>
                )}
                
                {selectedInvitation.status === 3 && (
                  <div className="p-4 border-t border-white/5 bg-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Bạn đã chấp nhận lời mời này</span>
                    </div>
                    <Link href="/dashboard/work" className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
                      Đến khu vực làm việc
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-white/5 bg-white/[0.02] h-full min-h-[600px] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10 text-primary opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Chọn một lời mời</h3>
                <p className="text-gray-400 max-w-sm">
                  Chọn một lời mời từ danh sách bên trái để xem thông tin chi tiết, ngân sách, và quyết định chấp nhận hoặc từ chối.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
