'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', icon: '📊', href: '/' },
  { name: 'Calls', icon: '📞', href: '/calls' },
  { name: 'Pipeline', icon: '📈', href: '/pipeline' },
  { name: 'Emails', icon: '📧', href: '/emails' },
  { name: 'Analytics', icon: '🔍', href: '/analytics' },
  { name: 'Reports', icon: '📋', href: '/reports' },
  { name: 'Settings', icon: '⚙️', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-dark border-r border-gray-800 transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <div className={`text-center ${collapsed ? 'text-sm' : ''}`}>
          <p className="text-2xl font-bold font-display">LS</p>
          {!collapsed && <p className="text-xs text-gray-500">Growth</p>}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white'
              }`}
              title={collapsed ? item.name : ''}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </div>
  );
}
