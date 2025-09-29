import { ReferenceShelf } from './narrative-service';
import { MoodEngine } from './mood-engine';
import { narrativeJournal, NarrativeJournalType } from './narrative-journal';
import type { Moment, SceneDescriptor } from './types';
import { generateSceneFromMoment } from '@/ai/flows/generate-scene-from-moment';
import { applyRestrictionsToScene } from '@/ai/flows/apply-restrictions-to-scene';


/**
 * The DreamweaverDirector orchestrates the scene generation process.
 * It consults the ReferenceShelf for narrative data, applies restrictions,
 * considers the mood, and logs the results to the journal.
 */
export class DreamweaverDirector {
  public referenceShelf: ReferenceShelf;
  public moodEngine: MoodEngine;
  public journal: NarrativeJournalType;

  constructor() {
    this.referenceShelf = new ReferenceShelf();
    this.moodEngine = new MoodEngine();
    this.journal = narrativeJournal;
  }

  /**
   * Selects the next moment based on the current moment's branching hooks.
   * For now, it deterministically selects the hook with the highest weight.
   */
  async planNextScene(currentMoment: Moment): Promise<string | null> {
    if (!currentMoment.branchingHooks || currentMoment.branchingHooks.length === 0) {
      return null;
    }

    // Simple logic: pick the branch with the highest weight
    const nextBranch = currentMoment.branchingHooks.reduce((prev, current) => 
      (prev.weight > current.weight) ? prev : current
    );

    return nextBranch.targetMomentId;
  }
  
  async generateScene(momentId: string, chapterId: string, arcId: string, userRestrictions?: string): Promise<SceneDescriptor> {
    const moment = await this.referenceShelf.getMoment(chapterId, arcId, momentId, momentId);

    if (!moment) {
      throw new Error('Selected moment not found.');
    }

    // Step 1: Generate the initial scene from the moment and runtime context.
    const partySnapshot = await this.referenceShelf.snapshotParty();
    const sceneInput = {
      momentId: moment.momentId,
      content: moment.content,
      chapterId,
      arcId,
      partySnapshot,
      environmentState: "Calm, early evening",
      currentMood: this.moodEngine.getCurrentMood(),
    };
    
    let sceneDescriptor = await generateSceneFromMoment(sceneInput);

    // Step 2: Apply restrictions (both built-in and user-defined)
    const restrictionInput = {
      sceneContent: sceneDescriptor.narrativeText,
      moment, // Pass the full moment
      userRestrictions: userRestrictions,
    };
    
    const filteredResult = await applyRestrictionsToScene(restrictionInput);
    
    // Update the scene with the filtered content and add to diagnostics
    sceneDescriptor.narrativeText = filteredResult.filteredContent;
    sceneDescriptor.diagnostics.appliedRestrictions = filteredResult.appliedRestrictions;

    // Step 3: Log the scene to the journal
    this.journal.logScene(sceneDescriptor);
    
    return sceneDescriptor;
  }
}
