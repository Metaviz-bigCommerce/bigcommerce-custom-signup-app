import NavBar from '@/components/NavBar';
import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 space-y-6">
        <Skeleton className="h-8 w-56" />
        
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <Skeleton className="h-5 w-36 mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

          <div className="col-span-9 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-64 w-full" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-11 w-40" />
                  <Skeleton className="h-11 w-32" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <Skeleton className="h-6 w-80 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

