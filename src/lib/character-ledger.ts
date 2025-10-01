import type { PartySnapshot, PartyMember } from './types';
import partyData from './data/sample-party.json';

/**
 * The CharacterLedger manages character-related data including active party information,
 * NPC registry, and persona states.
 */
export class CharacterLedger {
  private party: PartySnapshot;
  private npcRegistry: Map<string, any>; // Using any for flexibility with NPC data
  private personaStates: Map<string, Record<string, any>>; // Flexible state tracking

  constructor() {
    this.party = partyData as PartySnapshot;
    this.npcRegistry = new Map();
    this.personaStates = new Map();
    
    // Initialize with sample data
    this.loadSampleData();
  }

  private loadSampleData() {
    // Set up basic NPC registry if needed
    // This is a sample implementation - would typically be populated from data files
    this.party.members.forEach(member => {
      // Initialize persona states for party members
      this.personaStates.set(member.id, {
        mood: 'Neutral',
        health: 100,
        affinity: {},
      });
    });
  }

  /**
   * Gets the current active party snapshot
   */
  getPartySnapshot(): PartySnapshot {
    return { ...this.party }; // Return a copy to prevent external mutations
  }

  /**
   * Updates the party snapshot
   */
  updatePartySnapshot(partySnapshot: PartySnapshot): void {
    this.party = { ...partySnapshot };
  }

  /**
   * Gets a specific party member by ID
   */
  getPartyMember(memberId: string): PartyMember | undefined {
    return this.party.members.find(member => member.id === memberId);
  }

  /**
   * Adds or updates an NPC in the registry
   */
  setNPC(npcId: string, npcData: any): void {
    this.npcRegistry.set(npcId, npcData);
  }

  /**
   * Gets an NPC from the registry
   */
  getNPC(npcId: string): any {
    return this.npcRegistry.get(npcId);
  }

  /**
   * Gets the entire NPC registry
   */
  getNPCRegistry(): Map<string, any> {
    return new Map(this.npcRegistry); // Return a copy
  }

  /**
   * Gets persona state for a character
   */
  getPersonaState(characterId: string): Record<string, any> | undefined {
    return this.personaStates.get(characterId);
  }

  /**
   * Sets persona state for a character
   */
  setPersonaState(characterId: string, state: Record<string, any>): void {
    this.personaStates.set(characterId, { ...state });
  }

  /**
   * Updates specific fields in a character's persona state
   */
  updatePersonaState(characterId: string, stateUpdates: Partial<Record<string, any>>): void {
    const currentState = this.personaStates.get(characterId) || {};
    this.personaStates.set(characterId, { ...currentState, ...stateUpdates });
  }
}