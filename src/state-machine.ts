/**
 * Cognitive Port — State Machine
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

import { CognitivePortState, StateTransition } from "./types";

type TransitionGuard = () => boolean;

interface TransitionRule {
  from: CognitivePortState;
  to: CognitivePortState;
  trigger: string;
  guard?: TransitionGuard;
}

export class CognitivePortStateMachine {
  private currentState: CognitivePortState;
  private readonly transitions: TransitionRule[];
  private readonly history: StateTransition[];

  constructor(initialState: CognitivePortState = CognitivePortState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = this.defineTransitions();
  }

  private defineTransitions(): TransitionRule[] {
    return [
      { from: CognitivePortState.IDLE, to: CognitivePortState.INITIALIZING, trigger: "initialize" },
      { from: CognitivePortState.INITIALIZING, to: CognitivePortState.READY, trigger: "initialized" },
      { from: CognitivePortState.INITIALIZING, to: CognitivePortState.ERROR, trigger: "initError" },
      { from: CognitivePortState.READY, to: CognitivePortState.PROCESSING, trigger: "process" },
      { from: CognitivePortState.PROCESSING, to: CognitivePortState.COMPLETED, trigger: "complete" },
      { from: CognitivePortState.PROCESSING, to: CognitivePortState.ERROR, trigger: "processError" },
      { from: CognitivePortState.COMPLETED, to: CognitivePortState.READY, trigger: "reset" },
      { from: CognitivePortState.ERROR, to: CognitivePortState.READY, trigger: "recover" },
      { from: CognitivePortState.ERROR, to: CognitivePortState.TERMINATED, trigger: "terminate" },
      { from: CognitivePortState.READY, to: CognitivePortState.TERMINATED, trigger: "terminate" },
      { from: CognitivePortState.IDLE, to: CognitivePortState.TERMINATED, trigger: "terminate" },
    ];
  }

  getState(): CognitivePortState {
    return this.currentState;
  }

  getHistory(): ReadonlyArray<StateTransition> {
    return [...this.history];
  }

  canTransition(trigger: string): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.trigger === trigger
    );
  }

  transition(trigger: string): StateTransition {
    const rule = this.transitions.find(
      (t) => t.from === this.currentState && t.trigger === trigger
    );

    if (!rule) {
      throw new Error(
        `Invalid transition: ${trigger} from state ${this.currentState}`
      );
    }

    const guardResult = rule.guard ? rule.guard() : true;
    if (!guardResult) {
      throw new Error(
        `Transition guard failed: ${trigger} from ${this.currentState}`
      );
    }

    const transition: StateTransition = {
      from: this.currentState,
      to: rule.to,
      trigger,
      timestamp: Date.now(),
      guardResult,
    };

    this.currentState = rule.to;
    this.history.push(transition);
    return transition;
  }

  reset(): void {
    this.currentState = CognitivePortState.IDLE;
    this.history.length = 0;
  }
}
