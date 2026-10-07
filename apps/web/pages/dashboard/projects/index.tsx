import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import {
  Search,
  Briefcase,
  DollarSign,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface ProjectSkillRequirement {
  id: string;
  skillId: string;
  skillName: string;
  isMandatory: boolean;
  minimumExperienceYears?: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  startDate?: string;
  endDate?: string;
  status: number;
  createdAt: string;
  skillRequirements: ProjectSkillRequirement[];
}

export default function ProjectsExplorePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient<Project[]>('/projects', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (res.success && res.data) {
          setProjects(res.data);
        }
      } catch (err: any) {
        if (err instanceof ApiException) {
          setError(err.error?.message || 'Không thể tải danh sách dự án');
        } else {
          setError('Đã xảy ra lỗi khi kết nối với máy chủ');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatCurrency = (amount?: number) => {
    if (amount == null) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Head>
        <title>Khám phá dự án | Nash</title>
      </Head>

      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Khám phá dự án</h1>
            </div>
            <p className="text-gray-400">Tìm kiếm các cơ hội làm việc phù hợp với kỹ năng của bạn.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </header>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass-panel text-center py-16 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">Không tìm thấy dự án</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              {searchQuery 
                ? 'Không có dự án nào khớp với từ khóa tìm kiếm của bạn. Hãy thử tìm kiếm với từ khóa khác.'
                : 'Hiện tại chưa có dự án nào được đăng tải.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-white/10 flex flex-col group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors pr-4 line-clamp-2">
                    {project.title}
                  </h3>
                  <span className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(project.budgetMin)} 
                    {project.budgetMax && ` - ${formatCurrency(project.budgetMax)}`}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.skillRequirements.slice(0, 5).map(req => (
                    <span 
                      key={req.id}
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        req.isMandatory 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      {req.skillName}
                    </span>
                  ))}
                  {project.skillRequirements.length > 5 && (
                    <span className="text-xs px-2.5 py-1 rounded-full border bg-white/5 text-gray-400 border-white/10">
                      +{project.skillRequirements.length - 5}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Đăng {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {(project.startDate || project.endDate) && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {project.startDate && new Date(project.startDate).toLocaleDateString('vi-VN')}
                        {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('vi-VN')}`}
                      </span>
                    )}
                  </div>
                  
                  <button className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                    Chi tiết
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
