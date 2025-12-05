import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, File, Download } from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const ProgressAttachments = ({ orderId }) => {
  const { t } = useTranslation();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (orderId) {
      fetchAttachments();
    }
  }, [orderId]);

  const fetchAttachments = async () => {
    try {
      const res = await api.get(`/orders/${orderId}/attachments`).catch(() => ({ data: [] }));
      setAttachments(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('orderId', orderId);
      formData.append('type', 'PROGRESS_PHOTO');

      await api.post(`/orders/${orderId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Files uploaded successfully');
      fetchAttachments();
    } catch (error) {
      console.error('Error uploading files:', error);
      showToast('Failed to upload files', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    
    try {
      await api.delete(`/orders/${orderId}/attachments/${attachmentId}`);
      showToast('Attachment deleted successfully');
      fetchAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      showToast('Failed to delete attachment', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    // You can integrate with your toast system
    console.log(message, type);
  };

  const isImage = (filename) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  if (loading) {
    return <div className="text-center py-4">Loading attachments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <ImageIcon size={20} />
          Progress Photos & Attachments
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCameraCapture}
            className="px-3 py-2 bg-accent text-white rounded hover:bg-accent/90 flex items-center gap-2 text-sm"
          >
            <Camera size={16} />
            Camera
          </button>
          <button
            onClick={handleFileSelect}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-2 text-sm"
          >
            <Upload size={16} />
            Upload
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {uploading && (
        <div className="text-center py-4 text-secondary dark:text-slate-400">
          Uploading files...
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="text-center py-8 text-secondary dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <ImageIcon size={48} className="mx-auto mb-2 text-slate-400" />
          <p>No attachments yet</p>
          <p className="text-sm mt-1">Upload photos or files to track progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group border dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800"
            >
              {isImage(attachment.filename || attachment.fileName) ? (
                <img
                  src={attachment.url || attachment.fileUrl || URL.createObjectURL(new Blob())}
                  alt={attachment.description || 'Progress photo'}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                  <File size={32} className="text-slate-400" />
                </div>
              )}
              
              <div className="p-2">
                <p className="text-xs font-medium truncate dark:text-slate-200">
                  {attachment.filename || attachment.fileName || 'Attachment'}
                </p>
                {attachment.uploadedAt && (
                  <p className="text-xs text-secondary dark:text-slate-400 mt-1">
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {attachment.url && (
                  <a
                    href={attachment.url}
                    download
                    className="p-1 bg-white dark:bg-slate-800 rounded shadow hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Download size={14} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="p-1 bg-white dark:bg-slate-800 rounded shadow hover:bg-red-100 dark:hover:bg-red-900 text-danger"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressAttachments;

