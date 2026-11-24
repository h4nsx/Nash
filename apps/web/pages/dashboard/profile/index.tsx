import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Calendar,
  Languages,
  FolderGit2,
  Sparkles,
  Star
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  role: string;
  description: string;
  liveUrl?: string;
  repoUrl?: string;
  techStack: string[];
  imageUrls: string[];
}

interface WorkExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface LanguageProficiency {
  id: string;
  language: string;
  proficiencyLevel: string;
}

interface FullFreelancerProfile {
  id: string;
  headline: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  isAvailable: boolean;
  bio: string;
  city: string;
  country: string;
  timezone: string;
  hoursPerWeek: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  jobSuccessScore: number;
  skills: string[];
  portfolioItems: PortfolioItem[];
  workExperiences: WorkExperience[];
  educations: Education[];
  certifications: Certification[];
  languages: LanguageProficiency[];
}

export default function ProfileViewPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FullFreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient<FullFreelancerProfile>('/users/me/profile');
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError(res.message || 'Không thể tải hồ sơ cá nhân.');
        }
      } catch (err: unknown) {
        if (err instanceof ApiException) {
          setError(err.error.message || 'Lỗi kết nối khi tải hồ sơ.');
        } else {
          setError('Không thể kết nối đến máy chủ.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-xs text-text-muted">
          Đang tải thông tin hồ sơ...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>{user ? `${user.lastName} ${user.firstName}` : 'Hồ Sơ Năng Lực'} | NASH</title>
      </Head>

      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-2xs font-semibold text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" /> Chế độ xem thực tế của Khách hàng
            </span>
          </div>

          <Link
            href="/dashboard/profile/edit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Chỉnh sửa hồ sơ & portfolio
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Hero Header Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: Avatar + Title info */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-soft text-2xl font-black text-primary border border-border">
                  {user?.lastName?.[0] || 'U'}
                </div>
                {profile?.isAvailable && (
                  <span
                    className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-surface bg-emerald-500"
                    title="Sẵn sàng nhận dự án"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    {user?.lastName} {user?.firstName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-3xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Đã xác thực KYC
                  </span>
                </div>

                <p className="text-xs font-semibold text-primary">
                  {profile?.headline || 'Chuyên gia Freelancer trên nền tảng NASH'}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-2xs text-text-muted">
                  {(profile?.city || profile?.country) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.city ? `${profile.city}, ` : ''}{profile.country}
                    </span>
                  )}
                  {profile?.timezone && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {profile.timezone}
                    </span>
                  )}
                  {profile?.hoursPerWeek && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {profile.hoursPerWeek}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Key Stats Card */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface-subtle p-4 md:flex-col md:items-end">
              <div>
                <div className="text-2xs text-text-muted">Mức thù lao</div>
                <div className="text-lg font-black text-foreground">
                  {profile?.hourlyRate ? `$${profile.hourlyRate}/giờ` : 'Thương lượng'}
                </div>
              </div>

              <div className="md:text-right">
                <div className="text-2xs text-text-muted">Job Success Score</div>
                <div className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" /> {profile?.jobSuccessScore || 100}% Thành công
                </div>
              </div>

              <div className="md:text-right">
                <div className="text-2xs text-text-muted">Kinh nghiệm</div>
                <div className="text-xs font-bold text-foreground">
                  {profile?.yearsOfExperience ? `${profile.yearsOfExperience} năm thực chiến` : 'Chưa cập nhật'}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Bar */}
          {(profile?.githubUrl || profile?.linkedinUrl || profile?.websiteUrl) && (
            <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4 text-xs">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-text-secondary hover:text-foreground transition-colors"
                >
                  <FolderGit2 className="h-3.5 w-3.5" /> GitHub <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-text-secondary hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" /> LinkedIn <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-text-secondary hover:text-foreground transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" /> Website <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Left Column (2 Cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Overview / Bio */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-foreground">Giới Thiệu Bản Thân & Chuyên Môn</h2>
              <div className="text-xs leading-relaxed text-text-secondary whitespace-pre-line">
                {profile?.bio || 'Chưa cập nhật đoạn giới thiệu.'}
              </div>
            </div>

            {/* Portfolio Showcase Grid */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Dự Án Tiêu Biểu ({profile?.portfolioItems?.length || 0})</h2>
                </div>
                <Link href="/dashboard/profile/edit" className="text-2xs font-semibold text-primary hover:underline">
                  + Quản lý dự án
                </Link>
              </div>

              {(!profile?.portfolioItems || profile.portfolioItems.length === 0) ? (
                <p className="text-2xs text-text-muted italic py-4 text-center">Chưa có dự án nào được đăng tải.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-surface-subtle p-4 transition-all hover:border-primary/50 space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          {item.liveUrl && (
                            <a
                              href={item.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-text-muted hover:text-primary transition-colors"
                              title="Xem Demo trực tiếp"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-3xs font-semibold text-primary">{item.role}</p>
                        <p className="text-2xs text-text-secondary line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-2 border-t border-border/60">
                        {item.techStack?.map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-surface px-1.5 py-0.5 text-3xs font-medium text-foreground border border-border"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Work Experiences Timeline */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Kinh Nghiệm Làm Việc Thực Chiến</h2>
              </div>

              {(!profile?.workExperiences || profile.workExperiences.length === 0) ? (
                <p className="text-2xs text-text-muted italic">Chưa có kinh nghiệm làm việc nào được liệt kê.</p>
              ) : (
                <div className="space-y-4">
                  {profile.workExperiences.map((exp) => (
                    <div key={exp.id} className="relative pl-6 border-l-2 border-primary/30 space-y-1">
                      <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{exp.position}</span>
                        <span className="text-3xs text-text-muted">
                          {new Date(exp.startDate).toLocaleDateString('vi-VN')} -{' '}
                          {exp.isCurrentRole ? 'Hiện tại' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN') : '')}
                        </span>
                      </div>
                      <div className="text-2xs font-semibold text-primary">{exp.companyName}</div>
                      <p className="text-2xs text-text-secondary leading-relaxed pt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Column (1 Col) */}
          <div className="space-y-6">
            {/* NASH Verified Skills */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground">Kỹ Năng Đã Xác Thực</h3>
                </div>
                <Link href="/dashboard/skills" className="text-3xs font-semibold text-primary hover:underline">
                  Thi nâng điểm
                </Link>
              </div>

              {(!profile?.skills || profile.skills.length === 0) ? (
                <div className="py-2 text-center text-2xs text-text-muted">
                  Chưa có kỹ năng nào vượt qua bài test.
                  <div className="mt-2">
                    <Link
                      href="/dashboard/skills"
                      className="rounded-lg bg-primary-soft px-3 py-1.5 text-2xs font-bold text-primary hover:bg-primary-soft/80"
                    >
                      Bắt đầu làm bài thi
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skillName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-2xs font-bold text-emerald-800 border border-emerald-200"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {skillName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">Chứng Chỉ Quốc Tế</h3>
              </div>

              {(!profile?.certifications || profile.certifications.length === 0) ? (
                <p className="text-2xs text-text-muted italic">Chưa có chứng chỉ nào.</p>
              ) : (
                <div className="space-y-2.5">
                  {profile.certifications.map((cert) => (
                    <div key={cert.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-foreground">{cert.name}</div>
                      <div className="text-2xs text-text-secondary">{cert.issuer}</div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-3xs text-primary underline"
                        >
                          Xác thực chứng chỉ <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <GraduationCap className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">Học Vấn</h3>
              </div>

              {(!profile?.educations || profile.educations.length === 0) ? (
                <p className="text-2xs text-text-muted italic">Chưa cập nhật học vấn.</p>
              ) : (
                <div className="space-y-2.5">
                  {profile.educations.map((edu) => (
                    <div key={edu.id} className="text-xs space-y-0.5">
                      <div className="font-bold text-foreground">{edu.school}</div>
                      <div className="text-2xs text-text-secondary">{edu.degree} - {edu.fieldOfStudy}</div>
                      <div className="text-3xs text-text-muted">{edu.startYear} - {edu.endYear || 'Hiện tại'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Languages */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <Languages className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">Ngôn Ngữ Giao Tiếp</h3>
              </div>

              {(!profile?.languages || profile.languages.length === 0) ? (
                <p className="text-2xs text-text-muted italic">Chưa cập nhật ngôn ngữ.</p>
              ) : (
                <div className="space-y-1.5">
                  {profile.languages.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{l.language}</span>
                      <span className="text-2xs text-text-muted">{l.proficiencyLevel}</span>
                    </div>
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
