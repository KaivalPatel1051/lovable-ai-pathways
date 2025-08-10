import { io, Socket } from 'socket.io-client';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Message {
  _id: string;
  content: string;
  sender: User;
  messageType: 'text' | 'image' | 'video' | 'audio';
  createdAt: Date;
  reactions?: Array<{ user: string; emoji: string }>;
  readBy?: Array<{ user: string; readAt: Date }>;
}

interface ChatbotMessage extends Message {
  sender: {
    _id: 'chatbot';
    username: 'SupportBot';
    firstName: 'Support';
    lastName: 'Bot';
    profilePicture: string;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      this.handleReconnection();
    });

    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(token);
        }
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  // Chat methods
  joinChat(chatId: string): void {
    this.socket?.emit('join_chat', { chatId });
  }

  leaveChat(chatId: string): void {
    this.socket?.emit('leave_chat', { chatId });
  }

  sendMessage(chatId: string, message: Message): void {
    this.socket?.emit('send_message', { chatId, message });
  }

  startTyping(chatId: string): void {
    this.socket?.emit('typing_start', { chatId });
  }

  stopTyping(chatId: string): void {
    this.socket?.emit('typing_stop', { chatId });
  }

  markMessageAsRead(chatId: string, messageId: string): void {
    this.socket?.emit('message_read', { chatId, messageId });
  }

  // Reel interaction methods
  sendReelInteraction(reelId: string, type: 'like' | 'comment' | 'share', value: any): void {
    this.socket?.emit('reel_interaction', { reelId, type, value });
  }

  // User status methods
  updateStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.socket?.emit('status_update', { status });
  }

  // Chatbot methods
  sendChatbotMessage(message: string, chatId?: string): void {
    this.socket?.emit('chatbot_message', { message, chatId });
  }

  // Event listeners
  onUserOnline(callback: (data: { userId: string; username: string; status: string }) => void): void {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: { userId: string; username: string; lastSeen: Date }) => void): void {
    this.socket?.on('user_offline', callback);
  }

  onUserTyping(callback: (data: { chatId: string; userId: string; username: string; isTyping: boolean }) => void): void {
    this.socket?.on('user_typing', callback);
  }

  // Alias for typing updates to match MERNChatPage expectations
  onTypingUpdate(callback: (data: { chatId: string; userId: string; isTyping: boolean; userName: string }) => void): void {
    this.socket?.on('user_typing', (data: { chatId: string; userId: string; username: string; isTyping: boolean }) => {
      callback({
        chatId: data.chatId,
        userId: data.userId,
        isTyping: data.isTyping,
        userName: data.username
      });
    });
  }

  onNewMessage(callback: (data: { chatId: string; message: Message }) => void): void {
    this.socket?.on('new_message', callback);
  }

  onMessageReadReceipt(callback: (data: { chatId: string; messageId: string; readBy: User; readAt: Date }) => void): void {
    this.socket?.on('message_read_receipt', callback);
  }

  // Additional methods for MERNChatPage compatibility
  onMessageReaction(callback: (data: { messageId: string; emoji: string; userId: string }) => void): void {
    this.socket?.on('message_reaction', callback);
  }

  onMessageRead(callback: (data: { messageIds: string[]; userId: string }) => void): void {
    this.socket?.on('messages_read', callback);
  }

  updateTypingStatus(chatId: string, isTyping: boolean): void {
    if (isTyping) {
      this.startTyping(chatId);
    } else {
      this.stopTyping(chatId);
    }
  }

  onReelUpdate(callback: (data: { reelId: string; type: string; value: any; user: User }) => void): void {
    this.socket?.on('reel_update', callback);
  }

  onUserStatusUpdate(callback: (data: { userId: string; status: string; lastSeen: Date }) => void): void {
    this.socket?.on('user_status_update', callback);
  }

  onChatbotResponse(callback: (data: { chatId?: string; message: ChatbotMessage }) => void): void {
    this.socket?.on('chatbot_response', callback);
  }

  onUserJoinedChat(callback: (data: { chatId: string; userId: string; username: string }) => void): void {
    this.socket?.on('user_joined_chat', callback);
  }

  onUserLeftChat(callback: (data: { chatId: string; userId: string; username: string }) => void): void {
    this.socket?.on('user_left_chat', callback);
  }

  // Video call methods (for future implementation)
  callUser(targetUserId: string, offer: any): void {
    this.socket?.emit('call_user', { targetUserId, offer });
  }

  onIncomingCall(callback: (data: { from: string; offer: any; caller: User }) => void): void {
    this.socket?.on('incoming_call', callback);
  }

  // Remove event listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  removeListener(event: string): void {
    this.socket?.off(event);
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
export type { User, Message, ChatbotMessage };
