/**
 * Cognitive Port — Main Orchestrator
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

import {
  CognitivePortConfig,
  CognitivePortState,
  CognitivePortRequest,
  CognitivePortResult,
  CognitivePortError,
  AuditEntry,
  OperationMetrics,
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
  private activeTasks: number = 0;

  constructor(
    config: CognitivePortConfig,
    storage?: ICognitivePortStorage,
    events?: ICognitivePortEvents,
    observability?: ICognitivePortObservability
  ) {
    this.entity = new CognitivePortEntity(config);
    this.stateMachine = new CognitivePortStateMachine();
    this.storage = storage ?? new InMemoryCognitivePortStorage();
    this.events = events ?? new CognitivePortEventBus();
    this.observability = observability ?? new DefaultCognitivePortObservability();
  }

  async initialize(): Promise<void> {
    const span = this.observability.startSpan("initialize");
    try {
      if (!this.entity.validate()) {
        throw new Error("Entity validation failed");
      }

      const transition = this.stateMachine.transition("initialize");
      this.events.emitStateChange(transition);
      this.observability.log("INFO", "Initializing Cognitive Port");

      await this.storage.saveConfig(this.entity.getConfig());

      const readyTransition = this.stateMachine.transition("initialized");
      this.entity.setState(CognitivePortState.READY);
      this.events.emitStateChange(readyTransition);
      this.observability.log("INFO", "Cognitive Port initialized successfully");
    } catch (error) {
      this.handleError(error as Error, "initialize");
      throw error;
    } finally {
      span.end();
    }
  }

  async process(request: CognitivePortRequest): Promise<CognitivePortResult> {
    const span = this.observability.startSpan("process");
    const startTime = Date.now();

    try {
      if (this.activeTasks >= this.entity.getConfig().maxConcurrency) {
        throw new Error("Max concurrency reached");
      }

      this.activeTasks++;
      const transition = this.stateMachine.transition("process");
      this.entity.setState(CognitivePortState.PROCESSING);
      this.events.emitStateChange(transition);

      this.emitAuditEntry("process_start", request.context.agentId, {
        requestId: request.requestId,
        priority: request.priority,
      });

      // Core processing logic
      const resultData = await this.executeProcessing(request);

      const completeTransition = this.stateMachine.transition("complete");
      this.entity.setState(CognitivePortState.COMPLETED);
      this.events.emitStateChange(completeTransition);
      this.entity.incrementProcessed();

      const metrics: OperationMetrics = {
        durationMs: Date.now() - startTime,
        memoryUsedBytes: process.memoryUsage?.().heapUsed ?? 0,
        stateTransitions: 2,
        eventsEmitted: 1,
      };
      this.events.emitMetric(metrics);

      const result: CognitivePortResult = {
        requestId: request.requestId,
        success: true,
        data: resultData,
        metrics,
        auditTrail: this.entity.getAuditLog().slice(-10) as AuditEntry[],
        timestamp: Date.now(),
      };

      await this.storage.saveResult(result);

      // Reset to ready
      const resetTransition = this.stateMachine.transition("reset");
      this.entity.setState(CognitivePortState.READY);
      this.events.emitStateChange(resetTransition);

      return result;
    } catch (error) {
      return this.handleProcessError(request, error as Error, startTime);
    } finally {
      this.activeTasks--;
      span.end();
    }
  }

  private async executeProcessing(request: CognitivePortRequest): Promise<Record<string, unknown>> {
    // Simulate processing with timeout enforcement
    const config = this.entity.getConfig();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Processing timeout")), config.timeoutMs)
    );

    const processingPromise = (async () => {
      return {
        processed: true,
        organelleId: this.entity.getId(),
        requestId: request.requestId,
        processedAt: Date.now(),
      };
    })();

    return Promise.race([processingPromise, timeoutPromise]);
  }

  private handleProcessError(
    request: CognitivePortRequest,
    error: Error,
    startTime: number
  ): CognitivePortResult {
    this.entity.incrementErrors();
    const errorObj: CognitivePortError = {
      code: "PROCESSING_ERROR",
      message: error.message,
      category: "PROCESSING",
      recoverable: true,
    };
    this.events.emitError(errorObj);

    try {
      this.stateMachine.transition("processError");
      this.entity.setState(CognitivePortState.ERROR);
      this.stateMachine.transition("recover");
      this.entity.setState(CognitivePortState.READY);
    } catch {
      // State recovery failed
    }

    return {
      requestId: request.requestId,
      success: false,
      error: errorObj,
      metrics: {
        durationMs: Date.now() - startTime,
        memoryUsedBytes: 0,
        stateTransitions: 2,
        eventsEmitted: 1,
      },
      auditTrail: [],
      timestamp: Date.now(),
    };
  }

  private handleError(error: Error, operation: string): void {
    this.observability.log("ERROR", `${operation} failed: ${error.message}`);
    const errorObj: CognitivePortError = {
      code: `${operation.toUpperCase()}_ERROR`,
      message: error.message,
      category: "INTERNAL",
      recoverable: false,
    };
    this.events.emitError(errorObj);
  }

  private emitAuditEntry(
    operation: string,
    agentId: string,
    details: Record<string, unknown>
  ): void {
    const entry: AuditEntry = {
      entryId: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      organelleId: this.entity.getId(),
      operation,
      agentId,
      timestamp: Date.now(),
      details,
    };
    this.entity.addAuditEntry(entry);
    this.storage.saveAuditEntry(entry).catch(() => {});
  }

  getState(): CognitivePortState {
    return this.entity.getState();
  }

  getEntity(): Readonly<Record<string, unknown>> {
    return this.entity.toJSON();
  }

  async terminate(): Promise<void> {
    const span = this.observability.startSpan("terminate");
    try {
      this.stateMachine.transition("terminate");
      this.entity.setState(CognitivePortState.TERMINATED);
      this.observability.log("INFO", "Cognitive Port terminated");
    } finally {
      span.end();
    }
  }
}
