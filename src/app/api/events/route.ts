import { auth } from "@/lib/auth";
import { registerClient, unregisterClient } from "@/lib/sse";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user.organizationId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const organizationId = session.user.organizationId;
  const clientId = randomUUID();

  let controller: ReadableStreamDefaultController<Uint8Array>;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      registerClient({ id: clientId, organizationId, controller });
      // heartbeat her 30s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);
    },
    cancel() {
      unregisterClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
