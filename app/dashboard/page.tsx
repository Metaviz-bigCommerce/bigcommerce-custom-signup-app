import NavBar from '@/components/NavBar';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-50">
        <Dashboard />
      </main>
    </div>
  );
}

