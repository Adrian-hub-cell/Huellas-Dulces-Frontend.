import { Injectable, inject, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  private client: Client | null = null;

  readonly connected = signal(false);
  readonly onlineUsers = signal<string[]>([]);

  connect(): void {
    const token = this.auth.token();

    if (!token || this.client?.active) {
      console.warn('[Realtime] No hay token o ya existe una conexión activa.');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const brokerURL = `${protocol}//${window.location.host}/ws`;

    console.info('[Realtime] Intentando conectar con WebSocket...');

    this.client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (message: string) => console.log('[STOMP]', message),

      onConnect: () => {
        console.info('[Realtime] ¡Conexión STOMP establecida!');
        this.connected.set(true);

        this.client?.subscribe('/topic/presence', (message: IMessage) => {
          const users = JSON.parse(message.body) as string[];
          this.onlineUsers.set(users);
          console.info('[Realtime] Usuarios conectados:', users);
        });

        this.client?.subscribe('/user/queue/notifications', (message: IMessage) => {
          this.notifications.notify(message.body);
        });
      },

      onDisconnect: () => {
        console.warn('[Realtime] STOMP desconectado.');
        this.connected.set(false);
      },

      onWebSocketClose: (event) => {
        console.warn('[Realtime] WebSocket cerrado:', event.code, event.reason);
        this.connected.set(false);
      },

      onWebSocketError: (event) => {
        console.error('[Realtime] Error de WebSocket:', event);
      },

      onStompError: (frame) => {
        console.error('[Realtime] Error STOMP:', frame.headers['message']);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      void this.client.deactivate();
      this.client = null;
    }

    this.connected.set(false);
    this.onlineUsers.set([]);
  }
}
