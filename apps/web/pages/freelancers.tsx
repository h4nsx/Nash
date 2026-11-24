import { useState, useEffect, useId } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Award,
  ChevronRight,
  X
} from 'lucide-react';

export interface PublicFreelancer {
  id: string;
  firstName: string;
  lastName: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  isAvailable: boolean;
  bio: string;
  verifiedSkills: string[];
  completedProjectsCount: number;
}

export interface Skill {
  id: string;
  name: string;
}

export default function FreelancersExplorePage() {
  const { user } = useAuth();
  const searchInputId = useId();

  const [freelancers, setFreelancers] = useState<PublicFreelancer[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all'); // 'all', '1-3', '3-5', '5+'
  const [selectedFreelancer, setSelectedFreelancer] = useState<PublicFreelancer | null>(null);

  const fetchFreelancersAndSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const [freelancersRes, skillsRes] = await Promise.allSettled([
        apiClient<PublicFreelancer[]>('/users/freelancers'),
        apiClient<Skill[]>('/skills'),
      ]);

      if (freelancersRes.status === 'fulfilled' && freelancersRes.value.success && freelancersRes.value.data) {
        setFreelancers(freelancersRes.value.data);
      } else {
        setFreelancers([]);
      }

      if (skillsRes.status === 'fulfilled' && skillsRes.value.success && skillsRes.value.data) {
        setSkills(skillsRes.value.data);
      } else {
        setSkills([]);
      }
    } catch {
      setError('Không thể tải danh sách người làm vào lúc này.');
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancersAndSkills();
  }, []);

  const formatCurrency = (val?: number) => {
    if (!val) return 'Thương lượng';
    return `${new Intl.NumberFormat('vi-VN').format(val)} đ/giờ`;
  };

  const filteredFreelancers = freelancers.filter((f) => {
    const fullName = `${f.lastName} ${f.firstName}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      fullName.includes(query) ||
      f.bio.toLowerCase().includes(query) ||
      f.verifiedSkills.some((s) => s.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (selectedSkill !== 'all') {
      const hasSkill = f.verifiedSkills.some(
        (s) => s.toLowerCase() === selectedSkill.toLowerCase()
      );
      if (!hasSkill) return false;
    }

    if (experienceFilter === '1-3') {
      const exp = f.yearsOfExperience || 0;
      return exp >= 1 && exp <= 3;
    }
    if (experienceFilter === '3-5') {
      const exp = f.yearsOfExperience || 0;
      return exp >= 3 && exp <= 5;
    }
    if (experienceFilter === '5+') {
      const exp = f.yearsOfExperience || 0;
      return exp >= 5;
    }

    return true;
  });

  return (
    <div className="flex min-h-screen flex-col w-full bg-background selection:bg-brand-100 selection:text-primary">
      <Head>
        <title>Tìm Người Làm Phần Mềm Đã Xác Minh Kỹ Năng | NASH</title>
        <meta
          name="description"
          content="Khám phá các lập trình viên và chuyên gia kỹ thuật đã vượt qua bài kiểm tra năng lực độc lập tại NASH."
        />
      </Head>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          
          {/* Header & Subtitle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Nhân tài đã qua kiểm định độc lập
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Tìm người làm chuyên nghiệp
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary max-w-2xl">
                100% kỹ năng hiển thị đều được xác thực qua bài test chuẩn hóa. Không tự nhận bừa, không thổi phồng CV.
              </p>
            </div>

            {/* Action button tailored by user role */}
            {user?.role === 'Client' ? (
              <Link
                href="/dashboard/client/projects"
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors shrink-0 self-start md:self-auto"
              >
                Đăng dự án để ghép nối Top 3
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : user?.role === 'Freelancer' ? (
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors shrink-0 self-start md:self-auto"
              >
                <Award className="h-4 w-4" /> Thi thêm kỹ năng vào hồ sơ
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register?role=freelancer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-2xs transition-colors shrink-0"
                >
                  Gia nhập mạng lưới người làm
                </Link>
                <Link
                  href="/register?role=client"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors shrink-0"
                >
                  Đăng dự án tìm người
                </Link>
              </div>
            )}
          </div>

          {/* Search & Filters Bar */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id={searchInputId}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên người làm, chuyên môn (.NET, React, SQL, DevOps)..."
                  className="w-full rounded-lg border border-border bg-surface-subtle py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>

              {/* Skill Filter Dropdown */}
              <div className="w-full md:w-56">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
                >
                  <option value="all">Tất cả kỹ năng xác thực</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Range Filter */}
              <div className="w-full md:w-52">
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
                >
                  <option value="all">Mọi mức kinh nghiệm</option>
                  <option value="1-3">1 - 3 năm kinh nghiệm</option>
                  <option value="3-5">3 - 5 năm kinh nghiệm</option>
                  <option value="5+">Trên 5 năm kinh nghiệm</option>
                </select>
              </div>
            </div>

            {/* Quick Active Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-2xs text-text-muted">
              <span>Đang lọc: <strong>{filteredFreelancers.length}</strong> người làm phù hợp</span>
              {(searchQuery || selectedSkill !== 'all' || experienceFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSkill('all');
                    setExperienceFilter('all');
                  }}
                  className="text-primary hover:underline font-semibold ml-2 cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-danger-bg p-4 text-xs text-danger">
              {error}
            </div>
          )}

          {/* Freelancers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-xl border border-border bg-surface p-6 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-subtle" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 bg-surface-subtle rounded" />
                      <div className="h-3 w-16 bg-surface-subtle rounded" />
                    </div>
                  </div>
                  <div className="h-12 bg-surface-subtle rounded" />
                  <div className="h-6 bg-surface-subtle rounded" />
                </div>
              ))}
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
              <UserCheck className="mx-auto h-10 w-10 text-text-muted opacity-40" />
              <h3 className="text-base font-bold text-foreground">
                Chưa tìm thấy người làm phù hợp với tiêu chí lọc
              </h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Hiện chưa có người làm nào khớp với bộ lọc kỹ năng hoặc từ khóa bạn vừa nhập.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSkill('all');
                    setExperienceFilter('all');
                  }}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
                >
                  Xem toàn bộ danh sách
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFreelancers.map((fl) => (
                <div
                  key={fl.id}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-2xs hover:border-primary hover:shadow-xs transition-all"
                >
                  <div className="space-y-4">
                    {/* User Top Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-navy-900 text-white font-bold text-sm flex items-center justify-center shadow-2xs shrink-0">
                          {fl.lastName?.[0] || 'N'}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {fl.lastName} {fl.firstName}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-2xs text-text-muted">
                              {fl.yearsOfExperience ? `${fl.yearsOfExperience} năm kinh nghiệm` : 'Lập trình viên'}
                            </span>
                            <span>•</span>
                            <span className="text-2xs text-emerald-600 font-medium">Sẵn sàng nhận việc</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block font-mono text-xs font-bold text-foreground">
                          {formatCurrency(fl.hourlyRate)}
                        </span>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {fl.bio || 'Chưa cập nhật phần tự giới thiệu. Kỹ năng đã được kiểm định qua hệ thống bài test của NASH.'}
                    </p>

                    {/* Verified Skills Tags */}
                    <div>
                      <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted block mb-1.5">
                        Kỹ năng đã kiểm định ({fl.verifiedSkills.length})
                      </span>
                      {fl.verifiedSkills.length === 0 ? (
                        <span className="text-2xs text-text-muted italic">Đang cập nhật bài thi</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {fl.verifiedSkills.slice(0, 3).map((skillName, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-md bg-brand-50 border border-brand-200 px-2 py-0.5 text-2xs font-semibold text-primary"
                            >
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                              {skillName}
                            </span>
                          ))}
                          {fl.verifiedSkills.length > 3 && (
                            <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 text-2xs font-semibold text-text-muted">
                              +{fl.verifiedSkills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-2xs text-text-muted">
                      Đã hoàn thành <strong>{fl.completedProjectsCount}</strong> hợp đồng
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedFreelancer(fl)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Xem hồ sơ <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Detail Modal */}
      {selectedFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-navy-900 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {selectedFreelancer.lastName?.[0] || 'N'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {selectedFreelancer.lastName} {selectedFreelancer.firstName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
                    <span>{selectedFreelancer.yearsOfExperience ? `${selectedFreelancer.yearsOfExperience} năm kinh nghiệm` : 'Lập trình viên'}</span>
                    <span>•</span>
                    <span className="font-mono font-semibold text-foreground">{formatCurrency(selectedFreelancer.hourlyRate)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFreelancer(null)}
                className="rounded-lg p-1.5 text-text-muted hover:text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile Bio */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Giới thiệu bản thân & Năng lực</h4>
              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                {selectedFreelancer.bio || 'Chưa cập nhật chi tiết phần mô tả tiểu sử.'}
              </p>
            </div>

            {/* Verified Skills List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Chứng chỉ kỹ năng đã xác thực ({selectedFreelancer.verifiedSkills.length})
              </h4>
              <div className="space-y-2">
                {selectedFreelancer.verifiedSkills.map((skillName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-subtle text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{skillName}</span>
                    </div>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-success-bg text-success border border-emerald-200">
                      Đã qua bài kiểm tra năng lực
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedFreelancer(null)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
              >
                Đóng
              </button>

              {user?.role === 'Client' ? (
                <Link
                  href="/dashboard/client/projects"
                  className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Đăng dự án để mời hợp tác
                </Link>
              ) : (
                <Link
                  href="/register?role=client"
                  className="rounded-lg bg-primary hover:bg-primary-hover px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Đăng ký tài khoản khách hàng để kết nối
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

