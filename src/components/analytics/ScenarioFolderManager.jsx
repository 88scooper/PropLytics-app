"use client";

import { useState, useEffect } from 'react';
import { X, Folder, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { getFolders, createFolder, deleteFolder } from '@/lib/scenario-storage';
import { useToast } from '@/context/ToastContext';

export default function ScenarioFolderManager({ isOpen, onClose, onFolderChange }) {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = () => {
    const allFolders = getFolders();
    // Filter out "All Scenarios" from the list
    setFolders(allFolders.filter(f => f !== 'All Scenarios'));
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      addToast('Please enter a folder name', { type: 'error' });
      return;
    }

    const success = createFolder(newFolderName.trim());
    if (success) {
      setNewFolderName('');
      loadFolders();
      onFolderChange?.();
      addToast('Folder created successfully');
    } else {
      addToast('Folder name already exists or is invalid', { type: 'error' });
    }
  };

  const handleStartEdit = (folderName) => {
    setEditingFolder(folderName);
    setEditName(folderName);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || editName === editingFolder) {
      setEditingFolder(null);
      return;
    }

    // For now, we'll need to manually update scenarios
    // This is a simplified version - in production you'd want a renameFolder function
    addToast('Folder renaming coming soon. Delete and recreate for now.', { type: 'error' });
    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderName) => {
    const success = deleteFolder(folderName);
    if (success) {
      loadFolders();
      onFolderChange?.();
      setShowDeleteConfirm(null);
      addToast('Folder deleted. Scenarios moved to Uncategorized.');
    } else {
      addToast('Cannot delete default folders', { type: 'error' });
    }
  };

  if (!isOpen) return null;

  const defaultFolders = ['Uncategorized', 'Favorites'];
  const customFolders = folders.filter(f => !defaultFolders.includes(f));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Manage Folders
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Create New Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Create New Folder
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                placeholder="Folder name..."
                className="flex-1 px-4 py-2 rounded-lg border border-black/15 dark:border-white/15 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 outline-none"
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Folders List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Folders ({folders.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {/* Default Folders */}
              {defaultFolders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{folder}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">(Default)</span>
                  </div>
                </div>
              ))}

              {/* Custom Folders */}
              {customFolders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {editingFolder === folder ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="flex-1 px-2 py-1 rounded border border-black/15 dark:border-white/15 bg-transparent text-sm text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingFolder(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{folder}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(folder)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {showDeleteConfirm === folder ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteFolder(folder)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(folder)}
                            className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {customFolders.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No custom folders yet. Create one above.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

