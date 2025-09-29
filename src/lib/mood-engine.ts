
type Mood = 'Neutral' | 'Tense' | 'Joyful' | 'Somber' | 'Anticipation';

/**
 * The MoodEngine tracks and adjusts the emotional tone of the narrative.
 */
export class MoodEngine {
  private currentMood: Mood;

  constructor() {
    // Start with a neutral or anticipatory mood
    this.currentMood = 'Anticipation';
  }

  /**
   * Gets the current mood.
   */
  getCurrentMood(): Mood {
    return this.currentMood;
  }

  /**
   * Sets the mood explicitly.
   */
  setMood(mood: Mood) {
    this.currentMood = mood;
    console.log(`Mood updated to: ${mood}`);
  }

  /**
   * Updates the mood based on a scene's outcome or player choice.
   * This is a placeholder for more complex logic.
   */
  updateFromChoice(choiceResult: any) {
    // Example logic:
    if (choiceResult.leadsToConflict) {
      this.setMood('Tense');
    } else if (choiceResult.isPositiveResolution) {
      this.setMood('Joyful');
    }
  }
}
