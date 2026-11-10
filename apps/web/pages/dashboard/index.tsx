import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/api/client';
import {
  Briefcase,
  Handshake,
  Award,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Milestone {
  id: string;
  contractId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: number; // 0: Pending, 1: InProgress, 2: Submitted, 3: ChangesRequested, 4: Accepted
  submissionNotes?: string;
  feedbackNotes?: string;
}

interface Contract {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  agreedBudget: number;
  startDate: string;
  endDate: string;
  status: number; // 1: Active, 2: Completed, 3: Cancelled
  createdAt: string;
  milestones: Milestone[];
}

interface Invitation {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  status: number; // 0: Draft, 1: Pending, 2: Viewed, 3: Accepted, 4: Countered, 5: Declined, 6: Expired
  expiresAt: string;
  contractDrafts: Array<{
    proposedBudget: number;
    versionNumber: number;
  }>;
}

interface VerifiedSkill {
  id: string;
  skillId: string;
  skillName: string;
  score: number;
  status: number;
  verifiedAt: string;
}

interface FreelancerProfile {
  isAvailable: boolean;
  hourlyRate?: number;
  yearsOfExperience?: number;
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkill[]>([]);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const promises: Promise<any>[] = [
        apiClient<Contract[]>('/work/contracts'),
        apiClient<Invitation[]>('/handshake/invitations'),
      ];

      if (user?.role === 'Freelancer') {
        promises.push(apiClient<VerifiedSkill[]>('/skills/me/verified'));
        promises.push(apiClient<FreelancerProfile>('/users/me/profile'));
      }

      const results = await Promise.allSettled(promises);

      if (results[0].status === 'fulfilled' && results[0].value.success && results[0].value.data) {
        setContracts(results[0].value.data);
      }
      if (results[1].status === 'fulfilled' && results[1].value.success && results[1].value.data) {
        setInvitations(results[1].value.data);
      }
      if (user?.role === 'Freelancer') {
        if (results[2]?.status === 'fulfilled' && results[2].value.success && results[2].value.data) {
          setVerifiedSkills(results[2].value.data);
        }
        if (results[3]?.status === 'fulfilled' && results[3].value.success && results[3].value.data) {
          setProfile(results[3].value.data);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard overview data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      setTogglingAvailability(true);
      const newStatus = !profile.isAvailable;
      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          isAvailable: newStatus,
          hourlyRate: profile.hourlyRate,
          yearsOfExperience: profile.yearsOfExperience,
        }),
      });
      if (res.success) {
        setProfile((prev) => (prev ? { ...prev, isAvailable: newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update availability status', err);
    } finally {
      setTogglingAvailability(false);
    }
  };

  // Calculations
  const activeContracts = contracts.filter((c) => c.status === 1);
  const pendingInvitations = invitations.filter((i) => i.status === 1 || i.status === 2 || i.status === 4);
  const totalVolume = contracts
    .filter((c) => c.status === 1 || c.status === 2)
    .reduce((sum, c) => sum + (c.agreedBudget || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val || 0);
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

  return (
    <DashboardLayout>
      <Head>
        <title>Tổng quan | NASH</title>
      </Head>

      <div className="mx-auto max-w-6xl space-y-6 pb-12">

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Chào {user?.firstName || 'bạn'}! Chúc một ngày làm việc hiệu quả
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              Xem nhanh tiến độ công việc, các lời mời mới và bài kiểm tra kỹ năng của bạn.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {profile && (
              <button
                onClick={handleToggleAvailability}
                disabled={togglingAvailability}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle transition-all cursor-pointer"
              >
                {profile.isAvailable ? 'Sẵn sàng nhận việc' : 'Đang tạm dừng'}
              </button>
            )}

            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* 4 Core KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <Link
            href="/dashboard/work"
            className="rounded-xl border border-border bg-surface p-5 shadow-2xs hover:border-brand-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Việc đang làm</span>
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground font-mono">
                {loading ? '—' : activeContracts.length}
              </span>
              <span className="text-xs text-primary font-medium group-hover:underline">Xem việc →</span>
            </div>
            <p className="mt-1 text-2xs text-text-muted">Các dự án đang chạy</p>
          </Link>

          <Link
            href="/dashboard/matches"
            className="rounded-xl border border-border bg-surface p-5 shadow-2xs hover:border-brand-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Lời mời mới</span>
              <Handshake className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground font-mono">
                {loading ? '—' : pendingInvitations.length}
              </span>
              <span className="text-xs text-primary font-medium group-hover:underline">Mở xem →</span>
            </div>
            <p className="mt-1 text-2xs text-text-muted">Khách hàng chọn bạn</p>
          </Link>

          <Link
            href="/dashboard/profile"
            className="rounded-xl border border-border bg-surface p-5 shadow-2xs hover:border-brand-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Kỹ năng đã đạt</span>
              <Award className="h-4 w-4 text-success" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground font-mono">
                {loading ? '—' : verifiedSkills.length}
              </span>
              <span className="text-xs text-primary font-medium group-hover:underline">Thi thêm →</span>
            </div>
            <p className="mt-1 text-2xs text-text-muted">Đã kiểm tra tay nghề</p>
          </Link>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Thu nhập dự kiến</span>
              <span className="text-xs font-mono font-bold text-text-muted">VND</span>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-bold text-foreground font-mono">
                {loading ? '—' : formatCurrency(totalVolume)}
              </span>
            </div>
            <p className="mt-1 text-2xs text-text-muted">Từ các hợp đồng đã ký</p>
          </div>

        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Active Work & Milestones (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Hợp đồng đang thực hiện ({activeContracts.length})
              </h2>
              <Link href="/dashboard/work" className="text-xs font-semibold text-primary hover:underline">
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
                Đang tải dữ liệu hợp đồng...
              </div>
            ) : activeContracts.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <Briefcase className="mx-auto h-8 w-8 text-text-muted opacity-50" />
                <h3 className="mt-2 text-sm font-bold text-foreground">Chưa có hợp đồng nào đang chạy</h3>
                <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto">
                  Hãy hoàn thành các bài kiểm tra kỹ năng để nhận được lời mời ghép nối từ khách hàng.
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white transition-colors"
                  >
                    Kiểm tra năng lực ngay
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeContracts.map((contract) => {
                  const pendingMilestones = contract.milestones?.filter((m) => m.status !== 4) || [];
                  const nextMilestone = pendingMilestones[0];

                  return (
                    <div
                      key={contract.id}
                      className="rounded-xl border border-border bg-surface p-5 shadow-2xs hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/dashboard/work`}
                            className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {contract.projectTitle}
                          </Link>
                          <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                            <span>Khách hàng: <strong className="text-foreground">{contract.clientName}</strong></span>
                            <span>•</span>
                            <span className="font-mono text-foreground font-semibold">{formatCurrency(contract.agreedBudget)}</span>
                          </div>
                        </div>

                        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-success-bg text-success border border-emerald-200">
                          Đang hoạt động
                        </span>
                      </div>

                      {nextMilestone && (
                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="text-text-secondary">Mốc tiếp theo: <strong>{nextMilestone.title}</strong></span>
                          </div>
                          <span className="font-mono text-xs text-text-muted">Hạn: {formatDate(nextMilestone.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Invitations & Smart Match (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Lời mời mới ({pendingInvitations.length})
              </h2>
              <Link href="/dashboard/matches" className="text-xs font-semibold text-primary hover:underline">
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center text-xs text-text-muted">
                Đang tải lời mời...
              </div>
            ) : pendingInvitations.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <Handshake className="mx-auto h-8 w-8 text-text-muted opacity-50" />
                <h3 className="mt-2 text-sm font-bold text-foreground">Không có lời mời nào đang chờ</h3>
                <p className="mt-1 text-xs text-text-secondary max-w-xs mx-auto">
                  Khi khách hàng chọn bạn từ Top 3 Smart Match, lời mời trực tiếp sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInvitations.slice(0, 3).map((invitation) => {
                  const latestDraft = invitation.contractDrafts?.[0];

                  return (
                    <div
                      key={invitation.id}
                      className="rounded-xl border border-border bg-surface p-4 shadow-2xs hover:border-brand-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-foreground line-clamp-1">
                            {invitation.projectTitle}
                          </h4>
                          <p className="text-2xs text-text-muted mt-0.5">
                            Gửi bởi: <strong className="text-foreground">{invitation.clientName}</strong>
                          </p>
                        </div>
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-primary border border-brand-200">
                          Top 3 Match
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border">
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(latestDraft?.proposedBudget || 0)}
                        </span>
                        <Link
                          href="/dashboard/matches"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Đàm phán & Xem →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Verified Skills Quick Glance */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Chứng chỉ năng lực ({verifiedSkills.length})
                </span>
                <Link href="/dashboard/profile" className="text-xs font-semibold text-primary hover:underline">
                  Làm bài test
                </Link>
              </div>

              {verifiedSkills.length === 0 ? (
                <p className="mt-3 text-xs text-text-secondary">
                  Bạn chưa có chứng nhận kỹ năng nào. Làm bài test để tăng 65% điểm tương thích trong Smart Match!
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {verifiedSkills.map((vs) => (
                    <span
                      key={vs.id}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-surface-subtle border border-border text-foreground font-medium"
                    >
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      {vs.skillName}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
