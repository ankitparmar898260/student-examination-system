import React from "react";

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  message = "Are you sure you want to proceed?",
  confirmLabel = "Delete",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-sm transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Confirm Action
          </h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
