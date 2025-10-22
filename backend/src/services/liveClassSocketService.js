import { Server } from 'socket.io';

class LiveClassSocketService {
  constructor() {
    this.io = null;
    this.rooms = new Map(); // roomId -> Map(participantId -> participantInfo)
    this.chatHistory = new Map(); // roomId -> Array of messages
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Live class events
      socket.on('join-room', ({ roomId, userInfo }) => {
        this.handleJoinRoom(socket, roomId, userInfo);
      });

      socket.on('leave-room', ({ roomId }) => {
        this.handleLeaveRoom(socket, roomId);
      });

      socket.on('webrtc-offer', ({ offer, to }) => {
        this.handleWebRTCSignal(socket, 'webrtc-offer', { offer, to });
      });

      socket.on('webrtc-answer', ({ answer, to }) => {
        this.handleWebRTCSignal(socket, 'webrtc-answer', { answer, to });
      });

      socket.on('webrtc-ice-candidate', ({ candidate, to }) => {
        this.handleWebRTCSignal(socket, 'webrtc-ice-candidate', { candidate, to });
      });

      socket.on('media-state-change', (mediaState) => {
        this.handleMediaStateChange(socket, mediaState);
      });

      socket.on('chat-message', ({ roomId, message }) => {
        this.handleChatMessage(socket, roomId, message);
      });

      // Legacy socket events (from old socketService)
      socket.on('offer', ({ offer, targetUserId }) => {
        this.handleLegacyWebRTC(socket, 'offer', { offer, targetUserId });
      });

      socket.on('answer', ({ answer, targetUserId }) => {
        this.handleLegacyWebRTC(socket, 'answer', { answer, targetUserId });
      });

      socket.on('ice-candidate', ({ candidate, targetUserId }) => {
        this.handleLegacyWebRTC(socket, 'ice-candidate', { candidate, targetUserId });
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleJoinRoom(socket, roomId, userInfo) {
    try {
      // Initialize room if it doesn't exist
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Map());
        this.chatHistory.set(roomId, []);
      }

      const room = this.rooms.get(roomId);
      
      // Get existing participants before adding new one
      const existingParticipants = Array.from(room.entries()).map(([id, info]) => ({
        participantId: id,
        userInfo: info
      }));

      // Add participant to room
      socket.join(roomId);
      socket.roomId = roomId;
      socket.participantId = userInfo.id;
      
      room.set(userInfo.id, {
        socketId: socket.id,
        ...userInfo,
        joinedAt: new Date().toISOString()
      });

      console.log(`Participant ${userInfo.name} joined room ${roomId}. Total: ${room.size}`);

      // Notify existing participants about new participant
      socket.to(roomId).emit('participant-joined', {
        participantId: userInfo.id,
        userInfo: {
          ...userInfo,
          joinedAt: new Date().toISOString()
        }
      });

      // Send existing participants to new participant
      socket.emit('existing-participants', existingParticipants);

      // Send chat history to new participant
      const history = this.chatHistory.get(roomId) || [];
      if (history.length > 0) {
        socket.emit('chat-history', history.slice(-50));
      }

    } catch (error) {
      console.error('Error in handleJoinRoom:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  handleLeaveRoom(socket, roomId) {
    try {
      const room = this.rooms.get(roomId);
      if (!room || !socket.participantId) return;

      room.delete(socket.participantId);
      socket.leave(roomId);

      // Notify other participants
      socket.to(roomId).emit('participant-left', {
        participantId: socket.participantId
      });

      console.log(`Participant ${socket.participantId} left room ${roomId}. Remaining: ${room.size}`);

      // Clean up empty room
      if (room.size === 0) {
        this.rooms.delete(roomId);
        // Clean up chat history after 1 hour
        setTimeout(() => {
          if (!this.rooms.has(roomId)) {
            this.chatHistory.delete(roomId);
          }
        }, 3600000);
      }

    } catch (error) {
      console.error('Error in handleLeaveRoom:', error);
    }
  }

  handleWebRTCSignal(socket, eventType, data) {
    try {
      console.log(`WebRTC ${eventType} from ${socket.participantId} to ${data.to}`);
      
      const room = this.rooms.get(socket.roomId);
      if (!room) {
        console.error(`Room ${socket.roomId} not found for WebRTC signal`);
        return;
      }
      
      if (!room.has(data.to)) {
        console.error(`Participant ${data.to} not found in room ${socket.roomId}`);
        return;
      }

      const targetParticipant = room.get(data.to);
      const targetSocketId = targetParticipant.socketId;

      console.log(`Forwarding ${eventType} to socket ${targetSocketId}`);
      this.io.to(targetSocketId).emit(eventType, {
        ...data,
        from: socket.participantId
      });

    } catch (error) {
      console.error(`Error in ${eventType}:`, error);
    }
  }

  handleMediaStateChange(socket, mediaState) {
    try {
      const room = this.rooms.get(socket.roomId);
      if (!room || !socket.participantId) return;

      // Update participant's media state
      const participant = room.get(socket.participantId);
      if (participant) {
        Object.assign(participant, mediaState);
        
        // Notify other participants
        socket.to(socket.roomId).emit('participant-media-state', {
          participantId: socket.participantId,
          mediaState
        });
      }

    } catch (error) {
      console.error('Error in handleMediaStateChange:', error);
    }
  }

  handleChatMessage(socket, roomId, message) {
    try {
      console.log(`Chat message in room ${roomId} from ${socket.participantId}:`, message);
      
      if (!this.chatHistory.has(roomId)) {
        this.chatHistory.set(roomId, []);
      }

      const chatHistory = this.chatHistory.get(roomId);
      chatHistory.push(message);

      // Keep only last 100 messages
      if (chatHistory.length > 100) {
        this.chatHistory.set(roomId, chatHistory.slice(-100));
      }

      console.log(`Broadcasting chat message to room ${roomId}`);
      // Broadcast to all participants in room
      this.io.to(roomId).emit('chat-message', message);

    } catch (error) {
      console.error('Error in handleChatMessage:', error);
    }
  }

  handleLegacyWebRTC(socket, eventType, data) {
    try {
      // Handle legacy WebRTC events for backward compatibility
      const room = this.rooms.get(socket.roomId);
      if (!room || !room.has(data.targetUserId)) return;

      const targetParticipant = room.get(data.targetUserId);
      const targetSocketId = targetParticipant.socketId;

      this.io.to(targetSocketId).emit(eventType, {
        ...data,
        fromUserId: socket.participantId
      });

    } catch (error) {
      console.error(`Error in legacy ${eventType}:`, error);
    }
  }

  handleDisconnect(socket) {
    try {
      if (socket.roomId && socket.participantId) {
        this.handleLeaveRoom(socket, socket.roomId);
      }
      console.log(`Socket disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    }
  }

  getRoomParticipants(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      role: info.role,
      isCameraOn: info.isCameraOn,
      isMicOn: info.isMicOn,
      isScreenSharing: info.isScreenSharing,
      joinedAt: info.joinedAt
    }));
  }

  getRoomCount(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.size : 0;
  }
}

export default new LiveClassSocketService();