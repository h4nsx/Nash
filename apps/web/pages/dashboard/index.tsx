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
  DollarSign,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  FolderOpen,
  ChevronRight,
  Zap,
  Check
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

      const [contractsRes, invitesRes, skillsRes, profileRes] = await Promise.allSettled([
        apiClient<Contract[]>('/work/contracts'),
        apiClient<Invitation[]>('/handshake/invitations'),
        apiClient<VerifiedSkill[]>('/skills/me/verified'),
        apiClient<FreelancerProfile>('/users/me/profile'),
      ]);

      if (contractsRes.status === 'fulfilled' && contractsRes.value.success && contractsRes.value.data) {
        setContracts(contractsRes.value.data);
      }
      if (invitesRes.status === 'fulfilled' && invitesRes.value.success && invitesRes.value.data) {
        setInvitations(invitesRes.value.data);
      }
      if (skillsRes.status === 'fulfilled' && skillsRes.value.success && skillsRes.value.data) {
        setVerifiedSkills(skillsRes.value.data);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
        setProfile(profileRes.value.data);
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

  // Aggregated calculations
  const activeContracts = contracts.filter((c) => c.status === 1);
  const pendingInvitations = invitations.filter((i) => i.status === 1 || i.status === 2 || i.status === 4);
  
  // Total earnings agreed from active & completed contracts
  const totalAgreedVolume = contracts
    .filter((c) => c.status === 1 || c.status === 2)
    .reduce((sum, c) => sum + (c.agreedBudget || 0), 0);

  // Urgent items: milestones that need changes (status 3) or pending action
  const urgentMilestones = (contracts || [])
    .flatMap((c) =>
      (c?.milestones || [])
        .filter((m) => Boolean(m && m.id))
        .map((m) => ({
          ...m,
          contractTitle: c?.projectTitle || 'Dự án',
          clientName: c?.clientName || 'Khách hàng',
        }))
    )
    .filter((m) => m.status === 3 || m.status === 1);

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
        <title>Tổng quan Chuyên gia | NASH</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        {/* Top Header / Welcome Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Chuyên gia NASH
              </span>
              {profile && (
                <button
                  onClick={handleToggleAvailability}
                  disabled={togglingAvailability}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium transition ${
                    profile.isAvailable
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                  title="Bấm để bật/tắt nhận dự án mới"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      profile.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                    }`}
                  />
                  {profile.isAvailable ? 'Sẵn sàng nhận việc' : 'Đang bận / Tạm dừng'}
                </button>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
              Xin chào, {user?.lastName} {user?.firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Trung tâm điều khiển công việc, lời mời ghép nối thông minh và huy hiệu năng lực đã xác minh.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              Làm mới
            </button>
            <Link
              href="/dashboard/matches"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Handshake className="h-4 w-4" />
              Xem lời mời ({pendingInvitations.length})
            </Link>
          </div>
        </div>

        {/* 1. Metric Stat Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Active Work */}
          <Link
            href="/dashboard/work"
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Briefcase className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-emerald-600 transition group-hover:translate-x-0.5 dark:text-emerald-400">
                Chi tiết →
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Hợp đồng đang thực hiện</h3>
              <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-white">
                {loading ? '...' : activeContracts.length}
              </p>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {activeContracts.length > 0 ? 'Tiến độ được đồng bộ hóa theo mốc' : 'Hiện chưa có hợp đồng đang chạy'}
            </p>
          </Link>

          {/* Card 2: Smart Matches & Invites */}
          <Link
            href="/dashboard/matches"
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Handshake className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-blue-600 transition group-hover:translate-x-0.5 dark:text-blue-400">
                Xem ngay →
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Lời mời đang chờ</h3>
              <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-white">
                {loading ? '...' : pendingInvitations.length}
              </p>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Từ thuật toán ghép nối trực tiếp Top 3
            </p>
          </Link>

          {/* Card 3: Verified Skills */}
          <Link
            href="/dashboard/profile"
            className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <Award className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-purple-600 transition group-hover:translate-x-0.5 dark:text-purple-400">
                Hồ sơ →
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Kỹ năng đã xác thực</h3>
              <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-white">
                {loading ? '...' : verifiedSkills.length}
              </p>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Tăng 25% điểm Smart Match khi được kiểm định
            </p>
          </Link>

          {/* Card 4: Agreed Value */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <DollarSign className="h-5 w-5" />
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                Cam kết
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Giá trị hợp đồng tích lũy</h3>
              <p className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-white truncate">
                {loading ? '...' : formatCurrency(totalAgreedVolume)}
              </p>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Tổng ngân sách các dự án đã và đang làm
            </p>
          </div>
        </div>

        {/* 2. Action-Needed Banner (If any urgent milestone revisions or pending submits) */}
        {urgentMilestones.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Cần xử lý: Có {urgentMilestones.length} mốc công việc đang chờ bạn bàn giao hoặc chỉnh sửa
                </h3>
                <div className="mt-3 divide-y divide-rose-200/60 dark:divide-rose-900/40">
                  {urgentMilestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex flex-col justify-between gap-2 py-2 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 dark:text-white text-xs">
                            {m.title}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            thuộc dự án {m.contractTitle} ({m.clientName})
                          </span>
                          {m.status === 3 && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                              Yêu cầu chỉnh sửa
                            </span>
                          )}
                        </div>
                        {m.feedbackNotes && (
                          <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">
                            Phản hồi: &ldquo;{m.feedbackNotes}&rdquo;
                          </p>
                        )}
                      </div>
                      <Link
                        href="/dashboard/work"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200"
                      >
                        Nộp lại ngay →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Grid: Active Work (Left) + Invitations & Verified Skills (Right) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column (2 Cols): Active Work Overview */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Dự án đang triển khai
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tiến độ bàn giao và các mốc thanh toán gần nhất
                </p>
              </div>
              <Link
                href="/dashboard/work"
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                Tất cả hợp đồng ({contracts.length}) <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : activeContracts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <FolderOpen className="mx-auto h-10 w-10 text-zinc-400" />
                <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                  Chưa có hợp đồng nào đang chạy
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Khách hàng sẽ gửi lời mời trực tiếp sau khi hệ thống Smart Match tìm thấy bạn. Hãy kiểm tra các lời mời mới.
                </p>
                <div className="mt-5">
                  <Link
                    href="/dashboard/matches"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    Xem lời mời ghép nối
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeContracts.slice(0, 3).map((c) => {
                  const milestones = (c?.milestones || []).filter((m) => Boolean(m && m.id));
                  const completed = milestones.filter((m) => m.status === 4).length;
                  const percent = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;
                  const nextMilestone = milestones.find((m) => m.status === 0 || m.status === 1 || m.status === 3);

                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {c.projectTitle}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                              Đang tiến hành
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">
                            Khách hàng: <span className="font-medium text-zinc-700 dark:text-zinc-300">{c.clientName || 'Khách hàng NASH'}</span> • Bắt đầu {formatDate(c.startDate)}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(c.agreedBudget)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Tiến độ: {completed}/{milestones.length} mốc hoàn tất</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{percent}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Next milestone info & Action */}
                      <div className="mt-4 flex flex-col justify-between gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center dark:border-zinc-800/60">
                        {nextMilestone ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span>
                              Mốc tiếp theo: <strong className="text-zinc-800 dark:text-zinc-200">{nextMilestone.title}</strong> (hạn chót: {formatDate(nextMilestone.dueDate)})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Tất cả mốc thanh toán đã hoàn thành</span>
                          </div>
                        )}

                        <Link
                          href="/dashboard/work"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                        >
                          Bàn giao mốc này <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (1 Col): Pending Invites & Verified Skills Badge Widget */}
          <div className="space-y-6">
            {/* Widget 1: Incoming Smart Match Invitations */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Lời mời ghép nối ({pendingInvitations.length})
                  </h3>
                </div>
                <Link
                  href="/dashboard/matches"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  Xem hết
                </Link>
              </div>

              {loading ? (
                <div className="py-6 text-center text-xs text-zinc-400">Đang tải...</div>
              ) : pendingInvitations.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-zinc-400">Không có lời mời nào đang chờ phản hồi.</p>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {pendingInvitations.slice(0, 3).map((inv) => (
                    <div key={inv.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {inv.projectTitle}
                          </h4>
                          <p className="text-[11px] text-zinc-500">
                            {inv.clientName || 'Khách hàng'} • Hết hạn {formatDate(inv.expiresAt)}
                          </p>
                        </div>
                        {inv.contractDrafts?.[0]?.proposedBudget && (
                          <span className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(inv.contractDrafts[0].proposedBudget)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 flex items-center justify-end">
                        <Link
                          href="/dashboard/matches"
                          className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        >
                          Phản hồi <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Widget 2: Verified Skills & Test CTA */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Huy hiệu kiểm định ({verifiedSkills.length})
                  </h3>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  Chi tiết
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="py-4 text-center text-xs text-zinc-400">Đang tải kỹ năng...</div>
                ) : verifiedSkills.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-center dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Bạn chưa có huy hiệu kỹ năng nào được xác thực.
                    </p>
                    <Link
                      href="/dashboard/profile"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                    >
                      <Zap className="h-3.5 w-3.5" /> Làm bài kiểm tra ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {verifiedSkills.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/50 p-2.5 text-xs dark:border-purple-900/30 dark:bg-purple-950/20"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {s.skillName}
                          </span>
                        </div>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-purple-700 shadow-2xs dark:bg-zinc-800 dark:text-purple-300">
                          {s.score}% Điểm
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explainable Match Tip */}
                <div className="rounded-xl bg-zinc-50 p-3 text-[11px] text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                    <Zap className="h-3 w-3 text-amber-500" /> Thuật toán Smart Match
                  </div>
                  <p className="mt-1">
                    Kỹ năng được kiểm định chiếm trọng số <strong>25%</strong> trong thuật toán ghép nối trực tiếp, giúp bạn ưu tiên lọt vào <strong>Top 3</strong> ứng viên gửi cho khách hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
