import React, { useRef } from 'react';

export interface TaskActionsProps {
  showForm: boolean;
  showExportMenu: boolean;
  importMessage: {
    type: 'success' | 'error';
    text: string;
  } | null;
  onToggleForm: () => void;
  onToggleExportMenu: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportClick: () => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCloseImportMessage: () => void;
}

export function TaskActions({
  showForm,
  showExportMenu,
  importMessage,
  onToggleForm,
  onToggleExportMenu,
  onExportJSON,
  onExportCSV,
  onImportClick,
  onFileImport,
  onCloseImportMessage,
}: TaskActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
    onImportClick();
  };

  return (
    <div className="mb-6">
      {/* Import/Export Message Banner */}
      {importMessage && (
        <div
          className={`mb-4 p-4 rounded-lg border flex items-start justify-between ${
            importMessage.type === 'success'
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-red-50 border-red-400 text-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">
              {importMessage.type === 'success' ? '✓' : '✕'}
            </span>
            <p className="font-medium">{importMessage.text}</p>
          </div>
          <button
            onClick={onCloseImportMessage}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl leading-none"
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={onToggleExportMenu}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors shadow-md font-semibold text-base"
          >
            Export Tasks ▾
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
              <button
                onClick={onExportJSON}
                className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors font-medium text-gray-700 border-b border-gray-200"
              >
                Export as JSON
              </button>
              <button
                onClick={onExportCSV}
                className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors font-medium text-gray-700"
              >
                Export as CSV
              </button>
            </div>
          )}
        </div>

        {/* Import Button */}
        <button
          onClick={handleImportClick}
          className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors shadow-md font-semibold text-base"
        >
          Import Tasks
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={onFileImport}
          className="hidden"
        />

        {/* Add Task Button */}
        <button
          onClick={onToggleForm}
          className="bg-blue-500 text-white px-8 py-3.5 rounded-lg hover:bg-blue-600 transition-colors shadow-md font-semibold text-base"
        >
          {showForm ? 'Cancel' : '+ Add New Task'}
        </button>
      </div>
    </div>
  );
}
