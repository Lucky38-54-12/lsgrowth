'use client';

import { useState } from 'react';

export default function Header() {
  const [notifications, setNotifications] = useState(3);

  return (
    <div className="h-16 bg-dark border-b border-gray-800 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <span className="absolute right-3 top-2.5 text-gray-500">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative">
          <span className="text-2xl">🔔</span>
          {notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Lucky</p>
            <p className="text-gray-500">Owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
