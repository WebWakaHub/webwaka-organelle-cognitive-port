/**
 * CognitivePort — Orchestrator (Main Entry Point)
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

import {
  CognitivePortConfig,
  CognitivePortState,
  CognitivePortCommand,
  CognitivePortResult,
  CognitivePortQuery,
  CognitivePortQueryResult,
  CognitivePortEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { CognitivePortEntity } from "./cognitive-port-entity";
import { CognitivePortStateMachine } from "./state-machine";
import { ICognitivePortStorage, InMemoryCognitivePortStorage } from "./storage-interface";
import { ICognitivePortEvents, CognitivePortEventBus } from "./event-interface";
import { ICognitivePortObservability, DefaultCognitivePortObservability } from "./observability-interface";

export class CognitivePortOrchestrator {
  private entity: CognitivePortEntity;
  private stateMachine: CognitivePortStateMachine;
  private storage: ICognitivePortStorage;
  private events: ICognitivePortEvents;
  private observability: ICognitivePortObservability;

  constructor(
    config: CognitivePortConfig,
    storage?: ICognitivePortStorage,
    events?: ICognitivePortEvents,
    observability?: ICognitivePortObservability,
  ) {
    this.entity = new CognitivePortEntity(config);
    this.stateMachine = new CognitivePortStateMachine();
    this.storage = storage ?? new InMemoryCognitivePortStorage();
    this.events = events ?? new CognitivePortEventBus();
    this.observability = observability ?? new DefaultCognitivePortObservability(config.id);

    this.observability.log("INFO", `CognitivePort orchestrator initialized`, { id: config.id });
  }

  async execute(command: CognitivePortCommand): Promise<CognitivePortResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `CognitivePort.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
        source: this.entity.getId(),
        data: { command: command.type, success: result.success },
        timestamp: Date.now(),
        correlationId: command.correlationId,
      });

      this.observability.recordMetric("command.duration", result.duration);
      return result;
    } finally {
      span.end();
    }
  }

  query(query: CognitivePortQuery): CognitivePortQueryResult {
    const span = this.observability.createSpan("query");
    try {
      return {
        data: {
          state: this.entity.getState(),
          metrics: this.entity.getMetrics(),
          snapshot: this.entity.toSnapshot(),
        },
        timestamp: Date.now(),
      };
    } finally {
      span.end();
    }
  }

  getState(): CognitivePortState {
    return this.entity.getState();
  }

  getMetrics(): OperationMetrics {
    return this.entity.getMetrics();
  }

  getTelemetry(): TelemetryData {
    return {
      organelleId: this.entity.getId(),
      state: this.entity.getState(),
      metrics: this.entity.getMetrics(),
      timestamp: Date.now(),
    };
  }

  async reset(): Promise<void> {
    this.observability.log("INFO", "Resetting organelle");
    this.stateMachine.reset();
  }

  async terminate(): Promise<void> {
    const span = this.observability.createSpan("terminate");
    try {
      this.observability.log("INFO", "CognitivePort terminated");
    } finally {
      span.end();
    }
  }
}
