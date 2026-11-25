import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient, ApiException } from '@/lib/api/client';
import { X, Send, FileText } from 'lucide-react';

export interface OfferProjectSummary {
  id: string;
  title: string;
  status?: number;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRateMax?: number;
  startDate?: string;
  endDate?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  contentHtml: string;
  contentJson: string;
  isActive: boolean;
}

interface OfferComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancer: { id: string; name: string } | null;
  fixedProject?: OfferProjectSummary | null;
  onSuccess: (invitedName: string, projectTitle: string) => void;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatVnd = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDateVn = (isoDate: string) => {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

export function OfferComposerModal({
  isOpen,
  onClose,
  freelancer,
  fixedProject,
  onSuccess,
}: OfferComposerModalProps) {
  const [projects, setProjects] = useState<OfferProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom');

  const [offerBudget, setOfferBudget] = useState('');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerEndDate, setOfferEndDate] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProject = useMemo(() => {
    if (fixedProject) return fixedProject;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [fixedProject, projects, selectedProjectId]);

  const applyProjectDefaults = (proj: OfferProjectSummary | null) => {
    const defaultBudget =
      proj?.budgetMax ||
      proj?.budgetMin ||
      (proj?.hourlyRateMax ? proj.hourlyRateMax * 40 : 10000000);
    const defaultStart = proj?.startDate
      ? proj.startDate.substring(0, 10)
      : new Date().toISOString().substring(0, 10);
    const defaultEnd = proj?.endDate
      ? proj.endDate.substring(0, 10)
      : new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10);

    setOfferBudget(String(defaultBudget));
    setOfferStartDate(defaultStart);
    setOfferEndDate(defaultEnd);
  };

  useEffect(() => {
    if (!isOpen || !freelancer) return;

    setError(null);
    setSelectedTemplateId('custom');
    setOfferNotes(
      'Chúng tôi đánh giá cao hồ sơ năng lực và các kỹ năng xác thực của bạn. Mời bạn tham gia dự án!'
    );

    // Load templates
    apiClient<ContractTemplate[]>('/contracttemplates')
      .then((res) => {
        if (res.success && res.data) {
          setTemplates(res.data);
          if (res.data.length > 0) {
            setSelectedTemplateId(res.data[0].id);
          }
        }
      })
      .catch(() => {
        setTemplates([]);
      });

    if (fixedProject) {
      setSelectedProjectId(fixedProject.id);
      applyProjectDefaults(fixedProject);
    } else {
      setLoadingProjects(true);
      apiClient<OfferProjectSummary[]>('/projects/my-projects')
        .then((res) => {
          const published = (res.data || []).filter((p) => p.status === 1);
          setProjects(published);
          if (published.length > 0) {
            setSelectedProjectId(published[0].id);
            applyProjectDefaults(published[0]);
          } else {
            setSelectedProjectId('');
            applyProjectDefaults(null);
          }
        })
        .catch(() => {
          setProjects([]);
        })
        .finally(() => setLoadingProjects(false));
    }
  }, [isOpen, freelancer?.id, fixedProject]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  const renderedTemplateHtml = useMemo(() => {
    if (!selectedTemplate || !freelancer) return '';
    const budgetNum = parseFloat(offerBudget) || 0;
    return selectedTemplate.contentHtml
      .replaceAll('{{PROJECT_TITLE}}', escapeHtml(activeProject?.title || 'Dự án NASH'))
      .replaceAll('{{FREELANCER_NAME}}', escapeHtml(freelancer.name))
      .replaceAll('{{BUDGET_VND}}', escapeHtml(formatVnd(budgetNum)))
      .replaceAll('{{START_DATE}}', escapeHtml(formatDateVn(offerStartDate)))
      .replaceAll('{{END_DATE}}', escapeHtml(formatDateVn(offerEndDate)));
  }, [selectedTemplate, freelancer, activeProject, offerBudget, offerStartDate, offerEndDate]);

  if (!isOpen || !freelancer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) {
      setError('Vui lòng chọn một dự án đang tuyển (Published) để gửi lời mời.');
      return;
    }

    const parsedBudget = parseFloat(offerBudget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setError('Vui lòng nhập ngân sách đề xuất hợp lệ (lớn hơn 0 VND).');
      return;
    }

    if (!offerStartDate || !offerEndDate) {
      setError('Vui lòng chọn ngày bắt đầu và ngày hoàn thành dự kiến.');
      return;
    }

    if (new Date(offerEndDate) <= new Date(offerStartDate)) {
      setError('Ngày hoàn thành phải sau ngày bắt đầu.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const safeNotes = escapeHtml(offerNotes.trim());
      const notesHtml = safeNotes ? `<p><strong>Ghi chú bổ sung:</strong> ${safeNotes}</p>` : '';
      const contractContentHtml = renderedTemplateHtml
        ? `${renderedTemplateHtml}${notesHtml}`
        : `<p>${safeNotes || 'Đề nghị hợp tác triển khai dự án theo thỏa thuận.'}</p>`;

      const res = await apiClient('/handshake/invitations', {
        method: 'POST',
        body: JSON.stringify({
          projectId: activeProject.id,
          freelancerId: freelancer.id,
          proposedBudget: parsedBudget,
          proposedStartDate: new Date(offerStartDate).toISOString(),
          proposedEndDate: new Date(offerEndDate).toISOString(),
          contractContentHtml,
          contractContentJson: JSON.stringify({
            templateId: selectedTemplate?.id || null,
            templateName: selectedTemplate?.name || 'Custom',
            notes: offerNotes.trim(),
          }),
        }),
      });

      if (res.success) {
        onSuccess(freelancer.name, activeProject.title);
        onClose();
      } else {
        setError(res.message || 'Không thể gửi lời mời hợp tác.');
      }
    } catch (err: unknown) {
      setError(
        err instanceof ApiException
          ? err.error.message || 'Không thể gửi lời mời hợp tác.'
          : 'Lỗi kết nối khi gửi lời mời hợp tác.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Gửi Lời Mời &amp; Bản Thảo Hợp Đồng
            </h3>
            <p className="text-2xs text-text-muted mt-0.5">
              Ứng viên: <strong className="text-foreground">{freelancer.name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {/* Project selector if not fixed */}
          {!fixedProject && (
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Chọn dự án đang tuyển <span className="text-rose-500">*</span>
              </label>
              {loadingProjects ? (
                <div className="rounded-lg border border-border bg-surface-subtle p-2.5 text-2xs text-text-muted">
                  Đang tải danh sách dự án của bạn...
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-2xs text-amber-800 space-y-1">
                  <p>Bạn chưa có dự án nào đang xuất bản (Published).</p>
                  <Link href="/dashboard/client/projects" className="font-bold text-primary underline">
                    Tạo &amp; xuất bản dự án ngay →
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedProjectId(nextId);
                    const nextProj = projects.find((p) => p.id === nextId) || null;
                    applyProjectDefaults(nextProj);
                  }}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Contract Template Selector */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
              <FileText className="h-3.5 w-3.5 text-primary" /> Mẫu hợp đồng chuẩn hóa
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              <option value="custom">Tự nhập điều khoản mở đầu (Không dùng mẫu)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Ngân sách đề xuất (VND) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={offerBudget}
              onChange={(e) => setOfferBudget(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Ngày bắt đầu <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={offerStartDate}
                onChange={(e) => setOfferStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Ngày hoàn thành <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={offerEndDate}
                onChange={(e) => setOfferEndDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface p-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {renderedTemplateHtml && (
            <div className="rounded-lg border border-border bg-surface-subtle p-3 space-y-1.5">
              <div className="text-3xs font-bold uppercase tracking-wider text-text-muted">
                Xem trước điều khoản hợp đồng từ mẫu
              </div>
              <div
                className="prose prose-xs max-w-none text-2xs text-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderedTemplateHtml }}
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Ghi chú bổ sung / Lời nhắn mở đầu
            </label>
            <textarea
              rows={3}
              value={offerNotes}
              onChange={(e) => setOfferNotes(e.target.value)}
              placeholder="Ghi chú về phạm vi công việc, kỳ vọng bàn giao và điều khoản hợp tác..."
              className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || (!fixedProject && projects.length === 0)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? 'Đang gửi...' : 'Xác nhận gửi lời mời'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
