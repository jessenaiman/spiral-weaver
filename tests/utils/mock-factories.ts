import {
  Story,
  Chapter,
  Arc,
  Moment,
  SceneDescriptor,
  RuntimeContext,
  PartyMember,
  PartySnapshot,
  EquipmentItem,
  EquipmentHighlight,
  BranchOption,
  SceneDiagnostics,
  DreamweaverPersonality,
  LoreReference,
  BranchingHook,
} from '@/lib/types'

// Utility functions for generating test IDs and data
export const generateTestId = (prefix: string = 'test'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateLoremText = (wordCount: number = 10): string => {
  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
    'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
    'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
    'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt',
    'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ]

  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    words.push(loremWords[Math.floor(Math.random() * loremWords.length)])
  }

  return words.join(' ')
}

// Mock data factories
export const createMockLoreReference = (overrides: Partial<LoreReference> = {}): LoreReference => ({
  id: generateTestId('lore'),
  type: 'historical',
  description: generateLoremText(5),
  ...overrides,
})

export const createMockBranchingHook = (overrides: Partial<BranchingHook> = {}): BranchingHook => ({
  hookId: generateTestId('hook'),
  condition: 'player_level > 5',
  targetMomentId: generateTestId('moment'),
  weight: Math.random() * 100,
  ...overrides,
})

export const createMockPartyMember = (overrides: Partial<PartyMember> = {}): PartyMember => ({
  id: generateTestId('member'),
  name: `Character ${Math.floor(Math.random() * 1000)}`,
  class: ['Warrior', 'Mage', 'Rogue', 'Cleric'][Math.floor(Math.random() * 4)],
  level: Math.floor(Math.random() * 50) + 1,
  ...overrides,
})

export const createMockPartySnapshot = (memberCount: number = 3, overrides: Partial<PartySnapshot> = {}): PartySnapshot => {
  const members = Array.from({ length: memberCount }, () => createMockPartyMember())

  return {
    partyId: generateTestId('party'),
    members,
    affinities: {
      courage: Math.random() * 100,
      wisdom: Math.random() * 100,
      loyalty: Math.random() * 100,
    },
    statusEffects: ['blessed', 'inspired', 'determined'].slice(0, Math.floor(Math.random() * 3) + 1),
    ...overrides,
  }
}

export const createMockEquipmentItem = (overrides: Partial<EquipmentItem> = {}): EquipmentItem => ({
  itemId: generateTestId('item'),
  name: `Item ${Math.floor(Math.random() * 1000)}`,
  description: generateLoremText(8),
  gearTags: ['weapon', 'magic', 'ancient'].slice(0, Math.floor(Math.random() * 3) + 1),
  ...overrides,
})

export const createMockEquipmentHighlight = (overrides: Partial<EquipmentHighlight> = {}): EquipmentHighlight => ({
  itemId: generateTestId('item'),
  name: `Highlighted Item ${Math.floor(Math.random() * 1000)}`,
  usageNotes: generateLoremText(6),
  ...overrides,
})

export const createMockBranchOption = (overrides: Partial<BranchOption> = {}): BranchOption => ({
  prompt: `Choice: ${generateLoremText(4)}`,
  targetMomentId: generateTestId('moment'),
  probability: Math.random() * 100,
  restrictionNotes: Math.random() > 0.5 ? generateLoremText(3) : undefined,
  ...overrides,
})

export const createMockSceneDiagnostics = (overrides: Partial<SceneDiagnostics> = {}): SceneDiagnostics => ({
  appliedRestrictions: ['combat_restricted', 'magic_limited'].slice(0, Math.floor(Math.random() * 2) + 1),
  moodAdjustments: ['tense', 'mysterious'].slice(0, Math.floor(Math.random() * 2) + 1),
  branchForecast: generateLoremText(8),
  ...overrides,
})

export const createMockMoment = (overrides: Partial<Moment> = {}): Moment => ({
  id: generateTestId('moment'),
  momentId: generateTestId('moment_id'),
  title: `Moment ${Math.floor(Math.random() * 1000)}`,
  content: generateLoremText(20),
  timeline: Array.from({ length: 3 }, () => generateLoremText(2)),
  themes: ['adventure', 'mystery', 'romance'].slice(0, Math.floor(Math.random() * 3) + 1),
  lore: Array.from({ length: 2 }, () => generateLoremText(3)),
  subtext: Array.from({ length: 2 }, () => generateLoremText(4)),
  branchingHooks: Array.from({ length: 2 }, () => createMockBranchingHook()),
  sensoryAnchors: Array.from({ length: 3 }, () => generateLoremText(2)),
  loreRefs: Array.from({ length: 2 }, () => createMockLoreReference()),
  restrictionTags: ['safe', 'mature'].slice(0, Math.floor(Math.random() * 2) + 1),
  arcId: generateTestId('arc'),
  chapterId: generateTestId('chapter'),
  storyId: generateTestId('story'),
  ...overrides,
})

