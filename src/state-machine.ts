/**
 * CognitivePort — State Machine
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

import { CognitivePortState } from "./types";

interface Transition {
  from: CognitivePortState;
  to: CognitivePortState;
  guard?: () => boolean;
}

export class CognitivePortStateMachine {
  private currentState: CognitivePortState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: CognitivePortState; to: CognitivePortState; timestamp: number }>;

  constructor(initialState: CognitivePortState = CognitivePortState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: CognitivePortState.IDLE, to: CognitivePortState.PROCESSING },
      { from: CognitivePortState.PROCESSING, to: CognitivePortState.COMPLETED },
      { from: CognitivePortState.PROCESSING, to: CognitivePortState.ERROR },
      { from: CognitivePortState.COMPLETED, to: CognitivePortState.IDLE },
      { from: CognitivePortState.ERROR, to: CognitivePortState.IDLE },
      { from: CognitivePortState.IDLE, to: CognitivePortState.TERMINATED },
    ];
  }

  getState(): CognitivePortState {
    return this.currentState;
  }

  canTransition(to: CognitivePortState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: CognitivePortState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: CognitivePortState; to: CognitivePortState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === CognitivePortState.ERROR || this.currentState === CognitivePortState.COMPLETED) {
      this.transition(CognitivePortState.IDLE);
    }
  }
}
