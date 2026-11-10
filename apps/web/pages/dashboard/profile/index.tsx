import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  Award,
  Play,
  Check,
  X,
  FileQuestion,
  HelpCircle,
  Timer
} from 'lucide-react';

interface FreelancerProfile {
  id: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  isAvailable: boolean;
  bio: string;
  skills: string[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface VerifiedSkill {
  id: string;
  skillName: string;
  verifiedAt: string;
  expiredAt?: string;
}

interface TestQuestion {
  question: string;
  options: string[];
  answer?: number;
}

interface SkillTestAttempt {
  attemptId: string;
  skillTestId: string;
  title: string;
  timeLimitMinutes: number;
  tasksJson: string;
  startedAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [skillsCatalog, setSkillsCatalog] = useState<Skill[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkill[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');

  // Assessment Modal state
  const [activeAttempt, setActiveAttempt] = useState<SkillTestAttempt | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<TestQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [testingSkillId, setTestingSkillId] = useState<string | null>(null);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllProfileData();
  }, []);

  const fetchAllProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, skillsRes, verifiedRes] = await Promise.allSettled([
        apiClient<FreelancerProfile>('/users/me/profile'),
        apiClient<Skill[]>('/skills'),
        apiClient<VerifiedSkill[]>('/skills/me/verified'),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data) {
        const p = profileRes.value.data;
        setProfile(p);
        setHourlyRate(p.hourlyRate?.toString() || '');
        setYearsOfExperience(p.yearsOfExperience?.toString() || '');
        setIsAvailable(p.isAvailable ?? true);
        setBio(p.bio || '');
      }

      if (skillsRes.status === 'fulfilled' && skillsRes.value.success && skillsRes.value.data) {
        setSkillsCatalog(skillsRes.value.data);
      }

      if (verifiedRes.status === 'fulfilled' && verifiedRes.value.success && verifiedRes.value.data) {
        setVerifiedSkills(verifiedRes.value.data);
      }
    } catch (err) {
      console.error('Error loading profile data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        isAvailable,
        bio,
      };

      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess('Cập nhật thông tin hồ sơ thành công!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể cập nhật hồ sơ.');
      } else {
        setError('Đã xảy ra lỗi khi lưu thông tin.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStartAssessment = async (skillId: string) => {
    try {
      setTestingSkillId(skillId);
      setTestError(null);
      setTestResult(null);
      setSelectedAnswers({});

      const res = await apiClient<SkillTestAttempt>(`/skills/${skillId}/attempts`, {
        method: 'POST',
      });

      if (res.success && res.data) {
        setActiveAttempt(res.data);
        try {
          const qs: TestQuestion[] = JSON.parse(res.data.tasksJson || '[]');
          setParsedQuestions(qs);
        } catch {
          setParsedQuestions([]);
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        alert(err.error?.message || 'Không thể bắt đầu bài kiểm tra.');
      } else {
        alert('Lỗi kết nối khi khởi tạo bài kiểm tra.');
      }
    } finally {
      setTestingSkillId(null);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeAttempt) return;

    try {
      setSubmittingTest(true);
      setTestError(null);

      const answersPayload = JSON.stringify(selectedAnswers);
      const res = await apiClient<{ message: string; score: number }>(
        `/skills/test/${activeAttempt.attemptId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ userAnswersJson: answersPayload }),
        }
      );

      if (res.success && res.data) {
        const score = res.data.score;
        const passed = score >= 70;
        setTestResult({ score, passed });
        const updatedVerified = await apiClient<VerifiedSkill[]>('/skills/me/verified');
        if (updatedVerified.success && updatedVerified.data) {
          setVerifiedSkills(updatedVerified.data);
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setTestError(err.error?.message || 'Không thể nộp bài kiểm tra.');
      } else {
        setTestError('Lỗi kết nối khi nộp bài.');
      }
    } finally {
      setSubmittingTest(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'Chưa thiết lập';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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

  const isSkillVerified = (skillName: string) => {
    return verifiedSkills.some(
      (v) => v.skillName.toLowerCase() === skillName.toLowerCase()
    );
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Hồ sơ & Đánh giá năng lực | NASH</title>
      </Head>

      <div className="mx-auto max-w-6xl space-y-6 pb-12">

        {/* Header */}
        <div className="pb-4 border-b border-border">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Hồ sơ cá nhân & Bài kiểm tra tay nghề
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
            Cập nhật kinh nghiệm, giá theo giờ và làm bài test để được hệ thống ưu tiên giới thiệu việc làm cho bạn.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-danger-bg p-4 text-xs text-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-success-bg p-4 text-xs text-success">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Professional Information Form (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Thông tin hồ sơ
              </h2>
              <span className="text-2xs text-text-muted">Cập nhật theo thời gian thực</span>
            </div>

            <form onSubmit={handleSubmitProfile} className="space-y-4">

              {/* Availability Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface-subtle">
                <div>
                  <div className="text-xs font-bold text-foreground">Trạng thái nhận việc</div>
                  <div className="text-2xs text-text-muted mt-0.5">
                    {isAvailable ? 'Hồ sơ của bạn đang hiển thị cho Smart Match Top 3' : 'Đang tạm dừng nhận dự án mới'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${isAvailable
                      ? 'border-emerald-200 bg-success-bg text-success'
                      : 'border-border bg-surface text-text-muted'
                    }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-success animate-pulse' : 'bg-text-disabled'}`} />
                  {isAvailable ? 'Sẵn sàng nhận việc' : 'Tạm dừng'}
                </button>
              </div>

              {/* Hourly Rate & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Mức thù lao mong muốn (VND / Giờ)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="Ví dụ: 500000"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-2xs text-text-muted mt-1 block">
                    Quy đổi: {formatCurrency(hourlyRate ? parseFloat(hourlyRate) : undefined)} / giờ
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Số năm kinh nghiệm
                  </label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="Ví dụ: 4"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-2xs text-text-muted mt-1 block">
                    Được dùng để lọc điều kiện tối thiểu của dự án
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Giới thiệu năng lực chuyên sâu (Bio)
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tóm tắt các dự án nổi bật, thế mạnh kiến trúc phần mềm, ngôn ngữ lập trình và phong cách làm việc..."
                  className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Verified Skills & Test Catalog (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Verified Skills Section */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Huy hiệu kỹ năng đã xác thực ({verifiedSkills.length})
                </span>
                <span className="text-2xs font-semibold text-success bg-success-bg px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>

              {verifiedSkills.length === 0 ? (
                <div className="p-4 text-center rounded-lg bg-surface-subtle border border-border">
                  <Award className="mx-auto h-6 w-6 text-text-muted opacity-50 mb-1" />
                  <p className="text-xs text-text-secondary font-medium">Chưa có chứng nhận nào</p>
                  <p className="text-2xs text-text-muted mt-0.5">
                    Hãy làm bài kiểm tra bên dưới để nhận huy hiệu xác thực.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {verifiedSkills.map((vs) => (
                    <div
                      key={vs.id}
                      className="p-3 rounded-lg border border-border bg-surface-subtle flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-bold text-foreground">{vs.skillName}</span>
                      </div>
                      <span className="text-2xs text-text-muted">
                        Ngày cấp: {formatDate(vs.verifiedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Tests Catalog */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Bài kiểm tra tiêu chuẩn hóa
                </span>
                <span className="text-2xs text-text-muted">Có tính giờ</span>
              </div>

              <div className="space-y-3">
                {skillsCatalog.map((skill) => {
                  const verified = isSkillVerified(skill.name);
                  const isStarting = testingSkillId === skill.id;

                  return (
                    <div
                      key={skill.id}
                      className="p-3.5 rounded-lg border border-border bg-surface hover:border-brand-300 transition-colors flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-foreground">{skill.name}</h4>
                          {verified ? (
                            <span className="text-2xs font-semibold text-success bg-success-bg px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <Check className="h-3 w-3" /> Đã Đạt
                            </span>
                          ) : (
                            <span className="text-2xs text-text-muted">Điểm sàn: 70%</span>
                          )}
                        </div>
                        <p className="mt-1 text-2xs text-text-secondary line-clamp-2">
                          {skill.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-2xs text-text-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 30–45 phút
                        </span>

                        <button
                          onClick={() => handleStartAssessment(skill.id)}
                          disabled={isStarting}
                          className="rounded-md bg-foreground hover:bg-navy-800 text-white text-2xs font-semibold px-3 py-1.5 transition-colors cursor-pointer"
                        >
                          {isStarting ? 'Đang chuẩn bị...' : verified ? 'Làm lại để nâng điểm' : 'Bắt đầu làm test'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Interactive Assessment Modal */}
      {activeAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">

            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-surface-subtle">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-primary">
                  Bài Đánh Giá Năng Lực Chuẩn Hóa
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  {activeAttempt.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 text-xs font-mono font-bold text-foreground border border-border">
                  <Timer className="h-3.5 w-3.5 text-primary" />
                  {activeAttempt.timeLimitMinutes} phút
                </div>
                {!testResult && (
                  <button
                    onClick={() => setActiveAttempt(null)}
                    className="p-1 text-text-muted hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {testError && (
                <div className="rounded-lg bg-danger-bg p-3 text-xs text-danger border border-rose-200">
                  {testError}
                </div>
              )}

              {testResult ? (
                <div className="p-6 text-center space-y-3">
                  <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${testResult.passed ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                    {testResult.passed ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                  </div>

                  <h4 className="text-base font-bold text-foreground">
                    {testResult.passed ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra' : 'Rất tiếc! Điểm số chưa đạt yêu cầu'}
                  </h4>

                  <div className="text-2xl font-bold font-mono text-foreground">
                    Điểm số: {testResult.score}/100
                  </div>

                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    {testResult.passed
                      ? 'Huy hiệu Verified Skill đã được kích hoạt trên hồ sơ của bạn và sẵn sàng cho Smart Match.'
                      : 'Bạn cần tối thiểu 70 điểm để được cấp chứng nhận xác thực. Hãy ôn luyện và thử lại sau.'}
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => setActiveAttempt(null)}
                      className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Đóng cửa sổ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {parsedQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2.5">
                      <div className="text-xs font-bold text-foreground flex items-start gap-2">
                        <span className="text-primary font-mono">Q{qIdx + 1}.</span>
                        <span>{q.question}</span>
                      </div>

                      <div className="space-y-1.5 pl-6">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;

                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${isSelected
                                  ? 'border-primary bg-primary-soft text-foreground font-medium'
                                  : 'border-border bg-surface hover:bg-surface-subtle text-text-secondary'
                                }`}
                            >
                              <input
                                type="radio"
                                name={`q-${qIdx}`}
                                checked={isSelected}
                                onChange={() => handleSelectOption(qIdx, optIdx)}
                                className="h-3.5 w-3.5 text-primary border-border focus:ring-0"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            {!testResult && (
              <div className="p-4 border-t border-border bg-surface flex items-center justify-between">
                <span className="text-2xs text-text-muted">
                  Đã trả lời: {Object.keys(selectedAnswers).length}/{parsedQuestions.length} câu
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveAttempt(null)}
                    className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    disabled={submittingTest}
                    className="rounded-lg bg-primary hover:bg-primary-hover px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    {submittingTest ? 'Đang chấm điểm...' : 'Nộp bài kiểm tra'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
