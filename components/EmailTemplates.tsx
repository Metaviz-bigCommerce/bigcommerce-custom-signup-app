'use client'

import React, { useState } from 'react';
import { Eye, Mail, Check, X, Send } from 'lucide-react';

type TemplateKey = 'signup' | 'approval' | 'rejection' | 'moreInfo';

type Templates = Record<TemplateKey, { subject: string; body: string }>;

const EmailTemplates: React.FC = () => {
  const [emailTemplates, setEmailTemplates] = useState<Templates>({
    signup: { subject: 'Welcome! Your signup request has been received', body: 'Hi {{name}},\n\nThank you for signing up. Your request is being reviewed.' },
    approval: { subject: 'Your account has been approved!', body: 'Hi {{name}},\n\nGreat news! Your account has been approved.' },
    rejection: { subject: 'Update on your signup request', body: 'Hi {{name}},\n\nWe regret to inform you that your signup request could not be approved at this time.' },
    moreInfo: { subject: 'Additional information needed', body: 'Hi {{name}},\n\nWe need some additional information to process your request.' }
  });
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('signup');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Email Templates</h2>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Select Template</h3>
          <div className="space-y-2">
            {[
              { key: 'signup', label: 'Signup Confirmation', icon: Send },
              { key: 'approval', label: 'Approval Email', icon: Check },
              { key: 'rejection', label: 'Rejection Email', icon: X },
              { key: 'moreInfo', label: 'Info Request', icon: Mail }
            ].map(template => (
              <button
                key={template.key}
                onClick={() => setSelectedTemplate(template.key as TemplateKey)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  selectedTemplate === (template.key as TemplateKey)
                    ? 'bg-blue-50 border-2 border-blue-400 text-blue-700'
                    : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
                }`}
              >
                <template.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{template.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-9 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Edit Template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Subject Line</label>
                <input
                  type="text"
                  value={emailTemplates[selectedTemplate].subject}
                  onChange={(e) => setEmailTemplates({
                    ...emailTemplates,
                    [selectedTemplate]: { ...emailTemplates[selectedTemplate], subject: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email Body</label>
                <textarea
                  value={emailTemplates[selectedTemplate].body}
                  onChange={(e) => setEmailTemplates({
                    ...emailTemplates,
                    [selectedTemplate]: { ...emailTemplates[selectedTemplate], body: e.target.value }
                  })}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent font-mono text-sm"
                  placeholder="Enter email content"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Variables</h4>
                <div className="flex flex-wrap gap-2">
                  {['{{name}}', '{{email}}', '{{date}}', '{{store_name}}'].map(variable => (
                    <code key={variable} className="px-3 py-1 bg-white border border-blue-300 rounded text-xs text-blue-700 font-mono">
                      {variable}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">Use these variables in your template. They will be replaced with actual values when emails are sent.</p>
              </div>

              <div className="flex gap-3">
                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview Email
                </button>
                <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                  Save Template
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 max-w-2xl">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Subject:</p>
                  <p className="text-base font-semibold text-gray-800">{emailTemplates[selectedTemplate].subject}</p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{emailTemplates[selectedTemplate].body}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplates;

