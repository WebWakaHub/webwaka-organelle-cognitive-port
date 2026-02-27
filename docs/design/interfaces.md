# CognitivePort — Interface Contracts

## Primary Interface

```typescript
interface ICognitivePort {
  readonly id: string;
  readonly state: CognitivePortState;
  
  execute(command: CognitivePortCommand): Promise<CognitivePortResult>;
  query(query: CognitivePortQuery): CognitivePortQueryResult;
  reset(): void;
  terminate(): void;
  getMetrics(): OperationMetrics;
}
```

## Storage Interface

```typescript
interface ICognitivePortStorage {
  save(entity: CognitivePortEntity): Promise<void>;
  load(id: string): Promise<CognitivePortEntity | null>;
  delete(id: string): Promise<boolean>;
}
```

## Event Interface

```typescript
interface ICognitivePortEvents {
  emit(event: CognitivePortEvent): void;
  subscribe(handler: (event: CognitivePortEvent) => void): () => void;
}
```
