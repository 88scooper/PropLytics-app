"use client";

import { useState, useCallback } from "react";
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function BulkUploadModal({ onClose, onSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const { showToast } = useToast();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      showToast('Please select a CSV or Excel file', 'error');
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }
    
    setFile(selectedFile);
    setUploadResults(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/mortgages/upload?download=template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mortgage_import_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast('Template downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast('Failed to download template', 'error');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/mortgages/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setUploadResults(result.data);
      
      if (result.data.summary.imported > 0) {
        showToast(`Successfully imported ${result.data.summary.imported} mortgages`, 'success');
        if (onSuccess) {
          onSuccess();
        }
      }
      
      if (result.data.summary.errors > 0) {
        showToast(`${result.data.summary.errors} rows failed to import`, 'warning');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      showToast(error.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResults(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bulk Import Mortgages
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How to Import Your Mortgage Data
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Download the CSV template below</li>
              <li>Fill in your mortgage data following the format shown</li>
              <li>Save the file as CSV format</li>
              <li>Upload the file using the area below</li>
            </ol>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">CSV Template</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Download the template to see the required format
                </p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-[#205A3E] text-white rounded-lg hover:bg-[#1a4a32] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* File Upload Area */}
          {!uploadResults && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-[#205A3E] bg-[#205A3E]/5'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-[#205A3E] text-white rounded-lg hover:bg-[#1a4a32] transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                    <button
                      onClick={resetUpload}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    >
                      Remove File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white mb-2">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      or click to browse files
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Import Results
                </h3>
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {uploadResults.summary.imported}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Successfully Imported
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {uploadResults.summary.errors}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    Failed
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    {uploadResults.totalRows}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Total Rows
                  </div>
                </div>
              </div>

              {/* Successful Imports */}
              {uploadResults.successful.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Successfully Imported
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResults.successful.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle className="w-4 h-4" />
                        <span>Row {item.row}: {item.lenderName} - ${item.originalAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Imports */}
              {uploadResults.failed.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Failed Imports
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResults.failed.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Row {item.row}:</span> {item.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetUpload}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-[#205A3E] text-white rounded-lg hover:bg-[#1a4a32] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
