import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  Award,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Timer,
  Check,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

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
  score?: number;
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

export default function SkillsTestingPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<VerifiedSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Test Attempt Modal
  const [activeAttempt, setActiveAttempt] = useState<SkillTestAttempt | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<TestQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [skillsRes, verifiedRes] = await Promise.all([
        apiClient<Skill[]>('/skills'),
        apiClient<VerifiedSkill[]>('/skills/me/verified')
      ]);

      if (skillsRes.success && skillsRes.data) {
        setSkills(skillsRes.data);
      }
      if (verifiedRes.success && verifiedRes.data) {
        setVerifiedSkills(verifiedRes.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error.message || 'Lỗi khi tải danh sách kỹ năng.');
      } else {
        setError('Không thể kết nối đến máy chủ.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer countdown for active test attempt
  useEffect(() => {
    if (!activeAttempt || timeLeft <= 0 || testResult) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAttempt, timeLeft, testResult]);

  const handleStartTest = async (skillId: string) => {
    try {
      setSubmittingTest(true);
      setError(null);
      const res = await apiClient<SkillTestAttempt>(`/skills/${skillId}/test/start`, {
        method: 'POST'
      });

      if (res.success && res.data) {
        const attempt = res.data;
        setActiveAttempt(attempt);
        setTimeLeft((attempt.timeLimitMinutes || 15) * 60);

        try {
          const questions = JSON.parse(attempt.tasksJson || '[]');
          setParsedQuestions(questions);
        } catch {
          setParsedQuestions([]);
        }

        setSelectedAnswers({});
        setTestResult(null);
      } else {
        setError(res.message || 'Không thể bắt đầu bài kiểm tra.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error.message || 'Không thể bắt đầu bài thi lúc này.');
      }
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeAttempt) return;

    try {
      setSubmittingTest(true);
      const userAnswersJson = JSON.stringify(selectedAnswers);

      const res = await apiClient<{ score: number; passed: boolean }>(
        `/skills/test/${activeAttempt.attemptId}/submit`,
        {
          method: 'POST',
          body: JSON.stringify({ userAnswersJson })
        }
      );

      if (res.success && res.data) {
        setTestResult(res.data);
        fetchData();
      } else {
        setError(res.message || 'Nộp bài thi thất bại.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setError(err.error.message || 'Đã xảy ra lỗi khi nộp bài thi.');
      }
    } finally {
      setSubmittingTest(false);
    }
  };

  const isSkillVerified = (skillName: string) => {
    return verifiedSkills.some((vs) => vs.skillName.toLowerCase() === skillName.toLowerCase());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Trung Tâm Đánh Giá Kỹ Năng & Huy Hiệu | NASH</title>
      </Head>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover p-6 text-white shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-2xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              NASH Skill Verification Engine
            </div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              Chứng Nhận Năng Lực & Tăng Cơ Hội Nhận Dự Án
            </h1>
            <p className="text-xs text-white/80 leading-relaxed">
              Các bài kiểm tra năng lực chuẩn hóa giúp hồ sơ của bạn nhận huy hiệu xác thực, tăng 40% trọng số khớp lệnh trong thuật toán Smart Match và chiếm trọn niềm tin từ Khách hàng.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: My Verified Badges */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Huy Hiệu Đã Xác Thực Của Bạn</h2>
                <p className="text-2xs text-text-muted">Các kỹ năng đã vượt qua kỳ thi và được hệ thống công nhận.</p>
              </div>
            </div>
            <span className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-bold text-foreground border border-border">
              {verifiedSkills.length} Huy hiệu
            </span>
          </div>

          {verifiedSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-surface-subtle/50">
              <Award className="h-10 w-10 text-text-muted mb-2 stroke-1" />
              <p className="text-xs font-semibold text-foreground">Chưa có kỹ năng nào được xác thực</p>
              <p className="text-2xs text-text-muted mt-1 max-w-sm">
                Hãy chọn một bài thi bên dưới để bắt đầu làm bài và nhận huy hiệu ngay hôm nay!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {verifiedSkills.map((vs) => (
                <div
                  key={vs.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{vs.skillName}</div>
                      <div className="text-2xs text-emerald-700 font-medium">
                        Đã xác thực {vs.score ? `(${vs.score}%)` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-3xs text-text-muted">
                    {new Date(vs.verifiedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Catalog of Skills Available for Testing */}
        <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary-soft p-2 text-primary">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Danh Mục Bài Thi Kỹ Năng Sẵn Sàng</h2>
              <p className="text-2xs text-text-muted">Làm bài kiểm tra trắc nghiệm lý thuyết & tình huống (15 phút).</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12 text-xs text-text-muted">
              Đang tải danh sách bài thi...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {skills.map((skill) => {
                const verified = isSkillVerified(skill.name);
                return (
                  <div
                    key={skill.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/40 hover:shadow-xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-sm">{skill.name}</span>
                        {verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-3xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Đã Đạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-3xs font-medium text-text-muted border border-border">
                            <Clock className="h-3 w-3" /> 15 phút
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                        {skill.description || 'Bài đánh giá năng lực tiêu chuẩn gồm các câu hỏi kiến thức nền tảng và tình huống thực tế.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <span className="text-2xs text-text-muted">Điểm đạt: 80% trở lên</span>
                      <button
                        onClick={() => handleStartTest(skill.id)}
                        disabled={submittingTest}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          verified
                            ? 'bg-surface-subtle text-foreground hover:bg-border/60'
                            : 'bg-primary text-white hover:bg-primary-hover shadow-xs'
                        }`}
                      >
                        <Play className="h-3.5 w-3.5" />
                        {verified ? 'Thi lại nâng điểm' : 'Bắt đầu làm bài'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Test Taking Modal Dialog */}
      {activeAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">{activeAttempt.title || 'Bài Kiểm Tra Kỹ Năng'}</h3>
                <p className="text-2xs text-text-muted">Chọn câu trả lời đúng cho từng câu hỏi.</p>
              </div>

              {!testResult && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold ${
                  timeLeft <= 120 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-surface text-primary border border-border'
                }`}>
                  <Timer className="h-3.5 w-3.5" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {testResult ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                    testResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {testResult.passed ? <Check className="h-8 w-8 stroke-[2.5]" /> : <X className="h-8 w-8 stroke-[2.5]" />}
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-foreground">
                      {testResult.passed ? 'Chúc mừng! Bạn đã vượt qua bài thi' : 'Rất tiếc, bạn chưa đạt điểm yêu cầu'}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Kết quả của bạn: <span className="font-bold text-foreground">{testResult.score}%</span> (Yêu cầu tối thiểu: 80%)
                    </p>
                  </div>

                  {testResult.passed && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      Huy hiệu xác thực kỹ năng đã được gắn trực tiếp vào hồ sơ của bạn.
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveAttempt(null);
                      setTestResult(null);
                    }}
                    className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs cursor-pointer"
                  >
                    Hoàn tất & Quay lại
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {parsedQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2.5">
                      <div className="text-xs font-bold text-foreground flex items-start gap-2">
                        <span className="text-primary font-mono">Câu {qIdx + 1}.</span>
                        <span>{q.question}</span>
                      </div>

                      <div className="space-y-1.5 pl-6">
                        {q.options?.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary-soft text-foreground font-medium'
                                  : 'border-border bg-surface hover:bg-surface-subtle text-text-secondary'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${qIdx}`}
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

            {/* Footer */}
            {!testResult && (
              <div className="flex items-center justify-between border-t border-border bg-surface-subtle px-5 py-3">
                <span className="text-2xs text-text-muted">
                  Đã trả lời: {Object.keys(selectedAnswers).length}/{parsedQuestions.length} câu
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveAttempt(null)}
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-subtle cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    disabled={submittingTest}
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs cursor-pointer"
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

