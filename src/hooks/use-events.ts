"use client";

import { useEffect, useRef } from "react";

type EventHandler = (data: unknown) => void;

export function useSSE(handlers: Record<string, EventHandler>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let retryDelay = 1000;

    function connect() {
      es = new EventSource("/api/events");

      for (const event of Object.keys(handlersRef.current)) {
        es.addEventListener(event, (e: MessageEvent) => {
          try {
            handlersRef.current[event]?.(JSON.parse(e.data));
          } catch {
            handlersRef.current[event]?.(e.data);
          }
        });
      }

      es.addEventListener("open", () => {
        retryDelay = 1000;
      });

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30000);
          connect();
        }, retryDelay);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      es?.close();
    };
  }, []);
}
