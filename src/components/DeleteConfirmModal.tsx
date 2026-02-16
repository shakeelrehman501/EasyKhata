import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item?',
  itemName,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-[#2d2d2d]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="text-red-600 dark:text-red-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-[#e8e8e8]">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-[#9ca3af]">
            {message}
          </p>
          {itemName && (
            <p className="mt-2 font-medium text-slate-900 dark:text-[#e8e8e8]">
              "{itemName}"
            </p>
          )}
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-[#2d2d2d] text-slate-700 dark:text-[#9ca3af] rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 dark:bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
