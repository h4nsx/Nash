import { useState, useEffect } from 'react';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  X,
  CheckCircle2,
  Star,
  MapPin,
  Briefcase,
  Award,
  ExternalLink,
  GraduationCap,
  Languages,
  Send,
  Globe
} from 'lucide-react';

export interface PublicFreelancerDetail {
  id: string;
  firstName: string;
  lastName: string;
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
  averageRating: number;
  reviewsCount: number;
  verifiedSkills: string[];
  completedProjectsCount: number;
  portfolioItems: Array<{
    id: string;
    title: string;
    role: string;
    description: string;
    liveUrl?: string;
    repoUrl?: string;
    techStack: string[];
  }>;
  workExperiences: Array<{
    id: string;
    companyName: string;
    position: string;
    startDate: string;
    endDate?: string;
    isCurrentRole: boolean;
    description: string;
  }>;
  educations: Array<{
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    credentialUrl?: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiencyLevel: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewerName: string;
    createdAt: string;
  }>;
}

interface FreelancerProfileModalProps {
  freelancerId: string | null;
  onClose: () => void;
  onInvite?: (freelancer: { id: string; name: string }) => void;
}

const formatHourlyVnd = (val?: number) => {
  if (!val) return 'Thương lượng';
  return `${new Intl.NumberFormat('vi-VN').format(val)} ₫/giờ`;
};

