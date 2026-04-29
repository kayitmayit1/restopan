"use client";

import { useEffect, useRef } from "react";

export function useOrderSound(enabled = true) {
  const audioCtx = useRef<AudioContext | null>(null);

  function playBeep() {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new AudioContext();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";

      // Two-tone ding: 880Hz then 1100Hz
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* user hasn't interacted yet — ignore */ }
  }

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource("/api/events");
    es.onmessage = (e) => {
      try {
        const { event } = JSON.parse(e.data);
        if (event === "order:new") playBeep();
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, [enabled]);

  return { playBeep };
}
