import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Bell, Search, Check, ExternalLink, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NotificationItem {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'mock-1',
      type: 'Match',
      content: 'Khách hàng vừa gửi lời mời hợp tác cho dự án "Xây dựng cổng thanh toán trực tuyến".',
      isRead: false,
      createdAt: '2026-11-10T21:00:00.000Z',
    },
    {
      id: 'mock-2',
      type: 'Milestone',
      content: 'Mốc 1 "Thiết kế kiến trúc hệ thống" đã được khách hàng nghiệm thu thành công.',
      isRead: false,
      createdAt: '2026-11-10T19:00:00.000Z',
    },
    {
      id: 'mock-3',
      type: 'System',
      content: 'Chúc mừng! Bạn đã vượt qua bài thi kiểm tra kỹ năng .NET Backend (Đạt 88/100 điểm).',
      isRead: true,
      createdAt: '2026-11-09T21:00:00.000Z',
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (user?.role === 'Client') {
      // Direct client to projects or freelancer search
      router.push(`/dashboard/client/projects?q=${encodeURIComponent(query)}`);
    } else {
      // Freelancer searches available projects or contracts
      router.push(`/dashboard/projects?q=${encodeURIComponent(query)}`);
    }
  };

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-8 relative z-20">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-text-secondary hover:bg-surface-subtle hover:text-foreground md:hidden cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhanh dự án, hợp đồng, kỹ năng..."
            className="w-full rounded-lg border border-border bg-surface-subtle py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-2xs"
          />
        </form>
      </div>

      {/* Topbar Right Utilities */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Thông báo"
            className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-surface shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">Hộp thông báo</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-2xs font-bold text-primary">
                      {unreadCount} chưa đọc
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-2xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-text-muted">
                    Không có thông báo mới nào
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 transition-colors flex items-start gap-3 hover:bg-surface-subtle ${
                        n.isRead ? 'bg-surface' : 'bg-primary-soft/30'
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <p className={`text-xs leading-relaxed ${n.isRead ? 'text-text-secondary' : 'font-semibold text-foreground'}`}>
                          {n.content}
                        </p>
                        <span className="text-2xs text-text-muted block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Hôm nay
                        </span>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          title="Đánh dấu đã đọc"
                          className="text-text-muted hover:text-primary p-1 rounded hover:bg-surface-subtle shrink-0"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-border text-center bg-surface-subtle/40 rounded-b-xl">
                <Link
                  href="/dashboard/matches"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Xem tất cả lời mời & việc làm <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-border" />

        {/* User Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white shadow-2xs">
            {user?.lastName?.[0] || 'U'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-foreground">
              {user?.lastName} {user?.firstName}
            </span>
            <span className="text-2xs text-text-muted font-medium">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
