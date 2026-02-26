/**
 * Cognitive Port — Storage Interface
 * Organelle: ORGN-AI-COGNITIVE_PORT-v0.1.0
 */

import { CognitivePortConfig, CognitivePortResult, AuditEntry } from "./types";

export interface ICognitivePortStorage {
  saveConfig(config: CognitivePortConfig): Promise<void>;
  loadConfig(id: string): Promise<CognitivePortConfig | null>;
  saveResult(result: CognitivePortResult): Promise<void>;
  loadResult(requestId: string): Promise<CognitivePortResult | null>;
  saveAuditEntry(entry: AuditEntry): Promise<void>;
  queryAuditLog(organelleId: string, limit: number): Promise<AuditEntry[]>;
  clear(): Promise<void>;
}

export class InMemoryCognitivePortStorage implements ICognitivePortStorage {
  private configs: Map<string, CognitivePortConfig> = new Map();
  private results: Map<string, CognitivePortResult> = new Map();
  private auditEntries: AuditEntry[] = [];

  async saveConfig(config: CognitivePortConfig): Promise<void> {
    this.configs.set(config.id, { ...config });
  }

  async loadConfig(id: string): Promise<CognitivePortConfig | null> {
    return this.configs.get(id) ?? null;
  }

  async saveResult(result: CognitivePortResult): Promise<void> {
    this.results.set(result.requestId, { ...result });
  }

  async loadResult(requestId: string): Promise<CognitivePortResult | null> {
    return this.results.get(requestId) ?? null;
  }

  async saveAuditEntry(entry: AuditEntry): Promise<void> {
    this.auditEntries.push({ ...entry });
  }

  async queryAuditLog(organelleId: string, limit: number): Promise<AuditEntry[]> {
    return this.auditEntries
      .filter((e) => e.organelleId === organelleId)
      .slice(-limit);
  }

  async clear(): Promise<void> {
    this.configs.clear();
    this.results.clear();
    this.auditEntries.length = 0;
  }
}
