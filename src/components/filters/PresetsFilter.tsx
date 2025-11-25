import React from 'react';
import { FilterPreset } from '../../types/filter';

export interface PresetsFilterProps {
  expanded: boolean;
  toggle: () => void;
  presets: FilterPreset[];
  onLoad: (preset: FilterPreset) => void;
  onDelete: (id: string) => void;
  showDialog: boolean;
  setShowDialog: (v: boolean) => void;
  presetName: string;
  setPresetName: (v: string) => void;
  onSavePresetDialog: () => void;
}

export const PresetsFilter = React.memo(
  ({
    expanded,
    toggle,
    presets,
    onLoad,
    onDelete,
    showDialog,
    setShowDialog,
    presetName,
    setPresetName,
    onSavePresetDialog,
  }: PresetsFilterProps) => (
    <div>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
      >
        <span>Saved Presets {presets.length > 0 && `(${presets.length})`}</span>
        <svg
          className={`h-4 w-4 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <div className="space-y-2">
          <button
            onClick={() => setShowDialog(true)}
            className="w-full px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs font-semibold"
          >
            + Save Current Filters
          </button>
          {presets.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                >
                  <button
                    onClick={() => onLoad(preset)}
                    className="flex-1 text-left text-xs font-medium text-gray-700 hover:text-blue-600"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => onDelete(preset.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Preset Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Save Filter Preset</h3>
            <input
              type="text"
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={onSavePresetDialog}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold"
                disabled={!presetName.trim()}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowDialog(false);
                  setPresetName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
);
