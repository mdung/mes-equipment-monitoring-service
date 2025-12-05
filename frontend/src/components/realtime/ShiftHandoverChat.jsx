import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, Clock } from 'lucide-react';
import websocketService from '../../services/websocket';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const ShiftHandoverChat = ({ shiftId, currentShift }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Load existing messages
    loadMessages();

    // Subscribe to chat messages
    const subscription = websocketService.subscribe(`/topic/shift-chat/${shiftId}`, (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    // Subscribe to online users
    const usersSubscription = websocketService.subscribe(`/topic/shift-users/${shiftId}`, (users) => {
      setOnlineUsers(users);
    });

    // Check connection
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
  }, [shiftId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/shifts/${shiftId}/messages`).catch(() => ({ data: [] }));
      setMessages(res.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      shiftId,
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Send via WebSocket (backend will broadcast)
      const sent = websocketService.send(
        `/app/shift-chat/${shiftId}`,
        {},
        JSON.stringify(message)
      );
      
      if (!sent) {
        // Fallback to REST API
        await api.post(`/shifts/${shiftId}/messages`, message);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-accent" />
          <h3 className="font-semibold dark:text-slate-200">Shift Handover Chat</h3>
          {currentShift && (
            <span className="text-xs text-secondary dark:text-slate-400">
              {currentShift.shiftName || `Shift ${shiftId}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-secondary dark:text-slate-400">
            <Users size={14} />
            <span>{onlineUsers.length} online</span>
          </div>
          {isConnected ? (
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          ) : (
            <div className="w-2 h-2 bg-danger rounded-full"></div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8 text-secondary dark:text-slate-400">
            <MessageSquare size={48} className="mx-auto mb-2 text-slate-400" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation...</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.userId === user.id;
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-accent text-white'
                      : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="text-xs font-semibold mb-1 opacity-80">
                      {msg.fullName || msg.username}
                    </div>
                  )}
                  <div className="text-sm">{msg.message}</div>
                  <div className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-secondary dark:text-slate-400'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
        {!isConnected && (
          <div className="text-xs text-danger mt-2 flex items-center gap-1">
            <Clock size={12} />
            Reconnecting...
          </div>
        )}
      </form>
    </div>
  );
};

export default ShiftHandoverChat;

