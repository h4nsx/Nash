import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { apiClient, ApiException } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Building2,
  Globe,
  Phone,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FolderKanban
} from 'lucide-react';

interface ClientProfileData {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
  taxCode: string;
  billingAddress: string;
  city: string;
  country: string;
  contactPhone: string;
  bio: string;
  publishedProjectsCount: number;
  activeContractsCount: number;
  completedContractsCount: number;
}

export default function ClientProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Việt Nam');
  const [contactPhone, setContactPhone] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient<ClientProfileData>('/users/me/client-profile');
        if (res.success && res.data) {
          const d = res.data;
          setProfile(d);
          setFirstName(d.firstName || '');
          setLastName(d.lastName || '');
          setCompanyName(d.companyName || '');
          setIndustry(d.industry || '');
          setCompanySize(d.companySize || '');
          setWebsiteUrl(d.websiteUrl || '');
          setTaxCode(d.taxCode || '');
          setBillingAddress(d.billingAddress || '');
          setCity(d.city || '');
          setCountry(d.country || 'Việt Nam');
          setContactPhone(d.contactPhone || '');
          setBio(d.bio || '');
        }
      } catch (err: unknown) {
        if (err instanceof ApiException) {
          setError(err.error.message || 'Không thể tải hồ sơ doanh nghiệp.');
        } else {
          setError('Lỗi kết nối đến máy chủ.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await apiClient('/users/me/client-profile', {
        method: 'PUT',
        body: JSON.stringify({
          firstName,
          lastName,
          companyName,
          industry,
          companySize,
          websiteUrl,
          taxCode,
          billingAddress,
          city,
          country,
          contactPhone,
          bio,
        }),
      });

      if (res.success) {
        if (user) {
          login({
            ...user,
            firstName: firstName.trim() || user.firstName,
            lastName: lastName.trim() || user.lastName,
          });
        }
        setSuccess('Đã lưu hồ sơ doanh nghiệp và thông tin thanh toán thành công!');
        setTimeout(() => setSuccess(null), 3500);
      }
    } catch (err: unknown) {
      setError(err instanceof ApiException ? err.error.message : 'Không thể lưu hồ sơ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Hồ sơ Doanh nghiệp & Thanh toán | NASH</title>
      </Head>

      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Hồ sơ Doanh nghiệp & Thanh toán
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-text-secondary">
              Cập nhật thông tin công ty, người đại diện và mã số thuế xuất hóa đơn khi hợp tác với Freelancer.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Dự án đã xuất bản</span>
              <FolderKanban className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {loading ? '—' : profile?.publishedProjectsCount ?? 0}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Hợp đồng đang chạy</span>
              <Briefcase className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {loading ? '—' : profile?.activeContractsCount ?? 0}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Hợp đồng đã hoàn thành</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-foreground">
              {loading ? '—' : profile?.completedContractsCount ?? 0}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        {loading ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-xs text-text-muted">
            Đang tải thông tin hồ sơ doanh nghiệp...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Representative & Company Basic Info */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Building2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Thông tin Doanh nghiệp & Đại diện
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Họ người đại diện</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nguyễn"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">Tên người đại diện</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Minh"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">
                    Tên Công ty / Tổ chức
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="VD: Công ty TNHH Giải pháp Công nghệ NASH"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Lĩnh vực hoạt động</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">-- Chọn lĩnh vực --</option>
                    <option value="Công nghệ thông tin & Phần mềm">Công nghệ thông tin & Phần mềm</option>
                    <option value="Thương mại điện tử & Bán lẻ">Thương mại điện tử & Bán lẻ</option>
                    <option value="Tài chính & Fintech">Tài chính & Fintech</option>
                    <option value="Giáo dục & EdTech">Giáo dục & EdTech</option>
                    <option value="Y tế & Chăm sóc sức khỏe">Y tế & Chăm sóc sức khỏe</option>
                    <option value="Marketing & Truyền thông">Marketing & Truyền thông</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Quy mô nhân sự</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">-- Chọn quy mô --</option>
                    <option value="1-10 nhân sự (Startup)">1-10 nhân sự (Startup)</option>
                    <option value="11-50 nhân sự">11-50 nhân sự</option>
                    <option value="51-200 nhân sự">51-200 nhân sự</option>
                    <option value="200+ nhân sự (Enterprise)">200+ nhân sự (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                    <Globe className="h-3.5 w-3.5 text-text-muted" /> Website công ty
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://company.vn"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                    <Phone className="h-3.5 w-3.5 text-text-muted" /> Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0901 234 567"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">
                    Giới thiệu về doanh nghiệp & Văn hóa hợp tác
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu sản phẩm, định hướng kỹ thuật và cách làm việc với Freelancer..."
                    className="w-full rounded-lg border border-border bg-surface p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tax & Billing Section */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Thông tin Hóa đơn & Địa chỉ Thanh toán
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Mã số thuế (Tax Code)</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="VD: 0312345678"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 text-text-muted" /> Thành phố / Tỉnh
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="TP. Hồ Chí Minh / Hà Nội"
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-foreground mb-1">Địa chỉ xuất hóa đơn</label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Quốc gia</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-6 py-2.5 text-xs font-semibold text-white shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ doanh nghiệp'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
