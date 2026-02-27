/**
 * CognitivePort — Event Interface
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

import { CognitivePortEvent } from "./types";

type EventHandler = (event: CognitivePortEvent) => void;

export interface ICognitivePortEvents {
  emit(event: CognitivePortEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class CognitivePortEventBus implements ICognitivePortEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: CognitivePortEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: CognitivePortEvent): void {
    this.eventCount++;
    this.eventLog.push(event);
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Event handler error:`, error);
      }
    }
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  getEventCount(): number {
    return this.eventCount;
  }

  getEventLog(): ReadonlyArray<CognitivePortEvent> {
    return [...this.eventLog];
  }
}