export const createMockArc = (momentCount: number = 3, overrides: Partial<Arc> = {}): Arc => ({
  id: generateTestId('arc'),
  label: `Arc ${Math.floor(Math.random() * 1000)}`,
  theme: ['epic', 'tragic', 'comic'][Math.floor(Math.random() * 3)],
  moments: Array.from({ length: momentCount }, () => createMockMoment()),
  title: `Arc Title ${Math.floor(Math.random() * 1000)}`,
  chapterId: generateTestId('chapter'),
  storyId: generateTestId('story'),
  ...overrides,
})

export const createMockChapter = (arcCount: number = 2, overrides: Partial<Chapter> = {}): Chapter => ({
  id: generateTestId('chapter'),
  name: `Chapter ${Math.floor(Math.random() * 1000)}`,
  synopsis: generateLoremText(15),
  arcs: Array.from({ length: arcCount }, (_, index) => createMockArc(3, { label: `Arc ${index + 1}` })),
  metadata: {
    estimatedDuration: `${Math.floor(Math.random() * 60) + 30} minutes`,
    difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
    themes: ['adventure', 'mystery', 'romance'],
  },
  title: `Chapter Title ${Math.floor(Math.random() * 1000)}`,
  storyId: generateTestId('story'),
  ...overrides,
})

export const createMockStory = (chapterCount: number = 3, overrides: Partial<Story> = {}): Story => ({
  id: generateTestId('story'),
  title: `Story ${Math.floor(Math.random() * 1000)}`,
  summary: generateLoremText(25),
  chapters: Array.from({ length: chapterCount }, (_, index) => createMockChapter(2, { name: `Chapter ${index + 1}` })),
  ...overrides,
})

export const createMockSceneDescriptor = (overrides: Partial<SceneDescriptor> = {}): SceneDescriptor => ({
  sceneId: generateTestId('scene'),
  title: `Scene ${Math.floor(Math.random() * 1000)}`,
  narrativeText: generateLoremText(50),
  mood: ['tense', 'peaceful', 'mysterious', 'joyful'][Math.floor(Math.random() * 4)],
  assetHooks: Array.from({ length: 3 }, () => generateLoremText(2)),
  recommendedChoices: Array.from({ length: 2 }, () => generateLoremText(4)),
  partyHighlights: Array.from({ length: 2 }, () => generateLoremText(3)),
  equipmentHighlights: Array.from({ length: 2 }, () => createMockEquipmentHighlight()),
  branchOptions: Array.from({ length: 3 }, () => createMockBranchOption()),
  diagnostics: createMockSceneDiagnostics(),
  dreamweaverPersonality: ['Luminari', 'Shadow', 'Chronicler'][Math.floor(Math.random() * 3)] as DreamweaverPersonality,
  ...overrides,
})

export const createMockRuntimeContext = (overrides: Partial<RuntimeContext> = {}): RuntimeContext => ({
  chapterId: generateTestId('chapter'),
  arcId: generateTestId('arc'),
  momentId: generateTestId('moment'),
  partySnapshot: createMockPartySnapshot(),
  environmentState: 'forest_clearing',
  currentMood: 'neutral',
  ...overrides,
})

// Bulk factory methods for creating multiple entities
export const createMockStories = (count: number): Story[] => {
  return Array.from({ length: count }, () => createMockStory())
}

export const createMockChapters = (count: number): Chapter[] => {
  return Array.from({ length: count }, () => createMockChapter())
}

export const createMockArcs = (count: number): Arc[] => {
  return Array.from({ length: count }, () => createMockArc())
}

export const createMockMoments = (count: number): Moment[] => {
  return Array.from({ length: count }, () => createMockMoment())
}

// Database model factories for Prisma testing
export const createMockDbStory = (overrides: any = {}) => ({
  id: generateTestId('story'),
  storyId: generateTestId('story_id'),
  title: `DB Story ${Math.floor(Math.random() * 1000)}`,
  summary: generateLoremText(10),
  ...overrides,
})

export const createMockDbChapter = (storyId: string, overrides: any = {}) => ({
  id: generateTestId('chapter'),
  chapterId: generateTestId('chapter_id'),
  name: `DB Chapter ${Math.floor(Math.random() * 1000)}`,
  synopsis: generateLoremText(8),
  metadata: JSON.stringify({ difficulty: 'medium' }),
  storyId,
  ...overrides,
})

export const createMockDbArc = (chapterId: string, overrides: any = {}) => ({
  id: generateTestId('arc'),
  arcId: generateTestId('arc_id'),
  label: `DB Arc ${Math.floor(Math.random() * 1000)}`,
  theme: 'adventure',
  chapterId,
  ...overrides,
})

export const createMockDbMoment = (arcId: string, overrides: any = {}) => ({
  id: generateTestId('moment'),
  momentId: generateTestId('moment_id'),
  title: `DB Moment ${Math.floor(Math.random() * 1000)}`,
  content: generateLoremText(15),
  timeline: JSON.stringify(['past', 'present']),
  themes: JSON.stringify(['adventure']),
  lore: JSON.stringify(['ancient_legend']),
  subtext: JSON.stringify(['hidden_meaning']),
  narrativeBeats: generateLoremText(10),
  branchingHooks: JSON.stringify([]),
  sensoryAnchors: JSON.stringify(['forest_sounds']),
  loreRefs: JSON.stringify([]),
  restrictionTags: JSON.stringify(['safe']),
  arcId,
  ...overrides,
})