# CognitivePort — API Reference

## Types

### CognitivePortConfig
```typescript
interface CognitivePortConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}
```

### CognitivePortCommand
```typescript
interface CognitivePortCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}
```

### CognitivePortResult
```typescript
interface CognitivePortResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: CognitivePortError;
  readonly duration: number;
  readonly correlationId: string;
}
```

## State Machine

States: IDLE → PROCESSING → COMPLETED → IDLE (success path)
States: IDLE → PROCESSING → ERROR → IDLE (error path)
States: IDLE → TERMINATED (shutdown path)
