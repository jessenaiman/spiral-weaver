import { ReferenceShelf } from './narrative-service';
import { MoodEngine } from './mood-engine';
import { narrativeJournal, NarrativeJournalType } from './narrative-journal';
import { SceneAssembler } from './scene-assembler';
import { RestrictionService } from './restriction-service';
import type { Moment, SceneDescriptor, RuntimeContext, DreamweaverPersonality } from './types';

/**
 * The DreamweaverDirector orchestrates the scene generation process.
 * It consults the ReferenceShelf for narrative data, applies restrictions,
 * considers the mood, and logs the results to the journal.
 */
export class DreamweaverDirector {
  public referenceShelf: ReferenceShelf;
  public moodEngine: MoodEngine;
  public journal: NarrativeJournalType;
  private sceneAssembler: SceneAssembler;
  private restrictionService: RestrictionService;

  constructor() {
    this.referenceShelf = new ReferenceShelf();
    this.moodEngine = new MoodEngine();
    this.journal = narrativeJournal;
    this.sceneAssembler = new SceneAssembler();
    this.restrictionService = new RestrictionService();
  }

  /**
   * Plans and generates the next scene based on the selected moment and context.
   */
  async generateScene(
    storyId: string,
    chapterId: string,
    arcId: string,
    momentId: string,
    dreamweaverPersonality: DreamweaverPersonality,
    userRestrictions?: string
  ): Promise<SceneDescriptor> {
    const moment = await this.referenceShelf.getMoment(storyId, chapterId, arcId, momentId);
    if (!moment) {
      throw new Error('Selected moment not found.');
    }

    // Step 1: Assemble the runtime context.
    const partySnapshot = await this.referenceShelf.snapshotParty();
    const context: RuntimeContext = {
      chapterId,
      arcId,
      momentId,
      partySnapshot,
      environmentState: 'Calm, early evening',
      currentMood: this.moodEngine.getCurrentMood(),
    };

    // Step 2: Delegate scene assembly to the SceneAssembler, now with personality.
    let sceneDescriptor = await this.sceneAssembler.buildScene(moment, context, dreamweaverPersonality);

    // Step 3: Delegate restriction application to the RestrictionService.
    const filteredResult = await this.restrictionService.applyRestrictions(
      sceneDescriptor.narrativeText,
      moment,
      userRestrictions
    );
    
    // Update the scene with the filtered content and diagnostics
    sceneDescriptor.narrativeText = filteredResult.filteredContent;
    sceneDescriptor.diagnostics.appliedRestrictions = filteredResult.appliedRestrictions;

    // Step 4: Log the final scene to the journal.
    this.journal.logScene(sceneDescriptor);
    
    return sceneDescriptor;
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
}
