import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  User,
  Briefcase,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Save,
  Star,
  Award,
  Zap,
  Play,
  Check,
  X,
  FileQuestion,
  Sparkles,
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
        const data = profileRes.value.data;
        setProfile(data);
        setHourlyRate(data.hourlyRate?.toString() || '');
        setYearsOfExperience(data.yearsOfExperience?.toString() || '');
        setIsAvailable(data.isAvailable);
        setBio(data.bio || '');
      }

      if (skillsRes.status === 'fulfilled' && skillsRes.value.success && skillsRes.value.data) {
        setSkillsCatalog(skillsRes.value.data);
      }

      if (verifiedRes.status === 'fulfilled' && verifiedRes.value.success && verifiedRes.value.data) {
        setVerifiedSkills(verifiedRes.value.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể tải hồ sơ');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ');
      }
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
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : null,
        isAvailable,
        bio,
      };

      const res = await apiClient('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess('Cập nhật hồ sơ thành công!');
        fetchAllProfileData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error?.message || 'Không thể cập nhật hồ sơ');
      } else {
        setError('Đã xảy ra lỗi khi kết nối với máy chủ');
      }
    } finally {
      setSaving(false);
    }
  };

  // Skill Assessment actions
  const handleStartTest = async (skillId: string) => {
    try {
      setTestingSkillId(skillId);
      setTestError(null);
      setTestResult(null);
      setSelectedAnswers({});

      const res = await apiClient<SkillTestAttempt>(`/skills/${skillId}/test/start`, {
        method: 'POST',
      });

      if (res.success && res.data) {
        setActiveAttempt(res.data);
        try {
          const questions: TestQuestion[] = JSON.parse(res.data.tasksJson || '[]');
          setParsedQuestions(questions);
        } catch {
          setParsedQuestions([]);
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        alert(err.error?.message || 'Không thể bắt đầu bài kiểm tra.');
      } else {
        alert('Lỗi kết nối khi bắt đầu bài kiểm tra.');
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
        const passed = score >= 70; // 70 is baseline passing score
        setTestResult({ score, passed });
        // Refresh verified skills
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
        <title>Hồ sơ chuyên gia & Kiểm định kỹ năng | NASH</title>
      </Head>

      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Năng lực & Kiểm định
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            Hồ sơ chuyên gia
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Quản lý tỷ giá giờ làm việc, kinh nghiệm và thực hiện các bài đánh giá kỹ năng để nhận huy hiệu kiểm định Smart Match.
          </p>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p>{success}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 Columns: Professional Information Form */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  Thông tin chuyên môn & Thiết lập tỷ giá
                </h2>

                <form onSubmit={handleSubmitProfile} className="space-y-6">
                  {/* Availability Toggle */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Trạng thái nhận dự án mới
                    </label>
                    <div
                      onClick={() => setIsAvailable(!isAvailable)}
                      className="mt-2 flex w-max cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
                    >
                      <div
                        className={`relative h-5 w-10 rounded-full transition-colors ${
                          isAvailable ? 'bg-emerald-500' : 'bg-zinc-400'
                        }`}
                      >
                        <div
                          className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-xs transition-all ${
                            isAvailable ? 'left-5' : 'left-1'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {isAvailable ? 'Đang sẵn sàng nhận việc mới' : 'Tạm thời bận / Ngừng nhận dự án'}
                      </span>
                    </div>
                  </div>

                  {/* Hourly Rate & Years Experience */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Mức giá theo giờ (VND / Giờ)
                      </label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          placeholder="VD: 250000"
                          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                        />
                      </div>
                      <span className="mt-1 block text-[11px] text-zinc-400">
                        Dùng để thuật toán tính toán độ phù hợp ngân sách (Budget Fit 10%).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Số năm kinh nghiệm liên quan
                      </label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                          type="number"
                          value={yearsOfExperience}
                          onChange={(e) => setYearsOfExperience(e.target.value)}
                          placeholder="VD: 4"
                          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                        />
                      </div>
                      <span className="mt-1 block text-[11px] text-zinc-400">
                        Dùng để thuật toán tính toán kinh nghiệm (Experience Fit 15%).
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Giới thiệu bản thân & Năng lực cốt lõi
                    </label>
                    <textarea
                      rows={5}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Mô tả kỹ năng chuyên sâu, các dự án tiêu biểu đã triển khai và thế mạnh của bạn..."
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      {saving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Lưu thông tin hồ sơ
                    </button>
                  </div>
                </form>
              </div>

              {/* Assessment Catalog & Test Taking */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Danh mục bài kiểm định năng lực NASH
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Vượt qua bài kiểm tra để nhận huy hiệu xác thực vĩnh viễn và tăng 25% điểm ghép nối Smart Match.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {skillsCatalog.length === 0 ? (
                    <p className="py-4 text-center text-xs text-zinc-400">Chưa có bài kiểm tra nào sẵn sàng.</p>
                  ) : (
                    skillsCatalog.map((skill) => {
                      const verified = isSkillVerified(skill.name);
                      const isStarting = testingSkillId === skill.id;

                      return (
                        <div
                          key={skill.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 transition hover:border-zinc-300 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-850/60"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                {skill.name}
                              </h3>
                              {verified ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  <Check className="h-3 w-3" /> Đã xác thực
                                </span>
                              ) : (
                                <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  Chưa kiểm định
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {skill.description || 'Đánh giá kỹ năng lập trình và khả năng giải quyết vấn đề.'}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {verified ? (
                              <button
                                disabled
                                className="cursor-default rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              >
                                Đã đạt chuẩn
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartTest(skill.id)}
                                disabled={isStarting}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                              >
                                {isStarting ? (
                                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                )}
                                Làm bài kiểm tra
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Verified Badges Summary */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    Huy hiệu kỹ năng ({verifiedSkills.length})
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {verifiedSkills.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800">
                      <Award className="mx-auto mb-2 h-8 w-8 text-zinc-400 opacity-60" />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Bạn chưa có huy hiệu nào. Hãy tham gia làm bài kiểm tra ở mục bên cạnh để kích hoạt huy hiệu đầu tiên.
                      </p>
                    </div>
                  ) : (
                    verifiedSkills.map((v) => (
                      <div
                        key={v.id}
                        className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-900/40 dark:bg-purple-950/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900 dark:text-white text-xs">
                            {v.skillName}
                          </span>
                          <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                            Xác thực
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-400">
                          Cấp ngày: {formatDate(v.verifiedAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Algorithmic Weight Explanation Box */}
                <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <h3 className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Cơ chế tính điểm Smart Match v1
                  </h3>
                  <div className="mt-2 space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <div className="flex justify-between">
                      <span>Kỹ năng yêu cầu khớp:</span>
                      <strong className="text-zinc-700 dark:text-zinc-300">40%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Kỹ năng đã kiểm định:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">25% (Huy hiệu)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Số năm kinh nghiệm:</span>
                      <strong className="text-zinc-700 dark:text-zinc-300">15%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Phù hợp ngân sách:</span>
                      <strong className="text-zinc-700 dark:text-zinc-300">10%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Trạng thái sẵn sàng:</span>
                      <strong className="text-zinc-700 dark:text-zinc-300">10%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skill Assessment Test Modal */}
      {activeAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  <Timer className="h-3.5 w-3.5" /> Thời gian: {activeAttempt.timeLimitMinutes} phút
                </span>
                <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
                  {activeAttempt.title}
                </h2>
              </div>
              {!testResult && (
                <button
                  onClick={() => setActiveAttempt(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {testError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{testError}</span>
              </div>
            )}

            {testResult ? (
              /* Test Result View */
              <div className="py-8 text-center">
                {testResult.passed ? (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Chúc mừng! Bạn đã vượt qua bài kiểm tra
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Điểm đánh giá của bạn:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 text-lg">
                        {testResult.score}/100
                      </strong>
                    </p>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Huy hiệu kỹ năng đã được cấp và hiển thị tự động trên hồ sơ chuyên gia của bạn.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                      <AlertCircle className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Rất tiếc! Bạn chưa đạt chuẩn điểm đậu
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Điểm của bạn: <strong className="text-rose-600 text-lg">{testResult.score}/100</strong> (Điểm tối thiểu: 70)
                    </p>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Bạn có thể ôn tập và thử lại bài kiểm tra này vào lần tới.
                    </p>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => {
                      setActiveAttempt(null);
                      setTestResult(null);
                    }}
                    className="rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              </div>
            ) : (
              /* Test Questions Form */
              <div className="mt-6 space-y-6">
                {parsedQuestions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-850/50"
                  >
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Câu {qIdx + 1}: {q.question}
                    </h4>

                    <div className="mt-4 space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/70 font-semibold text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            <div
                              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-zinc-300 dark:border-zinc-600'
                              }`}
                            >
                              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500">
                    Đã trả lời: {Object.keys(selectedAnswers).length}/{parsedQuestions.length} câu
                  </span>
                  <button
                    onClick={handleSubmitTest}
                    disabled={submittingTest || Object.keys(selectedAnswers).length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    {submittingTest ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Nộp bài đánh giá
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
