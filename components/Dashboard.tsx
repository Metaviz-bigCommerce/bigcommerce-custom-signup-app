'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Check, X, Users, Clock, TrendingUp, ArrowRight, Eye, Mail, Settings } from 'lucide-react';

type SignupRequest = {
  id: number;
  name: string;
  email: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

const Dashboard: React.FC = () => {
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', date: '2024-10-10', status: 'pending' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2024-10-11', status: 'approved' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', date: '2024-10-12', status: 'pending' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', date: '2024-10-13', status: 'rejected' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', date: '2024-10-14', status: 'pending' },
  ]);
  const [selectedRequest, setSelectedRequest] = useState<SignupRequest | null>(null);

  const updateRequestStatus = (id: number, status: SignupRequest['status']) => {
    setSignupRequests(signupRequests.map(r => r.id === id ? { ...r, status } : r));
    setSelectedRequest(null);
  };

  const stats = {
    pending: signupRequests.filter(r => r.status === 'pending').length,
    approved: signupRequests.filter(r => r.status === 'approved').length,
    rejected: signupRequests.filter(r => r.status === 'rejected').length,
    total: signupRequests.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here is what is happening with your signups.</p>
        </div>
        <Link 
          href="/builder"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Form
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600 font-medium">Total Signups</div>
        </div>

        <div className="bg-white p-6 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-amber-100 rounded flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pending}</div>
          <div className="text-sm text-gray-600 font-medium">Pending Review</div>
        </div>

        <div className="bg-white p-6 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.approved}</div>
          <div className="text-sm text-gray-600 font-medium">Approved</div>
        </div>

        <div className="bg-white p-6 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.rejected}</div>
          <div className="text-sm text-gray-600 font-medium">Rejected</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link 
            href="/builder"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-all text-left group"
          >
            <Settings className="w-8 h-8 text-blue-600 mb-3" />
            <div className="font-semibold text-gray-900 mb-1">Form Builder</div>
            <div className="text-sm text-gray-600">Create and customize forms</div>
          </Link>

          <Link 
            href="/requests"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-all text-left group"
          >
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <div className="font-semibold text-gray-900 mb-1">View Requests</div>
            <div className="text-sm text-gray-600">Manage signup requests</div>
          </Link>

          <Link 
            href="/emails"
            className="p-4 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-all text-left group"
          >
            <Mail className="w-8 h-8 text-blue-600 mb-3" />
            <div className="font-semibold text-gray-900 mb-1">Email Templates</div>
            <div className="text-sm text-gray-600">Customize notifications</div>
          </Link>

          <div className="p-4 bg-gray-50 rounded border border-gray-200 text-left">
            <Eye className="w-8 h-8 text-blue-600 mb-3" />
            <div className="font-semibold text-gray-900 mb-1">Preview Form</div>
            <div className="text-sm text-gray-600">See how it looks</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Signup Requests</h2>
          <Link 
            href="/requests"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {signupRequests.slice(0, 5).map(request => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedRequest(request)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Request Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-base text-gray-800">{selectedRequest.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-base text-gray-800">{selectedRequest.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Submission Date</label>
                <p className="text-base text-gray-800">{selectedRequest.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedRequest.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  selectedRequest.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                Approve
              </button>
              <button
                onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                className="flex-1 bg-rose-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-rose-600 flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-5 h-5" />
                Reject
              </button>
              <button
                onClick={() => updateRequestStatus(selectedRequest.id, 'pending')}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Request Info
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
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

export default Dashboard;