export function FreelancerProfileModal({
  freelancerId,
  onClose,
  onInvite,
}: FreelancerProfileModalProps) {
  const [profile, setProfile] = useState<PublicFreelancerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!freelancerId) {
      setProfile(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient<PublicFreelancerDetail>(`/users/freelancers/${freelancerId}`);
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError(res.message || 'Không thể tải hồ sơ ứng viên.');
        }
      } catch (err: unknown) {
        setError(err instanceof ApiException ? err.error.message : 'Lỗi kết nối khi tải hồ sơ.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [freelancerId]);

  if (!freelancerId) return null;

  const fullName = profile ? `${profile.lastName} ${profile.firstName}`.trim() : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-6 py-4">
          <h3 className="text-sm font-bold text-foreground">Hồ Sơ Năng Lực Ứng Viên</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:text-foreground hover:bg-surface cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-text-muted">
              Đang tải thông tin hồ sơ chi tiết...
            </div>
          ) : error || !profile ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              {error || 'Không tìm thấy hồ sơ.'}
            </div>
          ) : (
            <>
              {/* Header Identity */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-full bg-navy-900 text-white font-bold text-base flex items-center justify-center shrink-0">
                    {profile.lastName?.[0] || profile.firstName?.[0] || 'F'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-foreground">{fullName}</h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-3xs font-semibold border ${
                          profile.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-surface-subtle text-text-muted border-border'
                        }`}
                      >
                        {profile.isAvailable ? 'Sẵn sàng nhận việc' : 'Đang bận'}
                      </span>
                    </div>
                    {profile.headline && (
                      <p className="text-xs font-medium text-primary">{profile.headline}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-2xs text-text-muted">
                      {(profile.city || profile.country) && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[profile.city, profile.country].filter(Boolean).join(', ')}
                        </span>
                      )}
                      <span>•</span>
                      <span>{profile.yearsOfExperience || 0} năm kinh nghiệm</span>
                      <span>•</span>
                      <span>{profile.completedProjectsCount} hợp đồng hoàn thành</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-sm font-extrabold font-mono text-foreground">
                    {formatHourlyVnd(profile.hourlyRate)}
                  </div>
                  <div className="mt-1 flex items-center sm:justify-end gap-1.5 text-2xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-foreground">
                      {profile.reviewsCount > 0 ? profile.averageRating.toFixed(1) : 'Mới'}
                    </span>
                    <span className="text-text-muted">({profile.reviewsCount} đánh giá)</span>
                  </div>
                  <div className="text-3xs text-emerald-700 font-semibold mt-0.5">
                    Job Success: {Math.round(profile.jobSuccessScore)}%
                  </div>
                </div>
              </div>

              {/* Bio & Links */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Giới thiệu &amp; Định hướng
                </h5>
                <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                  {profile.bio || 'Ứng viên chưa cập nhật mô tả chi tiết.'}
                </p>
                {(profile.githubUrl || profile.linkedinUrl || profile.websiteUrl) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.githubUrl && (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2.5 py-1 text-2xs font-medium text-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" /> GitHub
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2.5 py-1 text-2xs font-medium text-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" /> LinkedIn
                      </a>
                    )}
                    {profile.websiteUrl && (
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2.5 py-1 text-2xs font-medium text-foreground hover:text-primary"
                      >
                        <Globe className="h-3 w-3" /> Website
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Verified Skills */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Kỹ năng đã kiểm định ({profile.verifiedSkills.length})
                </h5>
                {profile.verifiedSkills.length === 0 ? (
                  <p className="text-2xs text-text-muted">Chưa có kỹ năng kiểm định.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.verifiedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-50 border border-brand-200 px-2.5 py-1 text-2xs font-semibold text-primary"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio Items */}
              {profile.portfolioItems.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Dự án tiêu biểu (Portfolio)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-surface-subtle/60 p-3.5 space-y-1.5"
                      >
                        <div className="text-xs font-bold text-foreground">{item.title}</div>
                        {item.role && (
                          <div className="text-3xs font-semibold text-primary">{item.role}</div>
                        )}
                        <p className="text-2xs text-text-secondary line-clamp-3">
                          {item.description}
                        </p>
                        {item.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="rounded bg-surface px-1.5 py-0.5 text-4xs border border-border text-text-muted"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {(item.liveUrl || item.repoUrl) && (
                          <div className="flex gap-3 pt-1 text-3xs font-semibold text-primary">
                            {item.liveUrl && (
                              <a href={item.liveUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                Demo →
                              </a>
                            )}
                            {item.repoUrl && (
                              <a href={item.repoUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                Source →
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {profile.workExperiences.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" /> Kinh nghiệm làm việc
                  </h5>
                  <div className="space-y-2">
                    {profile.workExperiences.map((exp) => (
                      <div key={exp.id} className="rounded-lg border border-border p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{exp.position}</span>
                          <span className="text-3xs text-text-muted font-mono">
                            {new Date(exp.startDate).getFullYear()} –{' '}
                            {exp.isCurrentRole
                              ? 'Hiện tại'
                              : exp.endDate
                              ? new Date(exp.endDate).getFullYear()
                              : ''}
                          </span>
                        </div>
                        <div className="text-2xs font-medium text-primary">{exp.companyName}</div>
                        {exp.description && (
                          <p className="text-2xs text-text-secondary">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Languages */}
              {(profile.educations.length > 0 || profile.languages.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.educations.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" /> Học vấn
                      </h5>
                      <div className="space-y-1.5">
                        {profile.educations.map((ed) => (
                          <div key={ed.id} className="rounded-lg border border-border p-2.5 text-2xs">
                            <div className="font-bold text-foreground">{ed.school}</div>
                            <div className="text-text-secondary">
                              {ed.degree} • {ed.fieldOfStudy}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.languages.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Languages className="h-3.5 w-3.5 text-primary" /> Ngôn ngữ
                      </h5>
                      <div className="space-y-1.5">
                        {profile.languages.map((lang) => (
                          <div
                            key={lang.id}
                            className="flex items-center justify-between rounded-lg border border-border p-2.5 text-2xs"
                          >
                            <span className="font-semibold text-foreground">{lang.language}</span>
                            <span className="text-text-muted">{lang.proficiencyLevel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              {profile.reviews.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Đánh giá từ Khách hàng ({profile.reviewsCount})
                  </h5>
                  <div className="space-y-2">
                    {profile.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-lg border border-border bg-surface-subtle p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{rev.reviewerName}</span>
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {rev.rating}/5
                          </span>
                        </div>
                        <p className="text-2xs text-text-secondary">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
          >
            Đóng
          </button>
          {profile && onInvite && (
            <button
              type="button"
              onClick={() => onInvite({ id: profile.id, name: fullName })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Mời hợp tác ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
