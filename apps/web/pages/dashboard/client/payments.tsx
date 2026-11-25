import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Printer,
  X,
  Receipt
} from 'lucide-react';

interface PaymentTransaction {
  id: string;
  contractId: string;
  milestoneId: string;
  projectTitle: string;
  milestoneTitle: string;
  counterpartyName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string; // 'Pending' | 'Completed' | 'Failed'
  transactionCode: string;
  qrUrl: string;
  createdAt: string;
  completedAt?: string;
}

const formatVnd = (val?: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function ClientPaymentsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Completed' | 'Pending'>('all');
  const [receiptTx, setReceiptTx] = useState<PaymentTransaction | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<PaymentTransaction[]>('/payments/my-transactions');
      if (res.success && res.data) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
      }
    } catch (err: unknown) {
      setError(
        err instanceof ApiException ? err.error.message : 'Không thể tải lịch sử giao dịch.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const completedList = transactions.filter((t) => t.status === 'Completed');
  const pendingList = transactions.filter((t) => t.status === 'Pending');
  const totalPaidVnd = completedList.reduce((sum, t) => sum + (t.amount || 0), 0);

  const filtered = transactions.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.transactionCode.toLowerCase().includes(q) ||
      t.projectTitle.toLowerCase().includes(q) ||
      t.milestoneTitle.toLowerCase().includes(q) ||
      t.counterpartyName.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Lịch sử Thanh toán &amp; Biên lai | NASH</title>
      </Head>

      <div className="mx-auto max-w-6xl space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Thanh toán &amp; Biên lai VietQR
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              Theo dõi toàn bộ giao dịch giải ngân cột mốc qua VietQR và xuất biên lai thanh toán.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchTransactions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-foreground cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Tổng đã thanh toán</span>
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {loading ? '—' : formatVnd(totalPaidVnd)}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Giao dịch hoàn tất</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {loading ? '—' : completedList.length}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Đang chờ đối soát</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {loading ? '—' : pendingList.length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border">
            {[
              { key: 'all' as const, label: `Tất cả (${transactions.length})` },
              { key: 'Completed' as const, label: `Hoàn tất (${completedList.length})` },
              { key: 'Pending' as const, label: `Chờ xác nhận (${pendingList.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã giao dịch, dự án, người nhận..."
              className="w-full rounded-lg border border-border bg-surface py-1.5 pl-9 pr-3 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Transactions List */}
        {loading ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-xs text-text-muted">
            Đang tải dữ liệu giao dịch...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center space-y-2">
            <Receipt className="h-9 w-9 text-text-muted opacity-40 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">Chưa có giao dịch thanh toán nào</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Khi bạn tạo mã VietQR thanh toán cột mốc trong mục Hợp đồng &amp; Nghiệm thu, lịch sử đối soát sẽ hiển thị tại đây.
            </p>
            <Link
              href="/dashboard/work"
              className="inline-block pt-1 text-xs font-semibold text-primary hover:underline"
            >
              Đi tới Hợp đồng &amp; Nghiệm thu →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface shadow-2xs overflow-x-auto print:hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border text-text-muted font-semibold">
                <tr>
                  <th className="p-3.5">Mã giao dịch</th>
                  <th className="p-3.5">Dự án &amp; Cột mốc</th>
                  <th className="p-3.5">Người thụ hưởng</th>
                  <th className="p-3.5 text-right">Số tiền (VND)</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5">Thời gian</th>
                  <th className="p-3.5 text-right">Biên lai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-subtle/50">
                    <td className="p-3.5 font-mono font-bold text-primary whitespace-nowrap">
                      {tx.transactionCode}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-foreground line-clamp-1">{tx.projectTitle}</div>
                      <div className="text-2xs text-text-muted line-clamp-1">{tx.milestoneTitle}</div>
                    </td>
                    <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                      {tx.counterpartyName || 'Freelancer'}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                      {formatVnd(tx.amount)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {tx.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-3xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Hoàn tất
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-3xs font-semibold text-amber-700">
                          <Clock className="h-3 w-3" /> Chờ xác nhận
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-2xs text-text-muted whitespace-nowrap">
                      {formatDateTime(tx.completedAt || tx.createdAt)}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setReceiptTx(tx)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-2xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
                      >
                        <Printer className="h-3 w-3" /> Xem biên lai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {receiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs print:static print:bg-white print:p-0">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5 print:border-none print:shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-border print:hidden">
              <h3 className="text-sm font-bold text-foreground">Biên Lai Thanh Toán Điện Tử</h3>
              <button
                type="button"
                onClick={() => setReceiptTx(null)}
                className="rounded-lg p-1 text-text-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="text-center border-b border-dashed border-border pb-4">
                <div className="text-lg font-black tracking-widest text-foreground">NASH</div>
                <div className="text-2xs text-text-muted uppercase mt-0.5">
                  Biên lai giải ngân cột mốc ({receiptTx.paymentMethod})
                </div>
                <div className="mt-2 text-xl font-black font-mono text-primary">
                  {formatVnd(receiptTx.amount)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-text-muted">Mã giao dịch:</span>
                  <span className="font-mono font-bold text-foreground">{receiptTx.transactionCode}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-muted">Dự án:</span>
                  <span className="font-semibold text-foreground text-right">{receiptTx.projectTitle}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-muted">Cột mốc:</span>
                  <span className="font-semibold text-foreground text-right">{receiptTx.milestoneTitle}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-muted">Người nhận:</span>
                  <span className="font-semibold text-foreground">{receiptTx.counterpartyName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-muted">Trạng thái:</span>
                  <span className="font-bold text-emerald-700">{receiptTx.status}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-text-muted">Thời gian:</span>
                  <span className="font-mono text-foreground">
                    {formatDateTime(receiptTx.completedAt || receiptTx.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border print:hidden">
              <button
                type="button"
                onClick={() => setReceiptTx(null)}
                className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> In biên lai / Xuất PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
