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
    <div className="relative h-full w-full">
      {/* Background decorative elements - Enhanced */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className={`flex flex-col lg:flex-row h-full transition-all duration-500 ease-in-out relative z-10 ${sidebarOpen && !isEmpty ? 'lg:gap-4 xl:gap-6' : 'gap-0'}`}>
        {/* Enhanced floating toggle button when sidebar is closed and form has fields */}
        {!sidebarOpen && !isEmpty && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-40 animate-fadeIn hidden lg:block">
            <button
              onClick={() => onSidebarToggle(true)}
              className="relative w-12 h-16 lg:w-14 lg:h-20 bg-gradient-to-br from-white via-white to-slate-50 border-r-2 border-t-2 border-b-2 border-slate-200 rounded-r-xl lg:rounded-r-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 group hover:scale-105 hover:border-blue-400/50 backdrop-blur-md bg-white/98 hover:-translate-x-1 cursor-pointer"
              aria-label="Show sidebar"
              title="Show sidebar"
            >
              {/* Animated glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-600/0 group-hover:from-blue-500/10 group-hover:to-indigo-600/10 rounded-r-xl lg:rounded-r-2xl blur-xl transition-all duration-300 -z-10" />
              
              {/* Animated icon container */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <PanelRight className="relative w-4 h-4 lg:w-5 lg:h-5 text-slate-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              
              {/* Decorative dot indicator with staggered animations */}
              <div className="flex gap-1 lg:gap-1.5">
                <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-all duration-300 group-hover:scale-125" />
                <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-all duration-300 group-hover:scale-125" style={{ transitionDelay: '75ms' }} />
                <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-slate-300 group-hover:bg-purple-500 transition-all duration-300 group-hover:scale-125" style={{ transitionDelay: '150ms' }} />
              </div>

              {/* Tooltip text (appears on hover) */}
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl z-50 hidden xl:block">
                Show Form Fields
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
              </span>
            </button>
          </div>
        )}

        {/* Mobile sidebar toggle button - Always visible on mobile when form has fields */}
        {!isEmpty && (
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <button
              onClick={() => onSidebarToggle(!sidebarOpen)}
              className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95 cursor-pointer"
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <PanelRight className={`w-6 h-6 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
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

        {/* Enhanced Preview Area with beautiful container - Responsive */}
        <div className="h-full overflow-y-auto transition-all duration-500 ease-in-out flex-1 min-w-0 w-full">
          <div className="relative h-full p-2 sm:p-3 lg:p-4">
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
                  {/* Info text about mandatory fields - Enhanced responsive */}
                  <div className="mt-3 sm:mt-4 mx-2 sm:mx-4 mb-2 sm:mb-4 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-200/50 rounded-xl sm:rounded-2xl flex items-start gap-2 sm:gap-3 shadow-sm">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Note</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        First Name, Last Name, Email, and Password are mandatory fields required by BigCommerce and cannot be deleted.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// Empty State Component - Enhanced responsive design
const EmptyStateView: React.FC<{ onCreateNewForm: () => void; hasSavedForms: boolean }> = ({ onCreateNewForm, hasSavedForms }) => {
  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden max-w-2xl w-full">
        {/* Header - Enhanced responsive */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm">
              <FilePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 truncate">No Form Selected</h3>
              <p className="text-xs text-slate-500 truncate">{hasSavedForms ? 'Create a new form or select an existing one' : 'Create a new form to get started'}</p>
            </div>
          </div>
        </div>
        
        {/* Empty State Content - Enhanced responsive */}
        <div className="p-6 sm:p-8 lg:p-12 text-center">
          <div className="mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
              <FilePlus className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 px-4">
              {hasSavedForms ? 'Create a New Form' : 'Create Your First Form'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-2 px-4 max-w-lg mx-auto">
              {hasSavedForms 
                ? 'Start building a new custom signup form with our intuitive form builder.'
                : 'Start building your custom signup form with our intuitive form builder.'
              }
            </p>
            {hasSavedForms && (
              <p className="text-xs sm:text-sm text-slate-500 mt-2 px-4">
                You can also select an existing form to edit it.
              </p>
            )}
          </div>
          
          <button
            onClick={onCreateNewForm}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <FilePlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create New Form</span>
          </button>
          
          {/* Info about mandatory fields - Enhanced responsive */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-200/50 rounded-xl flex items-start gap-2 sm:gap-3 text-left max-w-lg mx-auto shadow-sm">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Note</p>
              <p className="text-xs text-blue-700 leading-relaxed">
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

