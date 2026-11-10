import type { AppProps } from 'next/app';
import { Geist, Geist_Mono } from 'next/font/google';
import { useRouter } from 'next/router';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/lib/auth/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Do not show Navbar/Footer on Auth, Admin, or Dashboard pages
  const isAuthPage = router.pathname.startsWith('/login') || router.pathname.startsWith('/register');
  const isAdminPage = router.pathname.startsWith('/admin');
  const isDashboardPage = router.pathname.startsWith('/dashboard');
  const hideLayout = isAuthPage || isAdminPage || isDashboardPage;

  return (
    <AuthProvider>
      <div className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col bg-background text-foreground antialiased`}>
        {!hideLayout && <Navbar />}
        <main className="flex-1 w-full">
          <Component {...pageProps} />
        </main>
        {!hideLayout && <Footer />}
      </div>
    </AuthProvider>
  );
}
