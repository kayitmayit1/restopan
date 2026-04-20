type SSEController = ReadableStreamDefaultController<Uint8Array>;

interface SSEClient {
  id: string;
  organizationId: string;
  controller: SSEController;
}

const clients = new Map<string, SSEClient>();

export function registerClient(client: SSEClient) {
  clients.set(client.id, client);
}

export function unregisterClient(id: string) {
  clients.delete(id);
}

export function broadcast(
  organizationId: string,
  event: string,
  data: unknown
) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = new TextEncoder().encode(message);
  for (const client of clients.values()) {
    if (client.organizationId === organizationId) {
      try {
        client.controller.enqueue(encoded);
      } catch {
        clients.delete(client.id);
      }
    }
  }
}
