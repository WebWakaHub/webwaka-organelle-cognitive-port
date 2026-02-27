# CognitivePort Organelle

**Organelle ID:** ORGN-AI-COGNITIVE_PORT-v0.1.0
**Version:** 0.1.0
**Layer:** Organelle (smallest functional unit in WebWaka biological hierarchy)

## Overview

The CognitivePort organelle provides a self-contained, deterministic functional unit
within the WebWaka system. It encapsulates domain-specific logic behind well-defined
interfaces and communicates through typed events.

## Architecture

```
┌─────────────────────────────────────────┐
│         CognitivePortOrchestrator                 │
│                                         │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │  State    │  │  CognitivePortEntity          │ │
│  │  Machine  │  │  (Domain Logic)      │ │
│  └──────────┘  └──────────────────────┘ │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │ Storage   │  │ Events   │  │ Obs.  │ │
│  │ Interface │  │ Interface│  │ Port  │ │
│  └──────────┘  └──────────┘  └───────┘ │
└─────────────────────────────────────────┘
```

## Quick Start

```typescript
import { CognitivePortOrchestrator } from "@webwaka/organelle-cognitive-port";

const orchestrator = new CognitivePortOrchestrator({
  id: "my-cognitive-port",
  name: "My CognitivePort",
  maxConcurrency: 5,
  timeoutMs: 30000,
  retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 },
});

const result = await orchestrator.execute({
  type: "CREATE",
  payload: { name: "example" },
  correlationId: "corr-001",
  timestamp: Date.now(),
});
```

## API Reference

### CognitivePortOrchestrator

| Method | Returns | Description |
|:-------|:--------|:------------|
| `execute(command)` | `Promise<Result>` | Execute a command |
| `query(query)` | `QueryResult` | Query current state |
| `getState()` | `State` | Get current state |
| `getMetrics()` | `OperationMetrics` | Get operation metrics |
| `getTelemetry()` | `TelemetryData` | Get telemetry data |
| `reset()` | `Promise<void>` | Reset to IDLE |
| `terminate()` | `Promise<void>` | Terminate organelle |

## Testing

```bash
npm test          # Run all tests
npm test -- --coverage  # Run with coverage
```

## License

WebWaka Internal — All Rights Reserved
