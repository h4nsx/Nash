import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Globe, Layers, Users, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden w-full">
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-zinc-950">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/50 px-3 py-1 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Nền tảng NASH v1.0 đã trực tuyến
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-7xl dark:text-white">
            Thuê <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-amber-500">nhân tài xuất chúng</span>, <br className="hidden sm:block" /> 
            kiến tạo tương lai.
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed tracking-wide">
            Network, Ability, Skills, và Human. Một nền tảng marketplace cấp doanh nghiệp được thiết kế để kết nối liền mạch các doanh nghiệp hàng đầu với các chuyên gia độc lập đẳng cấp thông qua công cụ ghép nối thông minh và hệ thống thanh toán an toàn (escrow).
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              href="/register?role=client" 
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Thuê Chuyên Gia
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/register?role=freelancer" 
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white/50 px-8 py-4 text-base font-semibold text-zinc-900 backdrop-blur-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Tìm Việc
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 border-t border-zinc-200/60 pt-8 dark:border-zinc-800/60">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Được tin dùng bởi các tổ chức hàng đầu</p>
            <div className="mt-6 flex flex-wrap justify-center gap-8 opacity-60 grayscale transition-all hover:grayscale-0 dark:opacity-40 dark:hover:opacity-100">
              <div className="text-xl font-bold font-mono">ACME Corp</div>
              <div className="text-xl font-bold font-mono">Globex</div>
              <div className="text-xl font-bold font-mono">Initech</div>
              <div className="text-xl font-bold font-mono">Soylent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative bg-zinc-50 py-24 dark:bg-zinc-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Được thiết kế cho sự tin cậy tuyệt đối.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Chúng tôi xử lý thuật toán ghép nối phức tạp, hợp đồng và theo dõi tiến độ để bạn có thể hoàn toàn tập trung vào việc tạo ra những sản phẩm xuất sắc.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">Ghép Nối Thông Minh</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Thuật toán của chúng tôi cân nhắc các kỹ năng đã được xác thực, kinh nghiệm và ngân sách để tìm ra ứng viên phù hợp tuyệt đối một cách nhanh chóng.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Layers className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">Bảo Đảm Thanh Toán</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tiền được giữ an toàn theo từng giai đoạn. Khách hàng phê duyệt công việc trước khi tiền được giải ngân, đảm bảo minh bạch 100%.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-white">Đồng Bộ Thời Gian Thực</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Trải nghiệm độ trễ bằng 0 với SignalR WebSockets. Nhận thông báo tức thì khi hợp đồng được ký kết hoặc giai đoạn công việc được xem xét.
              </p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
