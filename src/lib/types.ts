// 1.1 Narrative Data Model
export interface LoreReference {
  id: string;
  type: string;
  description: string;
}

export interface BranchingHook {
  hookId: string;
  condition: string;
  targetMomentId: string;
  weight: number;
}

export interface Moment {
  momentId: string;
  title: string;
  content: string; // Replaces narrativeBeats
  timeline: string[];
  themes: string[];
  lore: string[];
  subtext: string[];
  branchingHooks: BranchingHook[];
  sensoryAnchors: string[];
  loreRefs: LoreReference[];
  restrictionTags: string[];
  // Added for easy lookup
  arcId: string;
  chapterId: string;
}

export interface Arc {
  arcId: string;
  label: string;
  theme: string;
  moments: Moment[];
}

export interface Chapter {
  chapterId: string;
  name: string;
  synopsis: string;
  arcs: Arc[];
  metadata: Record<string, any>;
}

export interface Story {
  storyId: string;
  title: string;
  summary: string;
  chapters: Chapter[];
}

// 1.2 Dreamweaver Orchestration Model
export interface PartyMember {
  id: string;
  name: string;
  class: string;
  level: number;
}

export interface PartySnapshot {
  partyId: string;
  members: PartyMember[];
  affinities: Record<string, number>;
  statusEffects: string[];
}

export interface EquipmentItem {
  itemId: string;
  name: string;
  description: string;
  gearTags: string[];
}

export interface EquipmentHighlight {
  itemId: string;
  name: string;
  usageNotes: string;
}

export interface BranchOption {
  prompt: string;
  targetMomentId: string;
  probability: number;
  restrictionNotes?: string;
}

export interface SceneDiagnostics {
  appliedRestrictions: string[];
  moodAdjustments: string[];
  branchForecast: string;
}

export interface SceneDescriptor {
  sceneId: string;
  title: string;
  narrativeText: string;
  mood: string;
  assetHooks: string[];
  recommendedChoices: string[];
  partyHighlights: string[];
  equipmentHighlights: EquipmentHighlight[];
  branchOptions: BranchOption[];
  diagnostics: SceneDiagnostics;
}

export interface RuntimeContext {
  chapterId: string;
  arcId: string;
  momentId: string;
  partySnapshot: PartySnapshot;
  environmentState: string;
}

// 1.3 Demo Flow
export interface SceneDeskViewModel {
  stories: Story[];
  chapters: Chapter[];
  arcs: Arc[];
  moments: Moment[];
  currentScene?: SceneDescriptor;
  diagnostics?: SceneDiagnostics;
}
