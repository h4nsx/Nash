import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/lib/auth/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Do not show Navbar/Footer on Auth, Admin, or Dashboard pages
  const isAuthPage = router.pathname.startsWith('/login') || router.pathname.startsWith('/register');
  const isAdminPage = router.pathname.startsWith('/admin');
  const isDashboardPage = router.pathname.startsWith('/dashboard');
  const hideLayout = isAuthPage || isAdminPage || isDashboardPage;

  return (
    <AuthProvider>
      <div className="font-sans min-h-screen flex flex-col bg-background text-foreground antialiased">
        {!hideLayout && <Navbar />}
        <main className="flex-1 w-full">
          <Component {...pageProps} />
        </main>
        {!hideLayout && <Footer />}
      </div>
    </AuthProvider>
  );
}
