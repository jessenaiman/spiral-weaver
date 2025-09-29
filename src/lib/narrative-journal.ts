import type { SceneDescriptor } from './types';

/**
 * The NarrativeJournal logs the sequence of generated scenes,
 * creating a timeline of the user's playthrough.
 * 
 * This is a simple in-memory implementation.
 */
class Journal {
  public history: SceneDescriptor[] = [];

  logScene(scene: SceneDescriptor) {
    this.history.push(scene);
    console.log(`Logged scene: ${scene.sceneId}. Total scenes in journal: ${this.history.length}`);
  }

  getHistory(): SceneDescriptor[] {
    return [...this.history];
  }
  
  clear() {
    this.history = [];
  }
}

// Export a singleton instance
export const narrativeJournal = new Journal();

// Re-export the type for use in other files
export type NarrativeJournalType = Journal;
