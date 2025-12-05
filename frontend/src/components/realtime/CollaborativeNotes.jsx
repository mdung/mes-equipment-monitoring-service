import React, { useState, useEffect, useRef } from 'react';
import { FileText, Save, Users, Edit2 } from 'lucide-react';
import websocketService from '../../services/websocket';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const CollaborativeNotes = ({ orderId, equipmentId, noteType = 'ORDER' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);

  const topic = noteType === 'ORDER' 
    ? `/topic/notes/order/${orderId}`
    : `/topic/notes/equipment/${equipmentId}`;

  useEffect(() => {
    loadNotes();

    // Subscribe to real-time note updates
    const subscription = websocketService.subscribe(topic, (update) => {
      if (update.type === 'NOTE_ADDED' || update.type === 'NOTE_UPDATED') {
        setNotes(prev => {
          const existing = prev.find(n => n.id === update.note.id);
          if (existing) {
            return prev.map(n => n.id === update.note.id ? update.note : n);
          }
          return [...prev, update.note];
        });
      } else if (update.type === 'NOTE_DELETED') {
        setNotes(prev => prev.filter(n => n.id !== update.noteId));
      } else if (update.type === 'USER_TYPING') {
        // Show typing indicator
        setActiveUsers(prev => {
          const exists = prev.find(u => u.id === update.userId);
          if (exists) return prev;
          return [...prev, { id: update.userId, username: update.username, typing: true }];
        });
        setTimeout(() => {
          setActiveUsers(prev => prev.filter(u => u.id !== update.userId));
        }, 3000);
      }
    });

    // Subscribe to active users
    const usersSubscription = websocketService.subscribe(`${topic}/users`, (users) => {
      setActiveUsers(users);
    });

    const checkConnection = () => {
      setIsConnected(websocketService.isConnected());
    };
    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => {
      if (subscription) subscription.unsubscribe();
      if (usersSubscription) usersSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, [orderId, equipmentId, noteType, topic]);

  const loadNotes = async () => {
    try {
      const endpoint = noteType === 'ORDER' 
        ? `/orders/${orderId}/notes`
        : `/equipment/${equipmentId}/notes`;
      const res = await api.get(endpoint).catch(() => ({ data: [] }));
      setNotes(res.data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return;

    setIsSaving(true);
    try {
      const noteData = {
        content: currentNote.trim(),
        noteType,
        orderId: noteType === 'ORDER' ? orderId : null,
        equipmentId: noteType === 'EQUIPMENT' ? equipmentId : null,
      };

      if (editingNoteId) {
        // Update existing note
        const endpoint = noteType === 'ORDER'
          ? `/orders/${orderId}/notes/${editingNoteId}`
          : `/equipment/${equipmentId}/notes/${editingNoteId}`;
        await api.put(endpoint, noteData);
      } else {
        // Create new note
        const endpoint = noteType === 'ORDER'
          ? `/orders/${orderId}/notes`
          : `/equipment/${equipmentId}/notes`;
        await api.post(endpoint, noteData);
      }

      setCurrentNote('');
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote(note.content);
    setEditingNoteId(note.id);
    textareaRef.current?.focus();
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      const endpoint = noteType === 'ORDER'
        ? `/orders/${orderId}/notes/${noteId}`
        : `/equipment/${equipmentId}/notes/${noteId}`;
      await api.delete(endpoint);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleTyping = () => {
    // Notify other users that we're typing
    websocketService.send(
      `/app${topic}/typing`,
      {},
      JSON.stringify({
        userId: user.id,
        username: user.username,
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg dark:text-slate-200 flex items-center gap-2">
          <FileText size={20} />
          Collaborative Notes
        </h3>
        <div className="flex items-center gap-2">
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-secondary dark:text-slate-400">
              <Users size={14} />
              <span>{activeUsers.length} viewing</span>
            </div>
          )}
          {isConnected ? (
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          ) : (
            <div className="w-2 h-2 bg-danger rounded-full"></div>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-secondary dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <FileText size={48} className="mx-auto mb-2 text-slate-400" />
            <p>No notes yet</p>
            <p className="text-sm mt-1">Add a note to get started</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-slate-50 dark:bg-slate-900 rounded border dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-medium dark:text-slate-200">
                    {note.createdBy?.fullName || note.createdBy?.username || 'Unknown'}
                  </div>
                  <div className="text-xs text-secondary dark:text-slate-400">
                    {note.createdAt && format(new Date(note.createdAt), 'PPp')}
                  </div>
                </div>
                {note.createdBy?.id === user.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1 text-accent hover:bg-accent/10 rounded"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-danger hover:bg-danger/10 rounded"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm dark:text-slate-300 whitespace-pre-wrap">{note.content}</div>
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <div className="text-xs text-secondary dark:text-slate-400 mt-1">
                  Edited {format(new Date(note.updatedAt), 'PPp')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Typing Indicators */}
      {activeUsers.filter(u => u.typing && u.id !== user.id).length > 0 && (
        <div className="text-xs text-secondary dark:text-slate-400 italic">
          {activeUsers.filter(u => u.typing && u.id !== user.id).map(u => u.username).join(', ')} typing...
        </div>
      )}

      {/* Add/Edit Note */}
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={currentNote}
          onChange={(e) => {
            setCurrentNote(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSaveNote();
            }
          }}
          placeholder="Add a note... (Ctrl+Enter to save)"
          className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px]"
          rows={4}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-secondary dark:text-slate-400">
            {editingNoteId ? 'Editing note' : 'New note'}
          </div>
          <div className="flex gap-2">
            {editingNoteId && (
              <button
                onClick={() => {
                  setCurrentNote('');
                  setEditingNoteId(null);
                }}
                className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSaveNote}
              disabled={!currentNote.trim() || isSaving || !isConnected}
              className="px-3 py-1.5 text-sm bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : editingNoteId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeNotes;

