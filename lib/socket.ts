// ===== lib/socket.ts (Socket.IO Client - Singleton Pattern) =====
import { io, Socket } from 'socket.io-client';

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private isInitializing = false;
  private initializationPromise: Promise<Socket> | null = null;

  private constructor() {}

  // ✅ Singleton Pattern
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // ✅ Get or create socket connection (Thread-safe)
  public async getSocket(): Promise<Socket> {
    // ถ้ามี socket ที่เชื่อมต่ออยู่แล้ว return ทันที
    if (this.socket?.connected) {
      console.log('♻️ Reusing existing socket connection');
      return this.socket;
    }

    // ถ้ากำลัง initialize อยู่ รอให้เสร็จก่อน
    if (this.isInitializing && this.initializationPromise) {
      console.log('⏳ Waiting for socket initialization...');
      return this.initializationPromise;
    }

    // สร้าง socket ใหม่
    this.initializationPromise = this.createSocket();
    return this.initializationPromise;
  }

  // ✅ สร้าง socket connection
  private async createSocket(): Promise<Socket> {
    this.isInitializing = true;

    try {
      // ทำความสะอาด socket เก่า (ถ้ามี)
      if (this.socket) {
        console.log('🧹 Cleaning up old socket...');
        this.socket.removeAllListeners();
        this.socket.close();
        this.socket = null;
      }

      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3120';

      console.log('🔌 Creating new socket connection...');

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
        autoConnect: true,
        forceNew: false,
        closeOnBeforeunload: false, // ✅ ป้องกันการปิด connection เมื่อ page reload
      });

      // ✅ รอให้เชื่อมต่อสำเร็จ
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 20000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          console.log('✅ Socket connected successfully');
          console.log('🆔 Socket ID:', this.socket?.id);
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Connection error:', error.message);
          reject(error);
        });
      });

      // ✅ Setup event listeners
      this.setupEventListeners();

      return this.socket;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  // ✅ Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected. Reason:', reason);
      
      // ถ้า server disconnect ให้ reconnect
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnect attempt ${attemptNumber}...`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
    });
  }

  // ✅ Disconnect socket
  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Manually disconnecting socket...');
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
      console.log('✅ Socket disconnected and cleaned up');
    }
  }

  // ✅ ตรวจสอบสถานะ connection
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ✅ Force reconnect
  public reconnect(): void {
    if (this.socket && !this.socket.connected) {
      console.log('🔄 Forcing reconnection...');
      this.socket.connect();
    }
  }

  // ✅ Get socket instance (สำหรับใช้งานทั่วไป)
  public getSocketSync(): Socket | null {
    return this.socket;
  }
}

// ✅ Export singleton instance
const socketManager = SocketManager.getInstance();

// ✅ Export helper functions (เพื่อ backward compatibility)
export const getSocket = async (): Promise<Socket> => {
  return socketManager.getSocket();
};

export const getSocketSync = (): Socket | null => {
  return socketManager.getSocketSync();
};

export const disconnectSocket = (): void => {
  socketManager.disconnect();
};

export const isSocketConnected = (): boolean => {
  return socketManager.isConnected();
};

export const reconnectSocket = (): void => {
  socketManager.reconnect();
};

// ✅ Export singleton instance (สำหรับ advanced usage)
export default socketManager;
