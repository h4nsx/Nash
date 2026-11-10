import Link from 'next/link';
import { ArrowRight, Check, ArrowUpRight, ShieldCheck, Zap, Handshake } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col w-full bg-background selection:bg-brand-100 selection:text-primary">
      
      {/* Hero Section */}
      <section className="border-b border-border bg-surface px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
            
            {/* Left Column: Conversational & Clear Proposition */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Tìm việc & Tuyển dụng Freelance chuẩn chất lượng
              </span>
              
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl sm:leading-[1.15]">
                Gặp đúng người giỏi, làm đúng việc cần.
              </h1>
              
              <p className="mt-5 text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
                Không còn cảnh nhận hàng chục hồ sơ ảo hay đề xuất rác. Tại NASH, chuyên gia làm bài kiểm tra thực tế để chứng minh tay nghề, hệ thống tự gợi ý 3 người phù hợp nhất để bạn chọn và làm việc ngay.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link 
                  href="/register?role=client" 
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors"
                >
                  Đăng dự án để tìm người làm
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="/register?role=freelancer" 
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface hover:bg-surface-subtle px-6 py-3 text-sm font-medium text-foreground transition-colors"
                >
                  Tham gia nhận việc
                </Link>
              </div>

              {/* Practical Matching Principles */}
              <div className="mt-10 pt-6 border-t border-border">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Cách NASH tìm người phù hợp cho bạn
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                  <span>Kỹ năng thực tế <strong>40%</strong></span>
                  <span className="text-border-strong">•</span>
                  <span>Đã kiểm tra tay nghề <strong>25%</strong></span>
                  <span className="text-border-strong">•</span>
                  <span>Kinh nghiệm dự án <strong>15%</strong></span>
                  <span className="text-border-strong">•</span>
                  <span>Ngân sách hợp lý <strong>10%</strong></span>
                  <span className="text-border-strong">•</span>
                  <span>Thời gian rảnh <strong>10%</strong></span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Matching Engine Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
                
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <span className="text-xs font-semibold text-primary">Dự án mẫu</span>
                    <h2 className="text-sm font-bold text-foreground mt-0.5">Xây dựng ứng dụng web quản lý bán hàng</h2>
                    <p className="text-xs text-text-muted mt-0.5">Ngân sách: 20.000.000đ – 35.000.000đ</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-primary border border-brand-200">
                    Gợi ý số 1
                  </span>
                </div>

                {/* Match Result Body */}
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-foreground">Nguyễn Hoàng Nam</div>
                      <div className="text-xs text-text-secondary">Chuyên gia Web & Backend • 4 năm kinh nghiệm</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-foreground font-mono">96/100</div>
                      <div className="text-2xs text-success font-medium">Rất phù hợp</div>
                    </div>
                  </div>

                  {/* Verified Skills Checklist */}
                  <div className="rounded-lg bg-surface-subtle p-3 space-y-2 border border-border">
                    <div className="text-2xs font-semibold uppercase tracking-wider text-text-muted">
                      Kết quả kiểm tra tay nghề
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-foreground font-medium">
                        <Check className="h-3.5 w-3.5 text-success" />
                        Lập trình C# .NET
                      </span>
                      <span className="font-mono text-text-muted">Đạt 88/100 điểm</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-foreground font-medium">
                        <Check className="h-3.5 w-3.5 text-success" />
                        Giao diện React & Next.js
                      </span>
                      <span className="font-mono text-text-muted">Đạt 94/100 điểm</span>
                    </div>
                  </div>

                  {/* Direct Handshake Status */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-text-muted">Hợp đồng:</span>
                    <span className="font-semibold text-foreground">Đã soạn sẵn • Ký trực tiếp</span>
                  </div>

                  <Link
                    href="/register?role=client"
                    className="block w-full text-center rounded-lg bg-foreground hover:bg-navy-800 text-white py-2.5 text-xs font-semibold transition-colors"
                  >
                    Xem hồ sơ & Mời làm việc
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Catalog of Assessments */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Bài kiểm tra tay nghề theo tiêu chuẩn
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Freelancer làm bài trực tiếp trên hệ thống để chứng minh khả năng thực tế, không cần nói suông.
              </p>
            </div>
            <Link 
              href="/dashboard/profile" 
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Xem danh mục bài thi
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="rounded-lg border border-border bg-surface p-4 hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Lập trình C# .NET</span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-surface-subtle text-text-muted border border-border">Cơ bản - Nâng cao</span>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Kiểm tra kiến thức xây dựng API, xử lý dữ liệu và bảo mật đăng nhập cho ứng dụng.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Thời gian: 45 phút</span>
                <span className="font-medium text-foreground">Điểm đạt: 80/100</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Lập trình React & TypeScript</span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-surface-subtle text-text-muted border border-border">Frontend</span>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Đánh giá kỹ năng dựng giao diện web mượt mà, kết nối dữ liệu và tối ưu tốc độ tải trang.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Thời gian: 30 phút</span>
                <span className="font-medium text-foreground">Điểm đạt: 70/100</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Cơ sở dữ liệu PostgreSQL</span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-surface-subtle text-text-muted border border-border">Backend & Data</span>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Kiểm tra khả năng viết câu lệnh truy vấn nhanh, thiết kế bảng dữ liệu và chống nghẽn hệ thống.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Thời gian: 40 phút</span>
                <span className="font-medium text-foreground">Điểm đạt: 75/100</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Next.js Web Hiện Đại</span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-surface-subtle text-text-muted border border-border">Fullstack Web</span>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Thao tác rendering server-side, chuẩn SEO Google và xây dựng giao diện tương tác cao.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Thời gian: 35 phút</span>
                <span className="font-medium text-foreground">Điểm đạt: 75/100</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Thiết kế API chuẩn quốc tế</span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-surface-subtle text-text-muted border border-border">Kiến trúc</span>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Cách phân quyền tài khoản, xử lý lỗi chuẩn và bảo vệ ứng dụng khi có hàng triệu người dùng.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Thời gian: 30 phút</span>
                <span className="font-medium text-foreground">Điểm đạt: 80/100</span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 hover:border-brand-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Tổ chức mã nguồn Clean Architecture</span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded bg-surface-subtle text-text-muted border border-border">Chất lượng Code</span>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary">
                Cách viết code gọn gàng, dễ bảo trì, dễ mở rộng tính năng và dễ bàn giao cho đội ngũ sau này.
              </p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Thời gian: 45 phút</span>
                <span className="font-medium text-foreground">Điểm đạt: 80/100</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Verified Specialists Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Gợi ý chuyên gia
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground">
                Những người giỏi đã vượt qua bài kiểm tra
              </h2>
              <p className="mt-1.5 text-sm text-text-secondary max-w-xl">
                Mỗi kỹ năng hiển thị dưới đây đều có điểm số thật qua bài thi. Bạn có thể gửi lời mời và trao đổi hợp đồng ngay hôm nay.
              </p>
            </div>
            <Link 
              href="/register?role=client" 
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              Xem thêm các chuyên gia khác
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Freelancer 1 */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-2xs hover:border-brand-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg bg-navy-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      TB
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Trần Quốc Bảo</h3>
                      <p className="text-xs text-text-muted">Kiến trúc sư hệ thống • 6 năm kinh nghiệm</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-success bg-success-bg px-2 py-0.5 rounded">
                    Đang rảnh
                  </span>
                </div>

                <p className="mt-4 text-xs text-text-secondary leading-relaxed line-clamp-2">
                  Chuyên thiết kế hệ thống phần mềm lớn, tối ưu cơ sở dữ liệu và bảo đảm ứng dụng chạy mượt mà không bị lỗi.
                </p>

                {/* Verified Skills */}
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
                    Kỹ năng đã kiểm tra
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      C# .NET (94đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      Clean Architecture (90đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      PostgreSQL (88đ)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-2xs text-text-muted block">Mức giá tham khảo</span>
                  <span className="text-sm font-bold text-foreground font-mono">650.000đ / giờ</span>
                </div>
                <Link
                  href="/register?role=client"
                  className="rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 transition-colors"
                >
                  Mời hợp tác
                </Link>
              </div>
            </div>

            {/* Freelancer 2 */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-2xs hover:border-brand-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg bg-navy-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      MT
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Nguyễn Minh Thư</h3>
                      <p className="text-xs text-text-muted">Chuyên gia Frontend • 5 năm kinh nghiệm</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-success bg-success-bg px-2 py-0.5 rounded">
                    Đang rảnh
                  </span>
                </div>

                <p className="mt-4 text-xs text-text-secondary leading-relaxed line-clamp-2">
                  Làm giao diện web đẹp, dễ dùng trên cả điện thoại và máy tính, dùng React và Next.js mới nhất.
                </p>

                {/* Verified Skills */}
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
                    Kỹ năng đã kiểm tra
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      ReactJS (96đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      Next.js & TS (92đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      REST API (86đ)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-2xs text-text-muted block">Mức giá tham khảo</span>
                  <span className="text-sm font-bold text-foreground font-mono">550.000đ / giờ</span>
                </div>
                <Link
                  href="/register?role=client"
                  className="rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 transition-colors"
                >
                  Mời hợp tác
                </Link>
              </div>
            </div>

            {/* Freelancer 3 */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-2xs hover:border-brand-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg bg-brand-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      ĐK
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Phạm Đăng Khoa</h3>
                      <p className="text-xs text-text-muted">Chuyên viên Dữ liệu & Backend • 4 năm kinh nghiệm</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-success bg-success-bg px-2 py-0.5 rounded">
                    Đang rảnh
                  </span>
                </div>

                <p className="mt-4 text-xs text-text-secondary leading-relaxed line-clamp-2">
                  Tăng tốc độ cơ sở dữ liệu, viết API chuẩn, giúp hệ thống chịu tải tốt và lưu trữ an toàn.
                </p>

                {/* Verified Skills */}
                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-text-muted block mb-2">
                    Kỹ năng đã kiểm tra
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      PostgreSQL (95đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      C# .NET (91đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-surface-subtle border border-border text-foreground font-medium">
                      <Check className="h-3 w-3 text-success" />
                      REST API (89đ)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-2xs text-text-muted block">Mức giá tham khảo</span>
                  <span className="text-sm font-bold text-foreground font-mono">500.000đ / giờ</span>
                </div>
                <Link
                  href="/register?role=client"
                  className="rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 transition-colors"
                >
                  Mời hợp tác
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-foreground">Cách thức hoạt động tại NASH</h2>
            <p className="mt-1 text-sm text-text-secondary">4 bước đơn giản, rõ ràng và an toàn cho cả hai bên</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-lg border border-border bg-surface">
              <div className="text-xs font-mono font-bold text-primary">BƯỚC 1</div>
              <h3 className="text-sm font-bold text-foreground mt-2">Kiểm tra tay nghề</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Người làm bài làm bài test trực tiếp. Đạt điểm chuẩn sẽ nhận ngay huy hiệu xác thực.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-surface">
              <div className="text-xs font-mono font-bold text-primary">BƯỚC 2</div>
              <h3 className="text-sm font-bold text-foreground mt-2">Gợi ý 3 người giỏi nhất</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Khi có dự án mới, hệ thống tự động tìm và gợi ý 3 ứng viên hợp nhất kèm lý do rõ ràng.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-surface">
              <div className="text-xs font-mono font-bold text-primary">BƯỚC 3</div>
              <h3 className="text-sm font-bold text-foreground mt-2">Trao đổi & Thống nhất</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Hai bên nhắn tin thương lượng giá, hạn chót và chốt hợp đồng ngay trên hệ thống.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-surface">
              <div className="text-xs font-mono font-bold text-primary">BƯỚC 4</div>
              <h3 className="text-sm font-bold text-foreground mt-2">Nghiệm thu từng phần</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Làm đến đâu nghiệm thu và thanh toán đến đó. Xong dự án cả hai bên đánh giá cho nhau.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Grounded Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Sẵn sàng bắt đầu công việc hôm nay?
          </h2>
          <p className="mt-3 text-sm text-text-secondary max-w-lg mx-auto">
            Dù bạn đang cần người làm dự án gấp hay muốn nhận việc xứng đáng với tay nghề, NASH luôn sẵn sàng đồng hành.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              href="/register?role=client" 
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary-hover px-6 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              Đăng dự án mới
            </Link>
            <Link 
              href="/register?role=freelancer" 
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-subtle px-6 py-2.5 text-sm font-medium text-foreground transition-colors"
            >
              Tạo hồ sơ nhận việc
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
