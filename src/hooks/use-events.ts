"use client";

import { useEffect, useRef } from "react";

type EventHandler = (data: unknown) => void;

export function useSSE(handlers: Record<string, EventHandler>) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const es = new EventSource("/api/events");

    const registered: string[] = [];

    for (const event of Object.keys(handlersRef.current)) {
      const fn = (e: MessageEvent) => {
        try {
          handlersRef.current[event]?.(JSON.parse(e.data));
        } catch {
          handlersRef.current[event]?.(e.data);
        }
      };
      es.addEventListener(event, fn);
      registered.push(event);
    }

    return () => {
      es.close();
    };
  }, []);
}
