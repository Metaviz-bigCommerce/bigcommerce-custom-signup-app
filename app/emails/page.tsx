import NavBar from '@/components/NavBar';
import EmailTemplates from '@/components/EmailTemplates';

export default function EmailsPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-50">
        <EmailTemplates />
      </main>
    </div>
  );
}

