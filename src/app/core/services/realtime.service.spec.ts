
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const stompMocks = vi.hoisted(() => ({
  clients: [] as any[]
}));

vi.mock('@stomp/stompjs', () => ({
  Client: class {
    active = false;
    config: any;
    subscriptions: any[] = [];
    activate = vi.fn(() => {
      this.active = true;
    });
    deactivate = vi.fn(async () => {
      this.active = false;
    });

    constructor(config: any) {
      this.config = config;
      stompMocks.clients.push(this);
    }

    subscribe(destination: string, callback: (message: any) => void) {
      this.subscriptions.push({ destination, callback });
      return { unsubscribe: vi.fn() };
    }
  }
}));

import { RealtimeService } from './realtime.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

describe('RealtimeService', () => {
  let service: RealtimeService;

  const authMock = {
    token: vi.fn()
  };

  const notificationMock = {
    notify: vi.fn()
  };

  beforeEach(() => {
    stompMocks.clients.length = 0;
    authMock.token.mockReturnValue('jwt-test');

    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RealtimeService,
        { provide: AuthService, useValue: authMock },
        { provide: NotificationService, useValue: notificationMock }
      ]
    });

    service = TestBed.inject(RealtimeService);

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
    expect(service.connected()).toBe(false);
    expect(service.onlineUsers()).toEqual([]);
  });

  it('no debe conectar cuando no existe un token', () => {
    authMock.token.mockReturnValue(null);

    service.connect();

    expect(stompMocks.clients).toHaveLength(0);
    expect(service.connected()).toBe(false);
  });

  it('debe crear y activar una conexión con token JWT', () => {
    service.connect();

    expect(stompMocks.clients).toHaveLength(1);

    const client = stompMocks.clients[0];

    expect(client.config.brokerURL).toBe('ws://localhost:8080/ws');
    expect(client.config.connectHeaders.Authorization).toBe('Bearer jwt-test');
    expect(client.activate).toHaveBeenCalledOnce();
  });

  it('no debe crear conexiones duplicadas si ya está activo', () => {
    service.connect();

    const client = stompMocks.clients[0];

    service.connect();

    expect(stompMocks.clients).toHaveLength(1);
    expect(client.activate).toHaveBeenCalledOnce();
  });

  it('debe actualizar el estado al establecer conexión', () => {
    service.connect();

    const client = stompMocks.clients[0];

    client.config.onConnect();

    expect(service.connected()).toBe(true);
    expect(client.subscriptions).toHaveLength(2);
    expect(client.subscriptions[0].destination).toBe('/topic/presence');
    expect(client.subscriptions[1].destination).toBe('/user/queue/notifications');
  });

  it('debe actualizar la lista de usuarios conectados', () => {
    service.connect();

    const client = stompMocks.clients[0];

    client.config.onConnect();

    const presenceSubscription = client.subscriptions.find(
      (subscription: any) => subscription.destination === '/topic/presence'
    );

    presenceSubscription.callback({
      body: JSON.stringify(['Adrian', 'Maria', 'Juan'])
    });

    expect(service.onlineUsers()).toEqual(['Adrian', 'Maria', 'Juan']);
  });

  it('debe enviar las notificaciones recibidas al servicio de notificaciones', () => {
    service.connect();

    const client = stompMocks.clients[0];

    client.config.onConnect();

    const notificationSubscription = client.subscriptions.find(
      (subscription: any) => subscription.destination === '/user/queue/notifications'
    );

    notificationSubscription.callback({
      body: 'Nuevo mensaje recibido'
    });

    expect(notificationMock.notify)
      .toHaveBeenCalledWith('Nuevo mensaje recibido');
  });

  it('debe actualizar el estado cuando STOMP se desconecta', () => {
    service.connect();

    const client = stompMocks.clients[0];

    client.config.onConnect();
    expect(service.connected()).toBe(true);

    client.config.onDisconnect();

    expect(service.connected()).toBe(false);
  });

  it('debe actualizar el estado cuando se cierra WebSocket', () => {
    service.connect();

    const client = stompMocks.clients[0];

    client.config.onConnect();
    client.config.onWebSocketClose({
      code: 1000,
      reason: 'Cierre normal'
    });

    expect(service.connected()).toBe(false);
  });

  it('debe gestionar los errores de WebSocket y STOMP', () => {
    service.connect();

    const client = stompMocks.clients[0];
    const errorEvent = { type: 'error' };

    client.config.onWebSocketError(errorEvent);
    client.config.onStompError({
      headers: { message: 'Error de conexión' }
    });

    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('debe desconectar y limpiar los usuarios conectados', () => {
    service.connect();

    const client = stompMocks.clients[0];

    client.config.onConnect();
    service.onlineUsers.set(['Adrian', 'Maria']);

    service.disconnect();

    expect(client.deactivate).toHaveBeenCalledOnce();
    expect(service.connected()).toBe(false);
    expect(service.onlineUsers()).toEqual([]);
  });

  it('debe limpiar el estado aunque no exista una conexión', () => {
    service.onlineUsers.set(['Adrian']);
    service.disconnect();

    expect(service.connected()).toBe(false);
    expect(service.onlineUsers()).toEqual([]);
  });
});
