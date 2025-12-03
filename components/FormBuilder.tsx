'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { useBcScriptsActions, useStoreForm, useStoreFormActions } from '@/lib/hooks';
import Skeleton from '@/components/Skeleton';

type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'file' | 'url';

type FormField = {
  id: number;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  labelColor: string;
  labelSize: string;
  labelWeight: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  bgColor: string;
  padding: string;
  fontSize: string;
  textColor: string;
};

const FormBuilder: React.FC = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const defaultTheme = {
    title: 'Create your account',
    subtitle: 'Please fill in the form to continue',
    primaryColor: '#2563eb',
    layout: 'split',
    splitImageUrl: '',
    buttonText: 'Create account',
    buttonBg: '#2563eb',
    buttonColor: '#ffffff',
    buttonRadius: 10
  } as any;
  const [theme, setTheme] = useState<any>(defaultTheme);
  const { addScript, updateScript, deleteScript } = useBcScriptsActions();
  const { form, active, scriptUuid, mutate } = useStoreForm();
  const { saveForm, setActive } = useStoreFormActions();

  const fieldTypes: FieldType[] = ['text', 'email', 'phone', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'url'];

  useEffect(() => {
    if (form?.fields?.length) {
      setFormFields(form.fields as any);
    }
    if (form?.theme) {
      setTheme({ ...defaultTheme, ...(form.theme as any) });
    }
  }, [form]);

  const isDirty = useMemo(() => {
    if (!form) return false;
    try {
      const fieldsChanged = JSON.stringify(form?.fields || []) !== JSON.stringify(formFields || []);
      const themeChanged = JSON.stringify(form?.theme || defaultTheme) !== JSON.stringify(theme || defaultTheme);
      return fieldsChanged || themeChanged;
    } catch {
      return true;
    }
  }, [form, formFields, theme]);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Date.now(),
      type,
      label: `New ${type} field`,
      placeholder: `Enter ${type}`,
      required: false,
      labelColor: '#1f2937',
      labelSize: '14',
      labelWeight: '500',
      borderColor: '#d1d5db',
      borderWidth: '1',
      borderRadius: '6',
      bgColor: '#ffffff',
      padding: '10',
      fontSize: '14',
      textColor: '#1f2937'
    };
    setFormFields([...formFields, newField]);
  };

  async function addSignupFormScript() {
    const payload = {
      name: "Custom Signup Form",
      description: "Injects custom signup form script into the theme",
      src: typeof window !== 'undefined' ? `${window.location.origin}/custom-signup.min.js` : "/custom-signup.min.js",
      auto_uninstall: true,
      load_method: "default",
      location: "head",
      visibility: "all_pages",
      kind: "src",
      consent_category: "essential"
    };
    const data = await addScript(payload);
    console.log('addScript data:', data);
    return data;
  }

  async function handleSaveForm() {
    setIsSaving(true);
    try {
      await saveForm({ fields: formFields, theme });
      // If a script exists, regenerate JS and update the script
      if (active && scriptUuid) {
        await fetch('/api/generate-signup-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formFields, theme })
        });
        await updateScript(scriptUuid, {
          name: "Custom Signup Form",
          description: "Updated custom signup form script",
          src: typeof window !== 'undefined' ? `${window.location.origin}/custom-signup.min.js` : "/custom-signup.min.js",
          auto_uninstall: true,
          load_method: "default",
          location: "head",
          visibility: "all_pages",
          kind: "src",
          consent_category: "essential"
        });
      }
      await mutate();
      alert('Form saved.');
    } catch (e: any) {
      alert('Failed to save form: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleActivate() {
    setIsToggling(true);
    try {
      // Generate embed JS for current fields
      await fetch('/api/generate-signup-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formFields, theme })
      });
      const data = await addSignupFormScript();
      const uuid = (data as any)?.data?.uuid;
      await setActive(true);
      await mutate();
      alert('Form activated' + (uuid ? `: ${uuid}` : '.'));
    } catch (e: any) {
      alert('Failed to activate: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDeactivate() {
    setIsToggling(true);
    try {
      if (scriptUuid) {
        await deleteScript(scriptUuid);
      }
      await setActive(false);
      await mutate();
      alert('Form deactivated.');
    } catch (e: any) {
      alert('Failed to deactivate: ' + (e?.message || 'Unknown error'));
    } finally {
      setIsToggling(false);
    }
  }

  if (form === undefined) {
    return (
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg border-2 border-gray-100">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="col-span-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const deleteField = (id: number) => {
    setFormFields(formFields.filter(f => f.id !== id));
    if (selectedField?.id === id) setSelectedField(null);
  };

  const updateField = (id: number, updates: Partial<FormField>) => {
    const updatedFields = formFields.map(f => f.id === id ? { ...f, ...updates } : f);
    setFormFields(updatedFields);
    if (selectedField?.id === id) {
      setSelectedField({ ...selectedField, ...updates } as FormField);
    }
  };

  const FormPreview = () => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">Live Preview</h3>
      <div className="space-y-4">
        {formFields.map(field => (
          <div key={field.id}>
            <label 
              style={{ 
                color: field.labelColor, 
                fontSize: field.labelSize + 'px', 
                fontWeight: field.labelWeight 
              }}
              className="block mb-2"
            >
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                placeholder={field.placeholder}
                style={{
                  borderColor: field.borderColor,
                  borderWidth: field.borderWidth + 'px',
                  borderRadius: field.borderRadius + 'px',
                  backgroundColor: field.bgColor,
                  padding: field.padding + 'px',
                  fontSize: field.fontSize + 'px',
                  color: field.textColor
                }}
                className="w-full outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                rows={3}
              />
            ) : field.type === 'select' ? (
              <select
                style={{
                  borderColor: field.borderColor,
                  borderWidth: field.borderWidth + 'px',
                  borderRadius: field.borderRadius + 'px',
                  backgroundColor: field.bgColor,
                  padding: field.padding + 'px',
                  fontSize: field.fontSize + 'px',
                  color: field.textColor
                }}
                className="w-full outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              >
                <option>Select an option</option>
              </select>
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder}
                style={{
                  borderColor: field.borderColor,
                  borderWidth: field.borderWidth + 'px',
                  borderRadius: field.borderRadius + 'px',
                  backgroundColor: field.bgColor,
                  padding: field.padding + 'px',
                  fontSize: field.fontSize + 'px',
                  color: field.textColor
                }}
                className="w-full outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveForm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${isDirty ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gray-300 cursor-not-allowed'} transition-colors`}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving…' : 'Save Form'}
          </button>
          {active ? (
            <button
              onClick={handleDeactivate}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${isToggling ? 'bg-rose-300' : 'bg-rose-600 hover:bg-rose-700'} transition-colors`}
              disabled={isToggling}
            >
              {isToggling ? 'Deactivating…' : 'Deactivate'}
            </button>
          ) : (
            <button
              onClick={handleActivate}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${isToggling ? 'bg-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700'} transition-colors`}
              disabled={isToggling}
            >
              {isToggling ? 'Activating…' : 'Activate'}
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Form Fields</h3>
        <div className="space-y-2 mb-6">
          {formFields.map(field => (
            <div 
              key={field.id} 
              onClick={() => setSelectedField(field)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedField?.id === field.id 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{field.label}</div>
                <div className="text-xs text-gray-500">{field.type}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Add New Field</h4>
          <div className="grid grid-cols-2 gap-2">
            {fieldTypes.map(type => (
              <button
                key={type}
                onClick={() => addField(type)}
                className="text-xs bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-all capitalize"
              >
                <Plus className="w-3 h-3 inline mr-1" />
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Theme</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={theme.title}
                onChange={(e) => setTheme({ ...theme, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subtitle</label>
              <input
                type="text"
                value={theme.subtitle}
                onChange={(e) => setTheme({ ...theme, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Primary Color</label>
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Layout</label>
                <select
                  value={theme.layout}
                  onChange={(e) => setTheme({ ...theme, layout: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="split">Split</option>
                  <option value="center">Center</option>
                </select>
              </div>
            </div>
            {theme.layout === 'split' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Split Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/hero.jpg"
                  value={theme.splitImageUrl}
                  onChange={(e) => setTheme({ ...theme, splitImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
              </div>
            )}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Submit Button</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Text</label>
                  <input
                    type="text"
                    value={theme.buttonText}
                    onChange={(e) => setTheme({ ...theme, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Background</label>
                  <input
                    type="color"
                    value={theme.buttonBg}
                    onChange={(e) => setTheme({ ...theme, buttonBg: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={theme.buttonColor}
                    onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Border Radius (px)</label>
                  <input
                    type="number"
                    value={theme.buttonRadius}
                    onChange={(e) => setTheme({ ...theme, buttonRadius: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {selectedField ? (
          <>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Customize Field</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Label</label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Placeholder</label>
                <input
                  type="text"
                  value={selectedField.placeholder}
                  onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedField.required}
                    onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-sm font-medium text-gray-600">Required field</span>
                </label>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Label Styling</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                    <input
                      type="color"
                      value={selectedField.labelColor}
                      onChange={(e) => updateField(selectedField.id, { labelColor: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Size (px)</label>
                    <input
                      type="number"
                      value={selectedField.labelSize}
                      onChange={(e) => updateField(selectedField.id, { labelSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Weight</label>
                    <select
                      value={selectedField.labelWeight}
                      onChange={(e) => updateField(selectedField.id, { labelWeight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="400">Normal</option>
                      <option value="500">Medium</option>
                      <option value="600">Semi-bold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Input Styling</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Border Color</label>
                    <input
                      type="color"
                      value={selectedField.borderColor}
                      onChange={(e) => updateField(selectedField.id, { borderColor: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Border Width (px)</label>
                    <input
                      type="number"
                      value={selectedField.borderWidth}
                      onChange={(e) => updateField(selectedField.id, { borderWidth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Border Radius (px)</label>
                    <input
                      type="number"
                      value={selectedField.borderRadius}
                      onChange={(e) => updateField(selectedField.id, { borderRadius: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Background</label>
                    <input
                      type="color"
                      value={selectedField.bgColor}
                      onChange={(e) => updateField(selectedField.id, { bgColor: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Padding (px)</label>
                    <input
                      type="number"
                      value={selectedField.padding}
                      onChange={(e) => updateField(selectedField.id, { padding: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={selectedField.textColor}
                      onChange={(e) => updateField(selectedField.id, { textColor: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
                    <input
                      type="number"
                      value={selectedField.fontSize}
                      onChange={(e) => updateField(selectedField.id, { fontSize: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a field to customize</p>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-6 h-full overflow-y-auto">
        <FormPreview />
      </div>
      </div>
    </div>
  );
};

export default FormBuilder;

