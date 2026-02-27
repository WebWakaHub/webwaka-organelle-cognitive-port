/**
 * CognitivePort — Core Type Definitions
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

export enum CognitivePortState {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  TERMINATED = "TERMINATED",
}

export interface CognitivePortConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffMs: number;
  readonly backoffMultiplier: number;
}

export interface CognitivePortCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}

export interface CognitivePortResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: CognitivePortError;
  readonly duration: number;
  readonly correlationId: string;
}

export interface CognitivePortQuery {
  readonly type: string;
  readonly filters?: Record<string, unknown>;
}

export interface CognitivePortQueryResult {
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
}

export interface CognitivePortEvent {
  readonly type: string;
  readonly source: string;
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
  readonly correlationId: string;
}

export interface CognitivePortError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface AuditEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly action: string;
  readonly actor: string;
  readonly before: string;
  readonly after: string;
  readonly correlationId: string;
}

export interface OperationMetrics {
  readonly totalOperations: number;
  readonly successCount: number;
  readonly errorCount: number;
  readonly averageDuration: number;
  readonly lastOperationAt: number;
}

export interface TelemetryData {
  readonly organelleId: string;
  readonly state: CognitivePortState;
  readonly metrics: OperationMetrics;
  readonly timestamp: number;
}
