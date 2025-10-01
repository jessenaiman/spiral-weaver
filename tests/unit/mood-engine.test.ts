import { MoodEngine } from '@/lib/mood-engine';

describe('MoodEngine', () => {
  let moodEngine: MoodEngine;

  beforeEach(() => {
    moodEngine = new MoodEngine();
  });

  test('should initialize with a default mood', () => {
    const currentMood = moodEngine.getCurrentMood();
    expect(currentMood).toBeDefined();
    expect(['Neutral', 'Tense', 'Joyful', 'Somber', 'Anticipation']).toContain(currentMood);
  });

  test('should set mood explicitly', () => {
    moodEngine.setMood('Tense');
    const mood = moodEngine.getCurrentMood();
    expect(mood).toBe('Tense');
    
    moodEngine.setMood('Joyful');
    const newMood = moodEngine.getCurrentMood();
    expect(newMood).toBe('Joyful');
  });

  test('should update mood based on choice result', () => {
    // Initial mood
    const initialMood = moodEngine.getCurrentMood();
    
    // Update mood based on conflict-inducing choice
    moodEngine.updateFromChoice({ leadsToConflict: true });
    expect(moodEngine.getCurrentMood()).toBe('Tense');
    
    // Update mood based on positive resolution
    moodEngine.updateFromChoice({ isPositiveResolution: true });
    expect(moodEngine.getCurrentMood()).toBe('Joyful');
  });

  test('should handle complex choice results', () => {
    moodEngine.updateFromChoice({ 
      leadsToConflict: true, 
      isPositiveResolution: false 
    });
    expect(moodEngine.getCurrentMood()).toBe('Tense');

    moodEngine.setMood('Neutral');
    moodEngine.updateFromChoice({ 
      leadsToConflict: false, 
      isPositiveResolution: true 
    });
    expect(moodEngine.getCurrentMood()).toBe('Joyful');
  });
});