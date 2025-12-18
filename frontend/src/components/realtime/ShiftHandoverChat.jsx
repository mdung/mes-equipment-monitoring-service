import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, Clock } from 'lucide-react';
import websocketService from '../../services/websocket';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
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
    <div className="flex flex-col h-[600px] bg-slate-700/30 rounded-xl border border-slate-600">
      {/* Header */}
      <div className="p-4 border-b border-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-green-500/20 rounded-lg">
            <MessageSquare size={16} className="text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Shift Handover Chat</h3>
            {currentShift && (
              <span className="text-xs text-slate-400">
                {currentShift.name || currentShift.shiftName || `Shift ${shiftId}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users size={12} />
            <span>{onlineUsers.length} online</span>
          </div>
          {isConnected ? (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          ) : (
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="p-4 bg-slate-600/30 rounded-full w-fit mx-auto mb-4">
              <MessageSquare size={32} className="text-slate-400" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1 text-slate-500">Start the conversation...</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.userId === user?.id;
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl p-3 ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-600/50 text-slate-200 border border-slate-500/30'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="text-xs font-semibold mb-1 text-slate-300">
                      {msg.fullName || msg.username}
                    </div>
                  )}
                  <div className="text-sm">{msg.message}</div>
                  <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-slate-400'}`}>
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
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-600">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
            className="flex-1 px-4 py-3 bg-slate-600/50 border border-slate-500 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 flex items-center gap-2 font-medium transition-all"
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </div>
        {!isConnected && (
          <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <Clock size={12} />
            <span>Reconnecting to server...</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ShiftHandoverChat;

