'use client'

import NavBar from '@/components/NavBar';
import EmailTemplates from '@/components/EmailTemplates';
import EmailConfig from '@/components/EmailConfig';
import CooldownConfig from '@/components/CooldownConfig';
import { Tabs } from '@/components/common/tabs';
import { Settings, FileText, Clock } from 'lucide-react';

export default function EmailsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs
          defaultTab={1}
          tabs={[
            { id: 1, label: 'Templates', icon: FileText, content: <EmailTemplates /> },
            { id: 2, label: 'Email Settings', icon: Settings, content: <EmailConfig /> },
            { id: 3, label: 'Cooldown Period', icon: Clock, content: <CooldownConfig /> },
          ]}
        />
      </main>
    </div>
  );
}