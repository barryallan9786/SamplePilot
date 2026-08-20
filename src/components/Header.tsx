import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab, NotificationItem } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeCalculator: 'margin' | 'invitation';
  setActiveCalculator: (calc: 'margin' | 'invitation') => void;
  onOpenAbout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCalculator,
  setActiveCalculator,
  onOpenAbout,
  notifications,
  onMarkNotificationRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#E8442C] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setActiveCalculator('margin');
              setActiveTab('margin');
            }}
          >
            <span className="font-bold text-xl md:text-2xl tracking-tight text-white">
              SamplePilot
            </span>
          </div>

          {/* Primary Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6 h-16 ml-4">
            {/* Margin Calculator */}
            <button
              onClick={() => {
                setActiveCalculator('margin');
                setActiveTab('margin');
              }}
              className={`flex items-center gap-1.5 h-full font-bold text-sm tracking-wider uppercase transition-colors border-b-2 ${
                activeTab === 'margin'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/80 hover:text-white'
              }`}
            >
              Margin Calculator
            </button>

            {/* Invitation Calculator */}
            <button
              onClick={() => {
                setActiveCalculator('invitation');
                setActiveTab('invitation');
              }}
              className={`flex items-center gap-1.5 h-full font-bold text-sm tracking-wider uppercase transition-colors border-b-2 ${
                activeTab === 'invitation'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/80 hover:text-white'
              }`}
            >
              Invitation Calculator
            </button>

            {/* Resources */}
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-1.5 h-full font-bold text-sm tracking-wider uppercase transition-colors border-b-2 ${
                activeTab === 'resources'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/80 hover:text-white'
              }`}
            >
              Resources
            </button>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
              }}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-[#E8442C]"></span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-12 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 w-80 sm:w-88 z-50 p-4 animate-in fade-in duration-150">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#E8442C] text-lg">notifications</span>
                    Notifications
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">{unreadCount} unread</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto my-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-2.5 text-xs cursor-pointer rounded-lg hover:bg-slate-50 transition-colors my-1 ${
                          !n.read ? 'bg-orange-50/60 font-medium' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-600 leading-tight">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* About SamplePilot Button */}
          <button
            onClick={onOpenAbout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold rounded-lg transition-all shadow-xs active:scale-95"
            title="About SamplePilot"
          >
            <span className="material-symbols-outlined text-base">info</span>
            <span className="hidden sm:inline">About SamplePilot</span>
            <span className="sm:hidden">About</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-white/90 hover:text-white rounded-lg"
          >
            <span className="material-symbols-outlined text-2xl">
              {showMobileMenu ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-white/20 bg-[#C93A24] px-4 py-3 space-y-2 text-white">
          <button
            onClick={() => {
              setActiveCalculator('margin');
              setActiveTab('margin');
              setShowMobileMenu(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              activeTab === 'margin' ? 'bg-white/20 text-white' : 'text-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-lg">calculate</span>
            Margin Calculator
          </button>

          <button
            onClick={() => {
              setActiveCalculator('invitation');
              setActiveTab('invitation');
              setShowMobileMenu(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              activeTab === 'invitation' ? 'bg-white/20 text-white' : 'text-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-lg">mail</span>
            Invitation Calculator
          </button>

          <div className="border-t border-white/20 my-1"></div>

          <button
            onClick={() => {
              setActiveTab('resources');
              setShowMobileMenu(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              activeTab === 'resources' ? 'bg-white/20 text-white' : 'text-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-lg">menu_book</span>
            Resources
          </button>

          <button
            onClick={() => {
              onOpenAbout();
              setShowMobileMenu(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 bg-white/20 text-white"
          >
            <span className="material-symbols-outlined text-lg">info</span>
            About SamplePilot
          </button>
        </div>
      )}
    </header>
  );
};
