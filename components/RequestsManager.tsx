'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useSession } from '@/context/session';

type RequestItem = {
  id: string;
  submittedAt?: { seconds?: number; nanoseconds?: number } | string;
  status: 'pending' | 'approved' | 'rejected';
  data: Record<string, any>;
};

const RequestsManager: React.FC = () => {
  const { context } = useSession();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | 'pending' | 'approved' | 'rejected'>('');
  const [selected, setSelected] = useState<RequestItem | null>(null);
  const pageSize = 10;

  const load = async (cursor?: string | null, replace = false) => {
    if (!context) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('pageSize', String(pageSize));
      if (cursor) params.set('cursor', cursor);
      if (statusFilter) params.set('status', statusFilter);
      params.set('context', context);
      const res = await fetch(`/api/signup-requests?` + params.toString());
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setItems(replace ? json.items : [...items, ...json.items]);
      setNextCursor(json.nextCursor || null);
    } catch (e) {
      // noop simple UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load and when filter changes
    setItems([]);
    setNextCursor(null);
    load(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, context]);

  const approve = async (id: string) => {
    if (!context) return;
    const res = await fetch(`/api/signup-requests?id=${encodeURIComponent(id)}&context=${encodeURIComponent(context)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (res.ok) {
      setItems(items.map(it => it.id === id ? { ...it, status: 'approved' } : it));
      setSelected(null);
    }
  };
  const reject = async (id: string) => {
    if (!context) return;
    const res = await fetch(`/api/signup-requests?id=${encodeURIComponent(id)}&context=${encodeURIComponent(context)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
    if (res.ok) {
      setItems(items.map(it => it.id === id ? { ...it, status: 'rejected' } : it));
      setSelected(null);
    }
  };

  const formatDate = (ts?: any) => {
    if (!ts) return '';
    if (typeof ts === 'string') return new Date(ts).toLocaleString();
    if (typeof ts?.seconds === 'number') return new Date(ts.seconds * 1000).toLocaleString();
    return '';
    };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Signup Requests</h2>
        <div className="flex gap-3">
          <button onClick={() => setStatusFilter('')} className={`px-4 py-2 text-sm font-medium rounded-lg border ${statusFilter===''?'bg-gray-900 text-white border-gray-900':'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
            All
          </button>
          <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 text-sm font-medium rounded-lg border ${statusFilter==='pending'?'bg-amber-600 text-white border-amber-600':'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}>
            Pending
          </button>
          <button onClick={() => setStatusFilter('approved')} className={`px-4 py-2 text-sm font-medium rounded-lg border ${statusFilter==='approved'?'bg-emerald-600 text-white border-emerald-600':'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
            Approved
          </button>
          <button onClick={() => setStatusFilter('rejected')} className={`px-4 py-2 text-sm font-medium rounded-lg border ${statusFilter==='rejected'?'bg-rose-600 text-white border-rose-600':'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>
            Rejected
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Summary</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
        </table>
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {items.map(request => {
                const firstKey = Object.keys(request.data || {})[0];
                const summary = firstKey ? `${firstKey}: ${String(request.data[firstKey])}` : 'Submission';
                return (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{summary}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(request.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelected(request)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!items.length && !loading && (
                <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={4}>No requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">{items.length} loaded</div>
          <button
            onClick={() => load(nextCursor || undefined)}
            disabled={loading || !nextCursor}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${nextCursor ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            {loading ? 'Loading…' : (nextCursor ? 'Load More' : 'No More')}
          </button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Request Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selected.data || {}).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-gray-500 mb-1">{k}</div>
                    <div className="text-sm text-gray-800 break-words">{String(v)}</div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Submitted</label>
                <p className="text-base text-gray-800">{formatDate(selected.submittedAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selected.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  selected.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => approve(selected.id)}
                className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                Approve
              </button>
              <button
                onClick={() => reject(selected.id)}
                className="flex-1 bg-rose-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-rose-600 flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-5 h-5" />
                Reject
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsManager;

