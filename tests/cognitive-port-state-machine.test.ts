/**
 * CognitivePort State Machine — Unit Tests
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

import { CognitivePortStateMachine } from "../src/state-machine";
import { CognitivePortState } from "../src/types";

describe("CognitivePortStateMachine", () => {
  let sm: CognitivePortStateMachine;

  beforeEach(() => {
    sm = new CognitivePortStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(CognitivePortState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(CognitivePortState.PROCESSING)).toBe(true);
    sm.transition(CognitivePortState.PROCESSING);
    expect(sm.getState()).toBe(CognitivePortState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(CognitivePortState.PROCESSING);
    sm.transition(CognitivePortState.COMPLETED);
    expect(sm.getState()).toBe(CognitivePortState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(CognitivePortState.PROCESSING);
    sm.transition(CognitivePortState.ERROR);
    expect(sm.getState()).toBe(CognitivePortState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(CognitivePortState.PROCESSING);
    sm.transition(CognitivePortState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(CognitivePortState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(CognitivePortState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(CognitivePortState.PROCESSING);
    sm.transition(CognitivePortState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(CognitivePortState.IDLE);
    expect(history[0].to).toBe(CognitivePortState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(CognitivePortState.TERMINATED);
    expect(sm.getState()).toBe(CognitivePortState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(CognitivePortState.TERMINATED);
    expect(sm.canTransition(CognitivePortState.IDLE)).toBe(false);
  });
});
