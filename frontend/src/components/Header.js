'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api';

export default function Header() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('sqrmt_user');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      fetchNotifications();
    }

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('sqrmt_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (e) { }
  };

  const markRead = async (id) => {
    const token = localStorage.getItem('sqrmt_token');
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) { }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('sqrmt_token');
    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { }
  };

  const handleLogout = () => {
    localStorage.removeItem('sqrmt_token');
    localStorage.removeItem('sqrmt_user');
    setUser(null);
    router.push('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-gradient-to-r from-[#003366] via-[#00508f] to-[#0077cc] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-3">
          {/* Left logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-white/10 border-2 border-white/30 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl italic">Q</span>
            </div>
          </div>

          {/* Center title */}
          <div className="text-center flex-1 px-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-wide">
              SSPL Quality Reliability Monitoring and Tracking
            </h1>
            <p className="text-yellow-300 text-sm italic font-medium mt-0.5">
              Solid State Physics Laboratory
            </p>
          </div>

          {/* Right: notifications + nav */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) fetchNotifications(); }}
                    className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    title="Notifications"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                      <div className="flex justify-between items-center px-4 py-3 bg-[#003366] text-white">
                        <span className="font-bold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-yellow-300 hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500 p-4 text-center">No notifications yet</p>
                        ) : notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                          >
                            <p className="text-sm text-gray-800">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                            {!n.read && <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">New</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={user.role === 'Admin' ? '/admin/dashboard' : '/member/dashboard'}
                  className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="w-16 h-16 bg-white/10 border-2 border-white/30 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/logo-right.png"
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
