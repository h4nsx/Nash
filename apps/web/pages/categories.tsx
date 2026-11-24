import { useState, useEffect, useId } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Search,
  Layers,
  Award,
  Briefcase,
  Users,
  ArrowRight,
  ChevronRight,
  Code2
} from 'lucide-react';

export interface SkillCategoryOverview {
  id: string;
  name: string;
  description: string;
  hasTest: boolean;
  verifiedFreelancersCount: number;
  activeProjectsCount: number;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const searchInputId = useId();

  const [categories, setCategories] = useState<SkillCategoryOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to fetch detailed categories overview
      const res = await apiClient<SkillCategoryOverview[]>('/skills/categories-overview');
      if (res.success && res.data && res.data.length > 0) {
        setCategories(res.data);
        return;
      }

      // Fallback to active skills list if categories-overview endpoint is restarting
      const skillsRes = await apiClient<Array<{ id: string; name: string; description?: string }>>('/skills');
      if (skillsRes.success && skillsRes.data) {
        setCategories(
          skillsRes.data.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description || 'Kỹ năng nền tảng trong phát triển phần mềm.',
            hasTest: true,
            verifiedFreelancersCount: 0,
            activeProjectsCount: 0,
          }))
        );
      } else {
        setCategories([]);
      }
    } catch {
      // Direct secondary attempt with /skills
      try {
        const skillsRes = await apiClient<Array<{ id: string; name: string; description?: string }>>('/skills');
        if (skillsRes.success && skillsRes.data) {
          setCategories(
            skillsRes.data.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description || 'Kỹ năng nền tảng trong phát triển phần mềm.',
              hasTest: true,
              verifiedFreelancersCount: 0,
              activeProjectsCount: 0,
            }))
          );
          return;
        }
      } catch {
        // Ignore secondary error
      }
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại dịch vụ backend.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  });

  // Calculate totals
  const totalVerifiedFreelancers = categories.reduce((sum, c) => sum + c.verifiedFreelancersCount, 0);
  const totalActiveProjects = categories.reduce((sum, c) => sum + c.activeProjectsCount, 0);

  return (
    <div className="flex min-h-screen flex-col w-full bg-background selection:bg-brand-100 selection:text-primary">
      <Head>
        <title>Danh Mục Kỹ Năng & Lĩnh Vực Chuyên Môn | NASH</title>
        <meta
          name="description"
          content="Khám phá các danh mục công nghệ và kỹ năng phần mềm đã được kiểm định năng lực thực tế tại NASH."
        />
      </Head>

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Cơ cấu chuyên môn xác thực
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Danh mục kỹ năng chuẩn hóa
              </h1>
              <p className="mt-1.5 text-sm text-text-secondary max-w-2xl">
                Mỗi kỹ năng đều gắn liền với bài kiểm tra tay nghề và tiêu chí chấm điểm minh bạch. Giúp khách hàng chọn đúng người, người làm tự tin khẳng định năng lực.
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <div className="rounded-lg border border-border bg-surface px-3.5 py-2 shadow-2xs text-center">
                <span className="block text-base font-bold text-foreground font-mono">
                  {loading ? '—' : categories.length}
                </span>
                <span className="text-2xs text-text-muted">Kỹ năng chuẩn</span>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3.5 py-2 shadow-2xs text-center">
                <span className="block text-base font-bold text-foreground font-mono">
                  {loading ? '—' : totalActiveProjects}
                </span>
                <span className="text-2xs text-text-muted">Dự án cần tuyển</span>
              </div>
              <div className="rounded-lg border border-border bg-surface px-3.5 py-2 shadow-2xs text-center">
                <span className="block text-base font-bold text-foreground font-mono">
                  {loading ? '—' : totalVerifiedFreelancers}
                </span>
                <span className="text-2xs text-text-muted">Người làm đã đạt</span>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs">
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm danh mục kỹ năng (.NET, Clean Architecture, React, SQL, Cloud...)"
                className="w-full rounded-lg border border-border bg-surface-subtle py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              />
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-danger-bg p-4 text-xs text-danger">
              {error}
            </div>
          )}

          {/* Categories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-52 rounded-xl border border-border bg-surface p-6 animate-pulse space-y-4">
                  <div className="h-5 w-32 bg-surface-subtle rounded" />
                  <div className="h-10 bg-surface-subtle rounded" />
                  <div className="h-6 bg-surface-subtle rounded" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
              <Layers className="mx-auto h-10 w-10 text-text-muted opacity-40" />
              <h3 className="text-base font-bold text-foreground">
                Không tìm thấy danh mục kỹ năng phù hợp
              </h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Hiện tại chưa có kỹ năng nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-subtle cursor-pointer"
                >
                  Xem toàn bộ danh mục
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-2xs hover:border-primary hover:shadow-xs transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-brand-50 border border-brand-200 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {cat.description || 'Kỹ năng nền tảng trong phát triển phần mềm được kiểm định qua hệ thống bài test của NASH.'}
                    </p>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70 text-2xs">
                      <div>
                        <span className="text-text-muted block">Dự án đang tuyển:</span>
                        <strong className="text-foreground font-mono text-xs">{cat.activeProjectsCount} dự án</strong>
                      </div>
                      <div>
                        <span className="text-text-muted block">Đã qua kiểm định:</span>
                        <strong className="text-foreground font-mono text-xs">{cat.verifiedFreelancersCount} người</strong>
                      </div>
                    </div>
                  </div>

                  {/* Logical UX Navigation Link */}
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold">
                    <Link
                      href={`/projects?skill=${encodeURIComponent(cat.name)}`}
                      className="text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <Briefcase className="h-3.5 w-3.5" /> Xem việc làm
                    </Link>

                    <Link
                      href={`/freelancers?skill=${encodeURIComponent(cat.name)}`}
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Users className="h-3.5 w-3.5" /> Xem người làm <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Banner with Guidance */}
          <div className="rounded-2xl border border-border bg-gradient-to-r from-surface to-surface-subtle p-8 shadow-2xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="text-base font-bold text-foreground">
                  Bạn là người làm muốn xác thực kỹ năng mới?
                </h3>
                <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
                  Làm bài kiểm tra năng lực kỹ thuật (có giới hạn thời gian và tự động chấm điểm) để nhận huy hiệu kiểm định, giúp tăng 65% tỷ lệ được thuật toán Smart Match đề xuất vào các dự án phù hợp.
                </p>
              </div>

              <div className="shrink-0">
                {user?.role === 'Freelancer' ? (
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
                  >
                    <Award className="h-4 w-4" /> Làm bài test ngay
                  </Link>
                ) : (
                  <Link
                    href="/register?role=freelancer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors"
                  >
                    Đăng ký làm bài test <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

