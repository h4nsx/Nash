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
  
  // Do not show Navbar/Footer on Auth or Admin pages
  const isAuthPage = router.pathname.startsWith('/login') || router.pathname.startsWith('/register');
  const isAdminPage = router.pathname.startsWith('/admin');
  const hideLayout = isAuthPage || isAdminPage;

  return (
    <AuthProvider>
      <div className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased`}>
        {!hideLayout && <Navbar />}
        <main className="flex-1 w-full">
          <Component {...pageProps} />
        </main>
        {!hideLayout && <Footer />}
      </div>
    </AuthProvider>
  );
}
