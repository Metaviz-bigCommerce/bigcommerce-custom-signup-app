'use client'

import React, { useState } from 'react';
import { Check, X, Mail } from 'lucide-react';

type SignupRequest = {
  id: number;
  name: string;
  email: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

const RequestsManager: React.FC = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Signup Requests</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            All
          </button>
          <button className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100">
            Pending
          </button>
          <button className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100">
            Approved
          </button>
          <button className="px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100">
            Rejected
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
        </table>
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {signupRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{request.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{request.date}</td>
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
                      onClick={() => setSelectedRequest(request)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View Details
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

export default RequestsManager;

