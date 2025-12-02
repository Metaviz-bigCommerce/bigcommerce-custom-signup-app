'use client'

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';

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
  const [formFields, setFormFields] = useState<FormField[]>([
    { id: 1, type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true, labelColor: '#1f2937', labelSize: '14', labelWeight: '500', borderColor: '#d1d5db', borderWidth: '1', borderRadius: '6', bgColor: '#ffffff', padding: '10', fontSize: '14', textColor: '#1f2937' }
  ]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [containerId, setContainerId] = useState<string>('custom-signup-container');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const fieldTypes: FieldType[] = ['text', 'email', 'phone', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'url'];

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
    try {
        const res = await fetch("/api/bc-scripts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Bootstrap",
                description: "Build responsive websites",
                src: "https://1c8fc2b03e4f.ngrok-free.app/custom-signup.min.js",
                auto_uninstall: true,
                load_method: "default",
                location: "footer",
                visibility: "all_pages",
                kind: "src",
                consent_category: "essential"
            }),
        });

        const data = await res.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
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
          <label className="text-sm font-medium text-gray-700">Container ID</label>
          <input
            type="text"
            value={containerId}
            onChange={(e) => setContainerId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            placeholder="custom-signup-container"
          />
        </div>
        <div className="flex items-center gap-3">
          {generatedPath && (
            <a href={generatedPath} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-700 underline">
              View generated JS
            </a>
          )}
          <button
            onClick={async () => {
              setIsInstalling(true);
              try {
                await addSignupFormScript();
                alert('Script added to theme.');
              } catch (e: any) {
                alert('Failed to add script: ' + (e?.message || 'Unknown error'));
              } finally {
                setIsInstalling(false);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${isInstalling ? 'bg-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700'} transition-colors`}
            disabled={isInstalling}
          >
            {isInstalling ? 'Adding…' : 'Add JS to Theme'}
          </button>
          <button
            onClick={async () => {
              setIsGenerating(true);
              setGeneratedPath(null);
              try {
                const res = await fetch('/api/generate-signup-script', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ formFields, containerId })
                });
                const data = await res.json();
                if (data?.ok && data?.path) {
                  setGeneratedPath(data.path);
                } else {
                  alert('Failed to generate script: ' + (data?.error || 'Unknown error'));
                }
              } catch (e: any) {
                alert('Failed to generate script: ' + (e?.message || 'Unknown error'));
              } finally {
                setIsGenerating(false);
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${isGenerating ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating…' : 'Generate Embed JS'}
          </button>
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

