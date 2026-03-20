type MessageHandler = (data: ArrayBuffer | string) => void;

interface WSChannel {
  handlers: Set<MessageHandler>;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private channels: Map<string, WSChannel> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private lastPongTime: number = 0;
  private _rtt: number = 0;
  private _connected: boolean = false;
  private token: string | null = null;

  constructor(url: string) {
    this.url = url;
  }

  get connected(): boolean {
    return this._connected;
  }

  get rtt(): number {
    return this._rtt;
  }

  connect(token?: string): void {
    this.token = token ?? null;
    const wsUrl = token ? `${this.url}?token=${token}` : this.url;

    this.ws = new WebSocket(wsUrl);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this._connected = true;
      this.reconnectAttempts = 0;
      this.startPingPong();
    };

    this.ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data) as { channel: string; data: string };
          if (msg.channel === '__pong') {
            this._rtt = Date.now() - this.lastPongTime;
            return;
          }
          const channel = this.channels.get(msg.channel);
          if (channel) {
            for (const handler of channel.handlers) {
              handler(msg.data);
            }
          }
        } catch {
          // Non-JSON string message
        }
      } else if (event.data instanceof ArrayBuffer) {
        const view = new DataView(event.data);
        const channelId = view.getUint8(0);
        const channelName = this.channelIdToName(channelId);
        const channel = this.channels.get(channelName);
        if (channel) {
          const payload = event.data.slice(1);
          for (const handler of channel.handlers) {
            handler(payload);
          }
        }
      }
    };

    this.ws.onclose = () => {
      this._connected = false;
      this.stopPingPong();
      this.attemptReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.stopPingPong();
    this.ws?.close();
    this._connected = false;
  }

  subscribe(channel: string, handler: MessageHandler): () => void {
    let ch = this.channels.get(channel);
    if (!ch) {
      ch = { handlers: new Set() };
      this.channels.set(channel, ch);
    }
    ch.handlers.add(handler);
    return () => ch!.handlers.delete(handler);
  }

  send(channel: string, data: string | ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    if (typeof data === 'string') {
      this.ws.send(JSON.stringify({ channel, data }));
    } else {
      const channelId = this.channelNameToId(channel);
      const payload = new Uint8Array(1 + data.byteLength);
      payload[0] = channelId;
      payload.set(new Uint8Array(data), 1);
      this.ws.send(payload.buffer);
    }
  }

  private startPingPong(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.lastPongTime = Date.now();
        this.ws.send(JSON.stringify({ channel: '__ping' }));
      }
    }, 5000);
  }

  private stopPingPong(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.token ?? undefined);
    }, delay);
  }

  private channelNameToId(name: string): number {
    const map: Record<string, number> = {
      chat: 1,
      telemetry: 2,
      game_state: 3,
    };
    return map[name] ?? 0;
  }

  private channelIdToName(id: number): string {
    const map: Record<number, string> = {
      1: 'chat',
      2: 'telemetry',
      3: 'game_state',
    };
    return map[id] ?? 'unknown';
  }
}
