'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Users, Mail } from 'lucide-react';

const NavBar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded"></div>
              <span className="text-xl font-bold text-gray-900">SignupPro</span>
            </div>
            <div className="flex gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/builder"
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                  isActive('/builder')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                Form Builder
              </Link>
              <Link
                href="/requests"
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                  isActive('/requests')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4" />
                Requests
              </Link>
              <Link
                href="/emails"
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                  isActive('/emails')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email Templates
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Settings
            </button>
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

