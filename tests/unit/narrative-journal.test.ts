import { narrativeJournal } from '@/lib/narrative-journal';
import type { SceneDescriptor } from '@/lib/types';

describe('NarrativeJournal', () => {
  beforeEach(() => {
    // Clear the journal before each test
    narrativeJournal.clear();
  });

  test('should initialize with empty history', () => {
    const history = narrativeJournal.getHistory();
    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);
  });

  test('should log a scene to the journal', () => {
    const mockScene: SceneDescriptor = {
      sceneId: 'test-scene-1',
      title: 'Test Scene',
      narrativeText: 'This is a test narrative',
      mood: 'Neutral',
      assetHooks: [],
      recommendedChoices: [],
      partyHighlights: [],
      equipmentHighlights: [],
      branchOptions: [],
      diagnostics: {
        appliedRestrictions: [],
        moodAdjustments: [],
        branchForecast: 'Test forecast'
      },
      dreamweaverPersonality: 'Luminari'
    };

    narrativeJournal.logScene(mockScene);
    const history = narrativeJournal.getHistory();
    
    expect(history.length).toBe(1);
    expect(history[0]).toEqual(mockScene);
  });

  test('should maintain multiple scenes in history', () => {
    const mockScene1: SceneDescriptor = {
      sceneId: 'test-scene-1',
      title: 'Test Scene 1',
      narrativeText: 'First test narrative',
      mood: 'Neutral',
      assetHooks: [],
      recommendedChoices: [],
      partyHighlights: [],
      equipmentHighlights: [],
      branchOptions: [],
      diagnostics: {
        appliedRestrictions: [],
        moodAdjustments: [],
        branchForecast: 'Test forecast 1'
      },
      dreamweaverPersonality: 'Luminari'
    };

    const mockScene2: SceneDescriptor = {
      sceneId: 'test-scene-2',
      title: 'Test Scene 2',
      narrativeText: 'Second test narrative',
      mood: 'Tense',
      assetHooks: [],
      recommendedChoices: [],
      partyHighlights: [],
      equipmentHighlights: [],
      branchOptions: [],
      diagnostics: {
        appliedRestrictions: [],
        moodAdjustments: [],
        branchForecast: 'Test forecast 2'
      },
      dreamweaverPersonality: 'Shadow'
    };

    narrativeJournal.logScene(mockScene1);
    narrativeJournal.logScene(mockScene2);
    
    const history = narrativeJournal.getHistory();
    expect(history.length).toBe(2);
    expect(history[0]).toEqual(mockScene1);
    expect(history[1]).toEqual(mockScene2);
  });

  test('should return a copy of history that cant modify the internal state', () => {
    const mockScene: SceneDescriptor = {
      sceneId: 'test-scene-1',
      title: 'Test Scene',
      narrativeText: 'This is a test narrative',
      mood: 'Neutral',
      assetHooks: [],
      recommendedChoices: [],
      partyHighlights: [],
      equipmentHighlights: [],
      branchOptions: [],
      diagnostics: {
        appliedRestrictions: [],
        moodAdjustments: [],
        branchForecast: 'Test forecast'
      },
      dreamweaverPersonality: 'Luminari'
    };

    narrativeJournal.logScene(mockScene);
    const history = narrativeJournal.getHistory();
    
    // Modify the returned history
    history.push({
      sceneId: 'modified-scene',
      title: 'Modified Scene',
      narrativeText: 'Modified narrative',
      mood: 'Joyful',
      assetHooks: [],
      recommendedChoices: [],
      partyHighlights: [],
      equipmentHighlights: [],
      branchOptions: [],
      diagnostics: {
        appliedRestrictions: [],
        moodAdjustments: [],
        branchForecast: 'Modified forecast'
      },
      dreamweaverPersonality: 'Chronicler'
    });
    
    // Original journal should not be affected
    const originalHistory = narrativeJournal.getHistory();
    expect(originalHistory.length).toBe(1);
    expect(originalHistory[0].sceneId).toBe('test-scene-1');
  });

  test('should clear history', () => {
    const mockScene: SceneDescriptor = {
      sceneId: 'test-scene-1',
      title: 'Test Scene',
      narrativeText: 'This is a test narrative',
      mood: 'Neutral',
      assetHooks: [],
      recommendedChoices: [],
      partyHighlights: [],
      equipmentHighlights: [],
      branchOptions: [],
      diagnostics: {
        appliedRestrictions: [],
        moodAdjustments: [],
        branchForecast: 'Test forecast'
      },
      dreamweaverPersonality: 'Luminari'
    };

    narrativeJournal.logScene(mockScene);
    expect(narrativeJournal.getHistory().length).toBe(1);
    
    narrativeJournal.clear();
    expect(narrativeJournal.getHistory().length).toBe(0);
  });
});