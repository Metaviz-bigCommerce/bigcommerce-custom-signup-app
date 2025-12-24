'use client'

import React from 'react';
import { PanelRight, FilePlus, Info } from 'lucide-react';
import Sidebar from './Sidebar';
import LivePreview from './LivePreview';
import { FormField } from './types';

interface BuilderTabProps {
  formFields: FormField[];
  theme: any;
  selectedField: FormField | null;
  draggedFieldId: number | null;
  dragOverIndex: number | null;
  sidebarOpen: boolean;
  viewMode: 'desktop' | 'mobile';
  onSidebarToggle: (open: boolean) => void;
  onAddField: (type: any) => void;
  onAddAddressField: (role: 'country' | 'state') => void;
  onFieldClick: (field: FormField) => void;
  onDeleteField: (id: number) => void;
  onTogglePair: (fieldId: number) => void;
  onUnpairField: (fieldId: number) => void;
  onDragStart: (e: React.DragEvent, fieldId: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onOpenThemeEditor: () => void;
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  onCreateNewForm: () => void;
  hasSavedForms: boolean;
}

const BuilderTab: React.FC<BuilderTabProps> = ({
  formFields,
  theme,
  selectedField,
  draggedFieldId,
  dragOverIndex,
  sidebarOpen,
  viewMode,
  onSidebarToggle,
  onAddField,
  onAddAddressField,
  onFieldClick,
  onDeleteField,
  onTogglePair,
  onUnpairField,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onOpenThemeEditor,
  onViewModeChange,
  onCreateNewForm,
  hasSavedForms,
}) => {
  const isEmpty = formFields.length === 0;
  return (
    <div className="relative h-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className={`flex h-full transition-all duration-500 ease-in-out relative z-10 ${sidebarOpen && !isEmpty ? 'gap-6' : 'gap-0'}`}>
        {/* Enhanced floating toggle button when sidebar is closed and form has fields */}
        {!sidebarOpen && !isEmpty && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-40 animate-fadeIn">
            <button
              onClick={() => onSidebarToggle(true)}
              className="relative w-14 h-20 bg-gradient-to-br from-white via-white to-slate-50 border-r-2 border-t-2 border-b-2 border-slate-200 rounded-r-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 group hover:scale-105 hover:border-blue-400/50 backdrop-blur-md bg-white/98 hover:-translate-x-1"
              aria-label="Show sidebar"
              title="Show sidebar"
            >
              {/* Animated glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-600/0 group-hover:from-blue-500/10 group-hover:to-indigo-600/10 rounded-r-2xl blur-xl transition-all duration-300 -z-10" />
              
              {/* Animated icon container */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <PanelRight className="relative w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              
              {/* Decorative dot indicator with staggered animations */}
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-all duration-300 group-hover:scale-125" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-all duration-300 group-hover:scale-125" style={{ transitionDelay: '75ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-purple-500 transition-all duration-300 group-hover:scale-125" style={{ transitionDelay: '150ms' }} />
              </div>

              {/* Tooltip text (appears on hover) */}
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl z-50">
                Show Form Fields
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </span>
            </button>
          </div>
        )}

        {/* Sidebar - Only show when form has fields */}
        {!isEmpty && (
          <Sidebar
            isOpen={sidebarOpen}
            formFields={formFields}
            selectedField={selectedField}
            draggedFieldId={draggedFieldId}
            dragOverIndex={dragOverIndex}
            onClose={() => onSidebarToggle(false)}
            onAddField={onAddField}
            onAddAddressField={onAddAddressField}
            onFieldClick={onFieldClick}
            onDeleteField={onDeleteField}
            onTogglePair={onTogglePair}
            onUnpairField={onUnpairField}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            onOpenThemeEditor={onOpenThemeEditor}
          />
        )}

        {/* Enhanced Preview Area with beautiful container */}
        <div className="h-full overflow-y-auto transition-all duration-500 ease-in-out flex-1 min-w-0">
          <div className="relative h-full p-2">
            {/* Animated background gradient overlay */}
            <div className="absolute inset-2 bg-gradient-to-br from-blue-50/50 via-white/80 to-purple-50/50 rounded-2xl pointer-events-none transition-opacity duration-500" />
            
            {/* Subtle animated orbs in background for depth */}
            <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-purple-400/8 to-pink-400/8 rounded-full blur-3xl pointer-events-none" />
            
            {/* Content wrapper with enhanced styling */}
            <div className="relative h-full">
              {isEmpty ? (
                <EmptyStateView onCreateNewForm={onCreateNewForm} hasSavedForms={hasSavedForms} />
              ) : (
                <>
                  <LivePreview
                    formFields={formFields}
                    theme={theme}
                    viewMode={viewMode}
                    onViewModeChange={onViewModeChange}
                  />
                  {/* Info text about mandatory fields */}
                  <div className="mt-4 mx-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Note</p>
                      <p className="text-xs text-blue-700">
                        First Name, Last Name, Email, and Password are mandatory fields required by BigCommerce and cannot be deleted.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Decorative corner accents when sidebar is closed */}
            {!sidebarOpen && (
              <>
                <div className="absolute top-2 left-2 w-48 h-48 bg-gradient-to-br from-blue-500/6 to-indigo-500/6 rounded-br-2xl pointer-events-none transition-opacity duration-500" />
                <div className="absolute top-2 right-2 w-40 h-40 bg-gradient-to-bl from-purple-500/5 to-pink-500/5 rounded-bl-2xl pointer-events-none transition-opacity duration-500" />
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

// Empty State Component
const EmptyStateView: React.FC<{ onCreateNewForm: () => void; hasSavedForms: boolean }> = ({ onCreateNewForm, hasSavedForms }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden max-w-2xl w-full">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <FilePlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">No Form Selected</h3>
              <p className="text-xs text-slate-500">{hasSavedForms ? 'Create a new form or select an existing one' : 'Create a new form to get started'}</p>
            </div>
          </div>
        </div>
        
        {/* Empty State Content */}
        <div className="p-12 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <FilePlus className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {hasSavedForms ? 'Create a New Form' : 'Create Your First Form'}
            </h2>
            <p className="text-slate-600 mb-2">
              {hasSavedForms 
                ? 'Start building a new custom signup form with our intuitive form builder.'
                : 'Start building your custom signup form with our intuitive form builder.'
              }
            </p>
            {hasSavedForms && (
              <p className="text-sm text-slate-500 mt-2">
                You can also select an existing form to edit it.
              </p>
            )}
          </div>
          
          <button
            onClick={onCreateNewForm}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-200"
          >
            <FilePlus className="w-5 h-5" />
            Create New Form
          </button>
          
          {/* Info about mandatory fields */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-left max-w-lg mx-auto">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">Note</p>
              <p className="text-xs text-blue-700">
                First Name, Last Name, Email, and Password are required by BigCommerce and will be included automatically. These fields cannot be deleted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderTab;

