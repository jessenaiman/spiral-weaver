// Mock all dependencies FIRST before imports
jest.mock('@/lib/narrative-service')
jest.mock('@/lib/scene-assembler')
jest.mock('@/lib/restriction-service')
jest.mock('@/ai/genkit', () => ({
  genkit: jest.fn(),
}))
jest.mock('@/ai/flows/apply-restrictions-to-scene', () => ({
  applyRestrictionsToScene: jest.fn(),
}))
jest.mock('@/lib/mood-engine')
jest.mock('@/lib/narrative-journal', () => ({
  narrativeJournal: {
    logScene: jest.fn()
  }
}))

import { DreamweaverDirector } from '@/lib/dreamweaver-director'
import { ReferenceShelf } from '@/lib/narrative-service'
import { MoodEngine } from '@/lib/mood-engine'
import { narrativeJournal, NarrativeJournalType } from '@/lib/narrative-journal'
import { SceneAssembler } from '@/lib/scene-assembler'
import { RestrictionService } from '@/lib/restriction-service'
import {
  createMockMoment,
  createMockRuntimeContext,
  createMockSceneDescriptor,
  generateTestId
} from '../utils/mock-factories'
import {
  validateSceneDescriptorStructure,
  expectToThrowWithMessage,
  waitFor
} from '../utils/test-helpers'

// Mock instances
let mockSceneAssembler: jest.Mocked<SceneAssembler>
let mockRestrictionService: jest.Mocked<RestrictionService>
let mockReferenceShelf: jest.Mocked<ReferenceShelf>;
let mockMoodEngine: jest.Mocked<MoodEngine>;
const mockJournal = jest.mocked(narrativeJournal)

