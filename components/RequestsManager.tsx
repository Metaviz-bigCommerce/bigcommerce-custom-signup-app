'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, Mail, Search, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { useSession } from '@/context/session';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

type RequestItem = {
  id: string;
  submittedAt?: { seconds?: number; nanoseconds?: number } | string;
  status: 'pending' | 'approved' | 'rejected';
  data: Record<string, any>;
  email?: string | null;
  files?: Array<{ name: string; url: string; contentType?: string; size?: number }>;
};

const RequestsManager: React.FC = () => {
  const { context } = useSession();
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState<RequestItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | 'pending' | 'approved' | 'rejected'>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selected, setSelected] = useState<RequestItem | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [detailsSearch, setDetailsSearch] = useState('');
  const pageSize = 10;

  // Approval dialog state
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [customerGroups, setCustomerGroups] = useState<Array<any>>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [approving, setApproving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [requestInfoText, setRequestInfoText] = useState('');
  const [requestInfoTargetId, setRequestInfoTargetId] = useState<string | null>(null);
  const [sendingInfoRequest, setSendingInfoRequest] = useState(false);
  const toast = useToast();

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
      
      // Handle new standardized response format
      const responseData = json.error === false && json.data ? json.data : json;
      const items = responseData.items || [];
      const nextCursor = responseData.nextCursor || null;
      
      const newItems = replace ? items : [...allItems, ...items];
      setAllItems(newItems);
      setNextCursor(nextCursor);
    } catch (e) {
      // noop simple UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load and when filter changes
    setAllItems([]);
    setNextCursor(null);
    load(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, context]);

  const openApproveDialog = async (id: string) => {
    if (!context) return;
    setApproveTargetId(id);
    setShowApproveDialog(true);
    setSelectedGroupId(null);
    setGroupsLoading(true);
    try {
      const res = await fetch(`/api/customer-groups?context=${encodeURIComponent(context)}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setCustomerGroups(Array.isArray(json?.groups) ? json.groups : []);
    } catch {
      setCustomerGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const approve = async () => {
    if (!context || !approveTargetId) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/signup-requests/approve?context=${encodeURIComponent(context)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approveTargetId, customer_group_id: selectedGroupId || undefined }),
      });
      if (!res.ok) {
        const txt = await res.text();
        toast.showError(txt || 'Failed to approve and create customer');
        return;
      }
      setAllItems(allItems.map(it => it.id === approveTargetId ? { ...it, status: 'approved' } : it));
      if (selected && selected.id === approveTargetId) {
        setSelected({ ...selected, status: 'approved' });
      }
      setShowApproveDialog(false);
      setApproveTargetId(null);
      toast.showSuccess('Request approved and customer created successfully.');
    } finally {
      setApproving(false);
    }
  };
  const updateStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!context) return;
    try {
      const res = await fetch(`/api/signup-requests?id=${encodeURIComponent(id)}&context=${encodeURIComponent(context)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAllItems(allItems.map(it => it.id === id ? { ...it, status: newStatus } : it));
        if (selected && selected.id === id) {
          setSelected({ ...selected, status: newStatus });
        }
        toast.showSuccess(`Request status updated to ${newStatus}.`);
      } else {
        const errorText = await res.text();
        toast.showError('Failed to update status: ' + errorText);
      }
    } catch (error: unknown) {
      toast.showError('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const reject = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Request',
      message: 'Are you sure you want to reject this request? The user will be notified via email if email is configured.',
      onConfirm: () => {
        updateStatus(id, 'rejected');
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };

  const revertToPending = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revert to Pending',
      message: 'This will change the request status back to pending. Are you sure?',
      onConfirm: () => {
        updateStatus(id, 'pending');
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      }
    });
  };
  const openRequestInfoModal = (id: string) => {
    setRequestInfoTargetId(id);
    setRequestInfoText('');
    setShowRequestInfoModal(true);
  };

  const requestInfo = async () => {
    if (!context || !requestInfoTargetId || !requestInfoText.trim()) {
      toast.showWarning('Please enter the information you need from the user.');
      return;
    }
    setSendingInfoRequest(true);
    try {
      const res = await fetch(`/api/signup-requests/info-request?id=${encodeURIComponent(requestInfoTargetId)}&context=${encodeURIComponent(context)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ required_information: requestInfoText.trim() }),
      });
      if (res.ok) {
        toast.showSuccess('Info request email sent (if email configured).');
        setShowRequestInfoModal(false);
        setRequestInfoText('');
        setRequestInfoTargetId(null);
      } else {
        const errorText = await res.text();
        toast.showError('Failed to send info request: ' + errorText);
      }
    } catch (error: unknown) {
      toast.showError('Failed to send info request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSendingInfoRequest(false);
    }
  };

  const formatDate = (ts?: any) => {
    if (!ts) return '';
    if (typeof ts === 'string') return new Date(ts).toLocaleString();
    if (typeof ts?.seconds === 'number') return new Date(ts.seconds * 1000).toLocaleString();
    return '';
    };
  const isImage = (f?: { url?: string; contentType?: string }) => {
    const t = (f?.contentType || '').toLowerCase();
    if (t.startsWith('image/')) return true;
    const u = (f?.url || '').toLowerCase();
    return /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(u);
  };
  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };
  const basename = (v: unknown) => {
    const s = String(v ?? '');
    if (!s) return s;
    // If looks like URL or path, reduce to filename
    if (s.includes('/') || s.includes('\\')) {
      const parts = s.split(/[/\\]/);
      return parts[parts.length - 1] || s;
    }
    return s;
  };

  const extractName = (data: Record<string, any>): string => {
    const entries = Object.entries(data || {});
    const candidates = ['name', 'full_name', 'full name', 'first_name', 'first name'];
    for (const key of candidates) {
      const found = entries.find(([k]) => k.toLowerCase() === key);
      if (found) return String(found[1] ?? '');
    }
    const fuzzy = entries.find(([k]) => /name/i.test(k));
    if (fuzzy) return String(fuzzy[1] ?? '');
    return '';
  };

  const extractNameForFilter = (data: Record<string, any>): string => {
    const entries = Object.entries(data || {});
    const candidates = ['name', 'full_name', 'full name', 'first_name', 'first name'];
    for (const key of candidates) {
      const found = entries.find(([k]) => k.toLowerCase() === key);
      if (found) return String(found[1] ?? '').toLowerCase();
    }
    const fuzzy = entries.find(([k]) => /name/i.test(k));
    if (fuzzy) return String(fuzzy[1] ?? '').toLowerCase();
    return '';
  };

  const extractEmail = (item: RequestItem): string => {
    if (item.email) return item.email;
    const entries = Object.entries(item.data || {});
    const candidates = ['email', 'e-mail', 'email_address', 'email address'];
    for (const key of candidates) {
      const found = entries.find(([k]) => k.toLowerCase() === key);
      if (found) return String(found[1] ?? '');
    }
    const fuzzy = entries.find(([k]) => /email/i.test(k));
    if (fuzzy) return String(fuzzy[1] ?? '');
    return '';
  };

  const extractEmailForFilter = (item: RequestItem): string => {
    if (item.email) return item.email.toLowerCase();
    const entries = Object.entries(item.data || {});
    const candidates = ['email', 'e-mail', 'email_address', 'email address'];
    for (const key of candidates) {
      const found = entries.find(([k]) => k.toLowerCase() === key);
      if (found) return String(found[1] ?? '').toLowerCase();
    }
    const fuzzy = entries.find(([k]) => /email/i.test(k));
    if (fuzzy) return String(fuzzy[1] ?? '').toLowerCase();
    return '';
  };

  // Filter items based on search criteria
  const filteredItems = useMemo(() => {
    if (!allItems || !Array.isArray(allItems)) return [];
    let filtered = allItems;
    
    if (searchFilter.trim()) {
      const searchLower = searchFilter.toLowerCase();
      filtered = filtered.filter(item => {
        const name = extractNameForFilter(item.data);
        const email = extractEmailForFilter(item);
        return name.includes(searchLower) || email.includes(searchLower);
      });
    }
    
    return filtered;
  }, [allItems, searchFilter]);
  const remove = async (id: string) => {
    if (!context) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Request',
      message: 'Are you sure you want to delete this request? This action cannot be undone.',
      onConfirm: async () => {
        await performDelete(id);
      }
    });
  };

  const performDelete = async (id: string) => {
    if (!context) return;
    try {
      const res = await fetch(`/api/signup-requests?id=${encodeURIComponent(id)}&context=${encodeURIComponent(context)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelected(null);
        // Reload first page to reflect deletion quickly
        setAllItems([]);
        setNextCursor(null);
        await load(null, true);
        toast.showSuccess('Request deleted successfully.');
      } else {
        const errorText = await res.text();
        toast.showError('Failed to delete request: ' + errorText);
      }
    } catch (error: unknown) {
      toast.showError('Failed to delete request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Signup Requests</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and review all signup submissions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-500 self-center mr-1">Status:</span>
          <button 
            onClick={() => setStatusFilter('')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              statusFilter === '' 
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setStatusFilter('pending')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              statusFilter === 'pending' 
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setStatusFilter('approved')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              statusFilter === 'approved' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
            }`}
          >
            Approved
          </button>
          <button 
            onClick={() => setStatusFilter('rejected')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              statusFilter === 'rejected' 
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-fit">
            <Search className="w-4 h-4" />
            <span className="font-medium">Search:</span>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchFilter && (
            <div className="text-xs text-gray-600 whitespace-nowrap">
              <span className="font-semibold text-gray-900">{filteredItems.length}</span> of <span className="font-semibold text-gray-900">{allItems.length}</span> results
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map(request => {
                const name = extractName(request.data);
                const email = extractEmail(request);
                return (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(request.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${
                        request.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        request.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelected(request)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filteredItems.length && !loading && (
                <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                  {allItems.length === 0 ? 'No requests found.' : 'No requests match your filters.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {filteredItems.length} {filteredItems.length === 1 ? 'request' : 'requests'} shown
            {filteredItems.length !== allItems.length && ` (${allItems.length} total loaded)`}
          </div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                    <p className="text-xs text-gray-500 mt-0.5">ID: <span className="font-mono">{selected.id}</span></p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border ${
                    selected.status === 'pending' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    selected.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selected.status === 'pending' && <AlertCircle className="w-3.5 h-3.5 text-amber-700" />}
                    {selected.status === 'approved' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    {selected.status === 'rejected' && <X className="w-3.5 h-3.5 text-rose-700" />}
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </span>
                </div>
                <button 
                  onClick={() => setSelected(null)} 
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">Submitted</div>
                  <div className="text-sm font-medium text-gray-800">{formatDate(selected.submittedAt)}</div>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">Search fields</div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <input
                        value={detailsSearch}
                        onChange={(e) => setDetailsSearch(e.target.value)}
                        placeholder="Filter by field or value…"
                        className="w-[240px] px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <button
                        onClick={() => setDetailsExpanded((s) => !s)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                      >
                        {detailsExpanded ? 'Collapse' : 'Expand all'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100">
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <div className="text-sm font-semibold text-gray-700">Submitted Fields</div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(selected.data || {})
                      .filter(([k, v]) => {
                        if (!detailsSearch.trim()) return true;
                        const s = detailsSearch.toLowerCase();
                        return (k.toLowerCase().includes(s) || String(v ?? '').toLowerCase().includes(s));
                      })
                      .slice(0, detailsExpanded ? undefined : 12)
                      .map(([k, v]) => (
                        <div key={k} className="group rounded-lg border border-gray-100 hover:border-blue-200 transition-colors p-3 overflow-hidden">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-[11px] uppercase tracking-wide text-gray-500">{k}</div>
                              <div className="text-sm text-gray-900 break-words whitespace-pre-wrap break-all">{basename(v) || '—'}</div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(String(v ?? ''))}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600"
                              title="Copy value"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  {!detailsExpanded && Object.keys(selected.data || {}).length > 12 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setDetailsExpanded(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Show all {Object.keys(selected.data || {}).length} fields
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selected.files?.length ? (
                <div className="mt-5 rounded-xl border border-gray-100">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <div className="text-sm font-semibold text-gray-700">Files ({selected.files.length})</div>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selected.files.map((f, idx) => (
                      <a key={idx} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                          {isImage(f) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt={f.name} src={f.url} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-500 text-xs">FILE</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm text-blue-700 underline truncate">{f.name}</div>
                          <div className="text-xs text-gray-500">{f.size ? `${Math.round((f.size / 1024) * 10) / 10} KB` : ''}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0">
              {/* Status-based action buttons */}
              <div className="flex flex-col gap-3">
                {/* Primary Actions - Status-dependent */}
                <div className="flex flex-wrap gap-2">
                  {/* Show status badge */}
                  <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md border flex-1 min-w-[140px] ${
                    selected.status === 'pending' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    selected.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selected.status === 'pending' && <AlertCircle className="w-4 h-4 text-amber-700" />}
                    {selected.status === 'approved' && <Check className="w-4 h-4 text-emerald-700" />}
                    {selected.status === 'rejected' && <X className="w-4 h-4 text-rose-700" />}
                    <span className={`font-medium text-sm ${
                      selected.status === 'pending' ? 'text-amber-700' :
                      selected.status === 'approved' ? 'text-emerald-700' :
                      'text-rose-700'
                    }`}>
                      {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                    </span>
                  </div>

                  {/* Action buttons based on status */}
                  {selected.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openApproveDialog(selected.id)}
                        className="flex-1 min-w-[140px] bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => reject(selected.id)}
                        className="flex-1 min-w-[140px] bg-white text-rose-700 border-2 border-rose-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-50 hover:border-rose-400 active:bg-rose-100 transition-colors shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  
                  {selected.status === 'approved' && (
                    <>
                      <button
                        onClick={() => reject(selected.id)}
                        className="flex-1 min-w-[140px] bg-white text-rose-700 border-2 border-rose-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-rose-50 hover:border-rose-400 active:bg-rose-100 transition-colors shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => revertToPending(selected.id)}
                        className="flex-1 min-w-[140px] bg-white text-slate-700 border-2 border-slate-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-colors shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Revert to Pending</span>
                      </button>
                    </>
                  )}
                  
                  {selected.status === 'rejected' && (
                    <>
                      <button
                        onClick={() => openApproveDialog(selected.id)}
                        className="flex-1 min-w-[140px] bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => revertToPending(selected.id)}
                        className="flex-1 min-w-[140px] bg-white text-slate-700 border-2 border-slate-300 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-colors shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Revert to Pending</span>
                      </button>
                    </>
                  )}
                </div>
                
                {/* Secondary Actions - Always available */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => openRequestInfoModal(selected.id)}
                    className="flex-1 min-w-[140px] bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Request Info</span>
                  </button>
                  <button
                    onClick={() => remove(selected.id)}
                    className="px-5 py-2.5 text-rose-700 bg-white border border-rose-300 rounded-lg text-sm font-semibold hover:bg-rose-50 hover:border-rose-400 active:bg-rose-100 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="text-lg font-bold text-gray-900">Approve request</div>
              <div className="text-sm text-gray-600 mt-1">Create a BigCommerce customer. Optionally assign a customer group.</div>
            </div>
            <div className="px-6 py-5">
              {groupsLoading ? (
                <div className="text-sm text-gray-600">Loading customer groups…</div>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-800 mb-2">Customer group</div>
                  <div className="space-y-2 max-h-64 overflow-auto border border-gray-200 rounded-md p-3">
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="radio"
                        name="customer_group"
                        checked={selectedGroupId === null}
                        onChange={() => setSelectedGroupId(null)}
                      />
                      <span>Do not assign a group</span>
                    </label>
                    {customerGroups.map((g: any) => (
                      <label key={g?.id} className="flex items-center gap-2 text-sm text-gray-800">
                        <input
                          type="radio"
                          name="customer_group"
                          checked={selectedGroupId === Number(g?.id)}
                          onChange={() => setSelectedGroupId(Number(g?.id))}
                        />
                        <span className="flex-1">
                          <span className="font-medium text-gray-900">{g?.name || `Group #${g?.id}`}</span>
                          {g?.is_default ? <span className="ml-2 text-xs text-gray-500">(default)</span> : null}
                        </span>
                      </label>
                    ))}
                    {!customerGroups.length && (
                      <div className="text-sm text-gray-500">No customer groups found.</div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => { if (!approving) { setShowApproveDialog(false); setApproveTargetId(null); } }}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                disabled={approving}
              >
                Cancel
              </button>
              <button
                onClick={() => approve()}
                disabled={approving}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {approving ? 'Approving…' : 'Approve and Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
      />

      {/* Request Info Modal */}
      {showRequestInfoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="text-lg font-bold text-gray-900">Request Information from User</div>
              <div className="text-sm text-gray-600 mt-1">Enter the information you need from the user. An email will be sent if email is configured.</div>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Required Information
              </label>
              <textarea
                value={requestInfoText}
                onChange={(e) => setRequestInfoText(e.target.value)}
                placeholder="e.g., Please provide additional documentation for verification..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                rows={4}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowRequestInfoModal(false);
                  setRequestInfoText('');
                  setRequestInfoTargetId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={sendingInfoRequest}
              >
                Cancel
              </button>
              <button
                onClick={requestInfo}
                disabled={sendingInfoRequest || !requestInfoText.trim()}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {sendingInfoRequest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsManager;

