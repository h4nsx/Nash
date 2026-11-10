import { useState, useEffect, useId } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { Contract } from './index';
import { ArrowLeft, Printer, ShieldCheck, CheckCircle2, Building, User, Calendar, FileText } from 'lucide-react';

export default function ContractDetailPage() {
  const router = useRouter();
  const { contractId } = router.query;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId || typeof contractId !== 'string') return;

    const fetchContract = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient<Contract>(`/work/contracts/${contractId}`);
        if (res.success && res.data) {
          setContract(res.data);
        } else {
          setError(res.message || 'Không thể tải thông tin hợp đồng.');
        }
      } catch (err: unknown) {
        if (err instanceof ApiException) {
          setError(err.error.message || 'Lỗi khi tải hợp đồng.');
        } else {
          setError('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <Head>
        <title>{contract ? `Hợp Đồng: ${contract.projectTitle}` : 'Chi Tiết Hợp Đồng'} | NASH</title>
      </Head>

      <div className="mx-auto max-w-4xl space-y-6 print:m-0 print:max-w-none">
        {/* Navigation & Print Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/dashboard/work"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách hợp đồng
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-subtle shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4 text-text-secondary" /> In hợp đồng / Xuất PDF
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface text-xs text-text-muted">
            Đang tải dữ liệu hợp đồng...
          </div>
        ) : error || !contract ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
            {error || 'Hợp đồng không tồn tại.'}
          </div>
        ) : (
          /* Printable Formal Contract Document */
          <div className="rounded-xl border border-border bg-surface p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
            {/* Header Document */}
            <div className="border-b-2 border-foreground pb-6 text-center">
              <div className="text-xl font-black tracking-tight text-foreground mb-2">
                NASH
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                HỢP ĐỒNG HỢP TÁC VÀ BÀN GIAO DỰ ÁN
              </h1>
              <p className="mt-1 font-mono text-xs text-text-muted">
                Số HĐ: NASH-CTR-{contract.id.substring(0, 8).toUpperCase()} • Ngày lập: {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {/* Parties Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border">
              <div className="space-y-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">BÊN A (NGƯỜI THUÊ)</span>
                <div className="rounded-lg bg-surface-subtle border border-border p-3.5 text-xs space-y-1">
                  <div className="font-bold text-foreground">
                    {contract.clientName}
                  </div>
                  <div className="text-text-secondary text-2xs">Mã tài khoản: {contract.clientId}</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-text-muted">BÊN B (NGƯỜI NHẬN VIỆC)</span>
                <div className="rounded-lg bg-surface-subtle border border-border p-3.5 text-xs space-y-1">
                  <div className="font-bold text-foreground">
                    {contract.freelancerName}
                  </div>
                  <div className="text-text-secondary text-2xs">Mã tài khoản: {contract.freelancerId}</div>
                </div>
              </div>
            </div>

            {/* Agreement Terms */}
            <div className="py-6 space-y-6 border-b border-border text-xs leading-relaxed text-foreground">
              <div>
                <h3 className="font-bold text-sm mb-2 text-foreground">ĐIỀU 1: PHẠM VI DỰ ÁN & MÔ TẢ CÔNG VIỆC</h3>
                <p className="text-text-secondary font-medium">Tên dự án: <strong className="text-foreground">{contract.projectTitle}</strong></p>
                <p className="mt-1 text-text-secondary">{contract.projectDescription}</p>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-2 text-foreground">ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG & TIẾN ĐỘ THỰC HIỆN</h3>
                <p className="text-text-secondary">
                  Tổng giá trị thỏa thuận nghiệm thu: <strong className="text-primary text-sm">{contract.agreedBudget.toLocaleString('vi-VN')} VND</strong>
                </p>
                <p className="text-text-secondary mt-0.5">
                  Thời hạn thực hiện: từ ngày {new Date(contract.startDate).toLocaleDateString('vi-VN')} đến ngày {new Date(contract.endDate).toLocaleDateString('vi-VN')}.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-2 text-foreground">ĐIỀU 3: CÁC MỐC GIAO NỘP CÔNG VIỆC (MILESTONES)</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-subtle border-b border-border font-semibold text-text-muted">
                      <tr>
                        <th className="p-2.5">Giai đoạn</th>
                        <th className="p-2.5">Hạn hoàn thành</th>
                        <th className="p-2.5 text-right">Chi phí (VND)</th>
                        <th className="p-2.5 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {contract.milestones.map((m, idx) => (
                        <tr key={m.id}>
                          <td className="p-2.5">
                            <div className="font-bold text-foreground">Mốc {idx + 1}: {m.title}</div>
                            <div className="text-2xs text-text-secondary">{m.description}</div>
                          </td>
                          <td className="p-2.5 whitespace-nowrap text-text-secondary">
                            {new Date(m.dueDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-foreground whitespace-nowrap">
                            {m.amount.toLocaleString('vi-VN')}
                          </td>
                          <td className="p-2.5 text-center whitespace-nowrap">
                            {m.status === 4 ? (
                              <span className="text-emerald-700 font-semibold text-2xs">Đã nghiệm thu</span>
                            ) : m.status === 2 ? (
                              <span className="text-amber-700 font-semibold text-2xs">Chờ duyệt</span>
                            ) : (
                              <span className="text-text-muted text-2xs">Đang triển khai</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm mb-1 text-foreground">ĐIỀU 4: ĐIỀU KHOẢN CAM KẾT & BẢO MẬT</h3>
                <ul className="list-disc pl-5 space-y-1 text-text-secondary text-2xs">
                  <li>Hai bên cam kết tuân thủ đầy đủ các tiêu chuẩn kỹ năng và mô tả công việc đã quy định trong hợp đồng.</li>
                  <li>Sản phẩm bàn giao phải trải qua quy trình kiểm tra chất lượng trước khi Bên A bấm nghiệm thu trên NASH Platform.</li>
                  <li>Mọi tranh chấp (nếu có) sẽ được giải quyết trước hết dựa trên lịch sử nộp bài và tiêu chuẩn nghiệm thu trên hệ thống.</li>
                </ul>
              </div>
            </div>

            {/* Signature Section */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs">
              <div className="space-y-16">
                <div>
                  <span className="font-bold text-foreground block">ĐẠI DIỆN BÊN A</span>
                  <span className="text-2xs text-text-muted">Ký số điện tử tự động qua NASH</span>
                </div>
                <div className="font-semibold text-primary font-mono text-2xs">
                  ✓ VERIFIED DIGITAL SIGNATURE
                  <br />
                  <span className="text-text-muted font-normal">ID: {contract.clientId.substring(0, 12)}</span>
                </div>
              </div>

              <div className="space-y-16">
                <div>
                  <span className="font-bold text-foreground block">ĐẠI DIỆN BÊN B</span>
                  <span className="text-2xs text-text-muted">Ký số điện tử tự động qua NASH</span>
                </div>
                <div className="font-semibold text-primary font-mono text-2xs">
                  ✓ VERIFIED DIGITAL SIGNATURE
                  <br />
                  <span className="text-text-muted font-normal">ID: {contract.freelancerId.substring(0, 12)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