describe('DreamweaverDirector', () => {
  let director: DreamweaverDirector

  beforeEach(() => {
    director = new DreamweaverDirector()
    
    // Mock the methods on the actual instances using jest.spyOn
    mockReferenceShelf = director.referenceShelf as jest.Mocked<ReferenceShelf>;
    mockMoodEngine = director.moodEngine as jest.Mocked<MoodEngine>;
    
    // Replace the method implementations with mocks
    mockReferenceShelf.getMoment = jest.fn();
    mockReferenceShelf.snapshotParty = jest.fn();
    mockReferenceShelf.getStories = jest.fn();
    mockReferenceShelf.getStory = jest.fn();
    mockReferenceShelf.getChapter = jest.fn();
    mockReferenceShelf.getArc = jest.fn();
    mockReferenceShelf.getMomentBundle = jest.fn();
    mockReferenceShelf.getNPC = jest.fn();
    mockReferenceShelf.listAvailableEquipment = jest.fn();
    mockReferenceShelf.getEquipmentForParty = jest.fn();
    mockReferenceShelf.getLoreByReference = jest.fn();
    mockReferenceShelf.getSavedScenesForMoment = jest.fn();
    
    mockMoodEngine.getCurrentMood = jest.fn().mockReturnValue('Neutral');
    mockMoodEngine.setMood = jest.fn();
    mockMoodEngine.updateFromChoice = jest.fn();
    
    mockSceneAssembler = (director as any).sceneAssembler as jest.Mocked<SceneAssembler>
    mockRestrictionService = (director as any).restrictionService as jest.Mocked<RestrictionService>

    // Setup default mocks
    ;(director.journal.logScene as jest.Mock).mockImplementation(() => {})

    // Clear mocks before each test
    jest.clearAllMocks();
  })

  describe('generateScene', () => {
    const mockStoryId = generateTestId('story')
    const mockChapterId = generateTestId('chapter')
    const mockArcId = generateTestId('arc')
    const mockMomentId = generateTestId('moment')
    const mockPersonality: any = 'Luminari'
    const mockMoment = createMockMoment()

    beforeEach(() => {
      // Mocks are set in individual tests to avoid chaining issues
    })

    it('should successfully generate a scene with valid inputs', async () => {
      // Arrange
      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })

      const expectedSceneDescriptor = createMockSceneDescriptor({
        sceneId: generateTestId('scene'),
        dreamweaverPersonality: mockPersonality
      })
      const restrictionResult = {
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: ['test-restriction']
      }

      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue(restrictionResult)

      const result = await director.generateScene(
        mockStoryId,
        mockChapterId,
        mockArcId,
        mockMomentId,
        mockPersonality
      )

      // Assert
      expect(mockReferenceShelf.getMoment).toHaveBeenCalledWith(
        mockStoryId,
        mockChapterId,
        mockArcId,
        mockMomentId
      )
      expect(mockReferenceShelf.snapshotParty).toHaveBeenCalled()
      expect(mockMoodEngine.getCurrentMood).toHaveBeenCalled()
      expect(mockSceneAssembler.buildScene).toHaveBeenCalledWith(
        mockMoment,
        expect.objectContaining({
          chapterId: mockChapterId,
          arcId: mockArcId,
          momentId: mockMomentId,
          currentMood: 'Neutral',
          environmentState: 'Calm, early evening',
        }),
        mockPersonality
      )
      expect(mockRestrictionService.applyRestrictions).toHaveBeenCalledWith(
        expectedSceneDescriptor.narrativeText,
        mockMoment,
        undefined
      )
      expect(mockJournal.logScene).toHaveBeenCalledWith(expectedSceneDescriptor)
      expect(result).toEqual(expectedSceneDescriptor)
      validateSceneDescriptorStructure(result)
    })

    it('should handle moment not found error', async () => {
      // Arrange
      mockReferenceShelf.getMoment.mockResolvedValue(undefined)

      // Act & Assert
      await expect(
        director.generateScene(
          mockStoryId,
          mockChapterId,
          mockArcId,
          mockMomentId,
          mockPersonality
        )
      ).rejects.toThrow('Selected moment not found.')
    })

    it('should pass user restrictions to restriction service', async () => {
      // Arrange
      const userRestrictions = 'no-violence,no-adult-content'
      const expectedSceneDescriptor = createMockSceneDescriptor()
      const restrictionResult = {
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: ['no-violence', 'no-adult-content']
      }

      const testComplexPartySnapshot = {
        partyId: 'complex-party',
        members: [
          { id: '1', name: 'Hero', class: 'Warrior', level: 15 },
          { id: '2', name: 'Mage', class: 'Wizard', level: 12 },
          { id: '3', name: 'Rogue', class: 'Thief', level: 10 },
        ],
        affinities: {
          courage: 85,
          wisdom: 70,
          loyalty: 90,
        },
        statusEffects: ['blessed', 'inspired', 'determined'],
      }

      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue(testComplexPartySnapshot)
      mockMoodEngine.getCurrentMood.mockReturnValue('Neutral')
      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue(restrictionResult)

      // Act
      await director.generateScene(
        mockStoryId,
        mockChapterId,
        mockArcId,
        mockMomentId,
        mockPersonality,
        userRestrictions
      )

      // Assert
      expect(mockRestrictionService.applyRestrictions).toHaveBeenCalledWith(
        expectedSceneDescriptor.narrativeText,
        mockMoment,
        userRestrictions
      )
    })

    it('should update scene diagnostics with personality and restrictions', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor({
        diagnostics: {
          appliedRestrictions: [],
          moodAdjustments: ['Neutral'],
          branchForecast: 'Scene will branch to 2 paths'
        }
      })
      const restrictionResult = {
        filteredContent: 'Filtered content',
        appliedRestrictions: ['content-filtered', 'mood-adjusted']
      }

      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })
      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue(restrictionResult)

      // Act
      const result = await director.generateScene(
        mockStoryId,
        mockChapterId,
        mockArcId,
        mockMomentId,
        mockPersonality
      )

      // Assert
      expect(result.narrativeText).toBe(restrictionResult.filteredContent)
      expect(result.diagnostics.appliedRestrictions).toEqual(
        expect.arrayContaining([
          ...restrictionResult.appliedRestrictions,
          `Personality: ${mockPersonality}`
        ])
      )
    })

    it('should handle different dreamweaver personalities', async () => {
      // Arrange
      const personalities: any[] = ['Luminari', 'Shadow', 'Chronicler']
      const expectedSceneDescriptor = createMockSceneDescriptor()

      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue({
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: []
      })
      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })

      // Act & Assert
      for (const personality of personalities) {
        const result = await director.generateScene(
          mockStoryId,
          mockChapterId,
          mockArcId,
          mockMomentId,
          personality
        )

        expect(mockSceneAssembler.buildScene).toHaveBeenCalledWith(
          mockMoment,
          expect.any(Object),
          personality
        )
        expect(result.dreamweaverPersonality).toBe(expectedSceneDescriptor.dreamweaverPersonality)
      }
    })

    it('should handle complex party snapshot', async () => {
      // Arrange
      const complexPartySnapshot = {
        partyId: 'complex-party',
        members: [
          { id: '1', name: 'Hero', class: 'Warrior', level: 15 },
          { id: '2', name: 'Mage', class: 'Wizard', level: 12 },
          { id: '3', name: 'Rogue', class: 'Thief', level: 10 },
        ],
        affinities: {
          courage: 85,
          wisdom: 70,
          loyalty: 90,
        },
        statusEffects: ['blessed', 'inspired', 'determined'],
      };

      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue(complexPartySnapshot)

      const expectedSceneDescriptor = createMockSceneDescriptor()
      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue({
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: []
      })

      // Act
      const result = await director.generateScene(
        mockStoryId,
        mockChapterId,
        mockArcId,
        mockMomentId,
        mockPersonality
      )

      // Assert
      expect(mockSceneAssembler.buildScene).toHaveBeenCalledWith(
        mockMoment,
        expect.objectContaining({
          partySnapshot: complexPartySnapshot,
        }),
        mockPersonality
      )
      expect(result).toBeDefined()
    })

    it('should handle restriction service errors', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor()
      const restrictionError = new Error('Restriction application failed')

      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })
      mockMoodEngine.getCurrentMood.mockReturnValue('Neutral')
      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockRejectedValue(restrictionError)

      // Act & Assert
      await expect(
        director.generateScene(
          mockStoryId,
          mockChapterId,
          mockArcId,
          mockMomentId,
          mockPersonality
        )
      ).rejects.toThrow('Restriction application failed')
    })

    it('should handle scene assembler errors', async () => {
      // Arrange
      const assemblerError = new Error('Scene assembly failed')
      
      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })
      mockMoodEngine.getCurrentMood.mockReturnValue('Neutral')
      mockSceneAssembler.buildScene.mockRejectedValue(assemblerError)

      // Act & Assert
      await expect(
        director.generateScene(
          mockStoryId,
          mockChapterId,
          mockArcId,
          mockMomentId,
          mockPersonality
        )
      ).rejects.toThrow('Scene assembly failed')
    })

    it('should handle reference shelf errors', async () => {
      // Arrange
      const shelfError = new Error('Failed to get moment')
      mockReferenceShelf.getMoment.mockRejectedValue(shelfError)

      // Act & Assert
      await expect(
        director.generateScene(
          mockStoryId,
          mockChapterId,
          mockArcId,
          mockMomentId,
          mockPersonality
        )
      ).rejects.toThrow('Failed to get moment')
    })

    it('should handle party snapshot errors', async () => {
      // Arrange
      const snapshotError = new Error('Failed to snapshot party')
      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockRejectedValue(snapshotError)

      // Act & Assert
      await expect(
        director.generateScene(
          mockStoryId,
          mockChapterId,
          mockArcId,
          mockMomentId,
          mockPersonality
        )
      ).rejects.toThrow('Failed to snapshot party')
    })

    it('should handle mood engine errors', async () => {
      // Arrange
      mockReferenceShelf.getMoment.mockResolvedValue(mockMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })
      mockMoodEngine.getCurrentMood.mockImplementation(() => {
        throw new Error('Mood engine failed')
      })

      // Act & Assert
      await expect(
        director.generateScene(
          mockStoryId,
          mockChapterId,
          mockArcId,
          mockMomentId,
          mockPersonality
        )
      ).rejects.toThrow('Mood engine failed')
    })
  })

  describe('planNextScene', () => {
    it('should return null when moment has no branching hooks', async () => {
      // Arrange
      const momentWithoutHooks = createMockMoment({ branchingHooks: [] })

      // Act
      const result = await director.planNextScene(momentWithoutHooks)

      // Assert
      expect(result).toBeNull()
    })

    it('should return the target moment ID of the highest weight branch', async () => {
      // Arrange
      const highWeightBranch = {
        hookId: 'high-weight',
        condition: 'player_level > 10',
        targetMomentId: 'next_high_level_moment',
        weight: 90,
      }
      const lowWeightBranch = {
        hookId: 'low-weight',
        condition: 'player_level <= 10',
        targetMomentId: 'next_low_level_moment',
        weight: 10,
      }

      const momentWithBranches = createMockMoment({
        branchingHooks: [lowWeightBranch, highWeightBranch]
      })

      // Act
      const result = await director.planNextScene(momentWithBranches)

      // Assert
      expect(result).toBe(highWeightBranch.targetMomentId)
    })

    it('should handle moment with single branching hook', async () => {
      // Arrange
      const singleBranch = {
        hookId: 'single-branch',
        condition: 'always',
        targetMomentId: 'single_next_moment',
        weight: 100,
      }

      const momentWithSingleBranch = createMockMoment({
        branchingHooks: [singleBranch]
      })

      // Act
      const result = await director.planNextScene(momentWithSingleBranch)

      // Assert
      expect(result).toBe(singleBranch.targetMomentId)
    })

    it('should handle equal weight branches by returning the first one', async () => {
      // Arrange
      const branch1 = {
        hookId: 'branch1',
        condition: 'option1',
        targetMomentId: 'moment1',
        weight: 50,
      }
      const branch2 = {
        hookId: 'branch2',
        condition: 'option2',
        targetMomentId: 'moment2',
        weight: 50,
      }

      const momentWithEqualBranches = createMockMoment({
        branchingHooks: [branch1, branch2]
      })

      // Act
      const result = await director.planNextScene(momentWithEqualBranches)

      // Assert
      expect(result).toBe(branch1.targetMomentId)
    })

    it('should handle complex branching conditions', async () => {
      // Arrange
      const complexBranches = [
        {
          hookId: 'complex1',
          condition: 'player_level > 15 && has_magic_sword',
          targetMomentId: 'advanced_magic_moment',
          weight: 80,
        },
        {
          hookId: 'complex2',
          condition: 'party_size >= 3 || has_healer',
          targetMomentId: 'group_moment',
          weight: 60,
        },
        {
          hookId: 'complex3',
          condition: 'completed_quest_chain',
          targetMomentId: 'epilogue_moment',
          weight: 95,
        },
      ]

      const momentWithComplexBranches = createMockMoment({
        branchingHooks: complexBranches
      })

      // Act
      const result = await director.planNextScene(momentWithComplexBranches)

      // Assert
      expect(result).toBe(complexBranches[2].targetMomentId) // Highest weight
    })

    it('should handle zero weight branches', async () => {
      // Arrange
      const zeroWeightBranch = {
        hookId: 'zero-weight',
        condition: 'never',
        targetMomentId: 'impossible_moment',
        weight: 0,
      }
      const normalBranch = {
        hookId: 'normal',
        condition: 'normal',
        targetMomentId: 'normal_moment',
        weight: 100,
      }

      const momentWithZeroWeight = createMockMoment({
        branchingHooks: [zeroWeightBranch, normalBranch]
      })

      // Act
      const result = await director.planNextScene(momentWithZeroWeight)

      // Assert
      expect(result).toBe(normalBranch.targetMomentId)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle end-to-end scene generation with all dependencies', async () => {
      // Arrange
      const storyId = generateTestId('story')
      const chapterId = generateTestId('chapter')
      const arcId = generateTestId('arc')
      const momentId = generateTestId('moment')

      const complexMoment = createMockMoment({
        content: 'A complex moment with many branching possibilities',
        branchingHooks: [
          {
            hookId: 'branch1',
            condition: 'player_level > 10',
            targetMomentId: 'advanced_moment',
            weight: 70,
          },
          {
            hookId: 'branch2',
            condition: 'has_special_item',
            targetMomentId: 'special_moment',
            weight: 30,
          },
        ],
        restrictionTags: ['safe', 'adventure'],
      })

      const complexPartySnapshot = {
        partyId: 'adventure-party',
        members: [
          { id: '1', name: 'Hero', class: 'Warrior', level: 15 },
          { id: '2', name: 'Mage', class: 'Wizard', level: 12 },
        ],
        affinities: { courage: 85, wisdom: 70 },
        statusEffects: ['blessed'],
      };

      mockReferenceShelf.getMoment.mockResolvedValue(complexMoment)
      mockReferenceShelf.snapshotParty.mockResolvedValue(complexPartySnapshot)
      mockMoodEngine.getCurrentMood.mockReturnValue('Joyful')

      const expectedSceneDescriptor = createMockSceneDescriptor({
        mood: 'Joyful',
        partyHighlights: ['Hero (Warrior Lvl 15)', 'Mage (Wizard Lvl 12)'],
      })

      const restrictionResult = {
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: ['content-appropriate'],
      }

      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue(restrictionResult)

      // Act
      const result = await director.generateScene(
        storyId,
        chapterId,
        arcId,
        momentId,
        'Luminari'
      )

      // Assert
      expect(result).toBeDefined()
      expect(result.mood).toBe('Joyful')
      expect(mockJournal.logScene).toHaveBeenCalledWith(expectedSceneDescriptor)

      // Test next scene planning
      const nextMomentId = await director.planNextScene(complexMoment)
      expect(nextMomentId).toBe('advanced_moment') // Highest weight branch
    })

    it('should handle concurrent scene generation requests', async () => {
      // Arrange
      const storyId = generateTestId('story')
      const chapterId = generateTestId('chapter')
      const arcId = generateTestId('arc')
      const momentId = generateTestId('moment')

      const mockMomentForConcurrent = createMockMoment()
      ;(director.referenceShelf.getMoment as jest.Mock).mockResolvedValue(mockMomentForConcurrent)
      ;(director.referenceShelf.snapshotParty as jest.Mock).mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })

      const expectedSceneDescriptor = createMockSceneDescriptor()
      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue({
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: [],
      })

      // Act
      const promises = [
        director.generateScene(storyId, chapterId, arcId, momentId, 'Luminari'),
        director.generateScene(storyId, chapterId, arcId, momentId, 'Shadow'),
        director.generateScene(storyId, chapterId, arcId, momentId, 'Chronicler'),
      ]

      const results = await Promise.all(promises)

      // Assert
      expect(results).toHaveLength(3)
      expect(mockSceneAssembler.buildScene).toHaveBeenCalledTimes(3)
      expect(mockJournal.logScene).toHaveBeenCalledTimes(3)
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle malformed moment data', async () => {
      // Arrange
      const malformedMoment = { id: 'malformed' } as any
      (director.referenceShelf.getMoment as jest.Mock).mockResolvedValue(malformedMoment)

      // Act & Assert
      await expect(
        director.generateScene(
          generateTestId('story'),
          generateTestId('chapter'),
          generateTestId('arc'),
          generateTestId('moment'),
          'Luminari'
        )
      ).rejects.toThrow()
    })

    it('should handle missing party snapshot gracefully', async () => {
      // Arrange
      (director.referenceShelf.snapshotParty as jest.Mock).mockResolvedValue(null as any)

      const expectedSceneDescriptor = createMockSceneDescriptor()
      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue({
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: [],
      })

      // Act & Assert
      await expect(
        director.generateScene(
          generateTestId('story'),
          generateTestId('chapter'),
          generateTestId('arc'),
          generateTestId('moment'),
          'Luminari'
        )
      ).rejects.toThrow()
    })

    it('should handle journal logging errors gracefully', async () => {
      // Arrange
      const mockMomentForJournal = createMockMoment()
      ;(director.referenceShelf.getMoment as jest.Mock).mockResolvedValue(mockMomentForJournal)
      ;(director.referenceShelf.snapshotParty as jest.Mock).mockResolvedValue({
        partyId: 'test-party',
        members: [],
        affinities: {},
        statusEffects: [],
      })

      const expectedSceneDescriptor = createMockSceneDescriptor()
      mockSceneAssembler.buildScene.mockResolvedValue(expectedSceneDescriptor)
      mockRestrictionService.applyRestrictions.mockResolvedValue({
        filteredContent: expectedSceneDescriptor.narrativeText,
        appliedRestrictions: [],
      })

      const journalError = new Error('Journal logging failed')
      mockJournal.logScene.mockImplementation(() => {
        throw journalError
      })

      // Act & Assert
      await expect(
        director.generateScene(
          generateTestId('story'),
          generateTestId('chapter'),
          generateTestId('arc'),
          generateTestId('moment'),
          'Luminari'
        )
      ).rejects.toThrow('Journal logging failed')
    })
  })
})