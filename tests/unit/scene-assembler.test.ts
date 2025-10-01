import { SceneAssembler } from '@/lib/scene-assembler'
import { generateSceneFromMoment } from '@/ai/flows/generate-scene-from-moment'
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

// Mock the AI flow dependency
jest.mock('@/ai/flows/generate-scene-from-moment')

describe('SceneAssembler', () => {
  let sceneAssembler: SceneAssembler
  let mockMoment: any
  let mockContext: any
  let mockPersonality: any

  beforeEach(() => {
    sceneAssembler = new SceneAssembler()
    mockMoment = createMockMoment()
    mockContext = createMockRuntimeContext()
    mockPersonality = 'Luminari'

    // Reset mocks
    jest.clearAllMocks()
  })

  describe('buildScene', () => {
    it('should successfully build a scene with valid inputs', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor({
        sceneId: generateTestId('scene'),
        dreamweaverPersonality: mockPersonality
      })

      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledTimes(1)
      expect(generateSceneFromMoment).toHaveBeenCalledWith({
        momentId: mockMoment.momentId,
        content: mockMoment.content,
        chapterId: mockContext.chapterId,
        arcId: mockContext.arcId,
        partySnapshot: mockContext.partySnapshot,
        environmentState: mockContext.environmentState,
        currentMood: mockContext.currentMood,
        dreamweaverPersonality: mockPersonality,
      })

      expect(result).toEqual(expectedSceneDescriptor)
      expect(result.dreamweaverPersonality).toBe(mockPersonality)
      validateSceneDescriptorStructure(result)
    })

    it('should handle different dreamweaver personalities', async () => {
      // Arrange
      const personalities: any[] = ['Luminari', 'Shadow', 'Chronicler']
      const expectedSceneDescriptor = createMockSceneDescriptor({
        sceneId: generateTestId('scene'),
        dreamweaverPersonality: 'Shadow'
      })

      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act & Assert
      for (const personality of personalities) {
        const result = await sceneAssembler.buildScene(mockMoment, mockContext, personality)

        expect(generateSceneFromMoment).toHaveBeenCalledWith(
          expect.objectContaining({
            dreamweaverPersonality: personality,
          })
        )
        expect(result.dreamweaverPersonality).toBe(personality)
      }
    })

    it('should pass correct scene input structure to AI flow', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      await sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledWith({
        momentId: mockMoment.momentId,
        content: mockMoment.content,
        chapterId: mockContext.chapterId,
        arcId: mockContext.arcId,
        partySnapshot: mockContext.partySnapshot,
        environmentState: mockContext.environmentState,
        currentMood: mockContext.currentMood,
        dreamweaverPersonality: mockPersonality,
      })
    })

    it('should handle AI flow errors gracefully', async () => {
      // Arrange
      const errorMessage = 'AI flow failed to generate scene'
      ;(generateSceneFromMoment as jest.Mock).mockRejectedValue(new Error(errorMessage))

      // Act & Assert
      await expect(
        sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)
      ).rejects.toThrow(errorMessage)
    })

    it('should handle timeout scenarios', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout')
      ;(generateSceneFromMoment as jest.Mock).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(timeoutError), 100))
      )

      // Act & Assert
      await expect(
        sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)
      ).rejects.toThrow('Request timeout')
    })

    it('should handle empty moment content', async () => {
      // Arrange
      const momentWithEmptyContent = createMockMoment({ content: '' })
      const expectedSceneDescriptor = createMockSceneDescriptor({
        narrativeText: 'Generated content for empty moment'
      })
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(momentWithEmptyContent, mockContext, mockPersonality)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '',
        })
      )
      expect(result).toBeDefined()
    })

    it('should handle complex party snapshot data', async () => {
      // Arrange
      const complexPartySnapshot = {
        partyId: generateTestId('party'),
        members: [
          { id: '1', name: 'Hero', class: 'Warrior', level: 10 },
          { id: '2', name: 'Mage', class: 'Wizard', level: 8 },
          { id: '3', name: 'Rogue', class: 'Thief', level: 7 },
        ],
        affinities: {
          courage: 85,
          wisdom: 70,
          loyalty: 90,
        },
        statusEffects: ['blessed', 'inspired'],
      }

      const contextWithComplexParty = {
        ...mockContext,
        partySnapshot: complexPartySnapshot,
      }

      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(mockMoment, contextWithComplexParty, mockPersonality)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledWith(
        expect.objectContaining({
          partySnapshot: complexPartySnapshot,
        })
      )
      expect(result).toBeDefined()
    })

    it('should validate runtime context structure', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      await sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledWith(
        expect.objectContaining({
          chapterId: mockContext.chapterId,
          arcId: mockContext.arcId,
          momentId: mockMoment.momentId,
        })
      )
    })

    it('should handle concurrent scene building', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const promises = [
        sceneAssembler.buildScene(mockMoment, mockContext, 'Luminari'),
        sceneAssembler.buildScene(mockMoment, mockContext, 'Shadow'),
        sceneAssembler.buildScene(mockMoment, mockContext, 'Chronicler'),
      ]

      const results = await Promise.all(promises)

      // Assert
      expect(results).toHaveLength(3)
      expect(generateSceneFromMoment).toHaveBeenCalledTimes(3)

      results.forEach((result, index) => {
        const expectedPersonality = ['Luminari', 'Shadow', 'Chronicler'][index]
        expect(result.dreamweaverPersonality).toBe(expectedPersonality)
      })
    })

    it('should handle moment with complex branching hooks', async () => {
      // Arrange
      const momentWithComplexHooks = createMockMoment({
        branchingHooks: [
          {
            hookId: 'hook1',
            condition: 'player_level > 5',
            targetMomentId: 'moment_2',
            weight: 80,
          },
          {
            hookId: 'hook2',
            condition: 'has_magic_artifact',
            targetMomentId: 'moment_3',
            weight: 60,
          },
        ]
      })

      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(momentWithComplexHooks, mockContext, mockPersonality)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledWith(
        expect.objectContaining({
          momentId: momentWithComplexHooks.momentId,
          content: momentWithComplexHooks.content,
        })
      )
      expect(result).toBeDefined()
    })

    it('should handle moment with restriction tags', async () => {
      // Arrange
      const momentWithRestrictions = createMockMoment({
        restrictionTags: ['combat_restricted', 'magic_limited', 'adult_content']
      })

      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(momentWithRestrictions, mockContext, mockPersonality)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledWith(
        expect.objectContaining({
          momentId: momentWithRestrictions.momentId,
          content: momentWithRestrictions.content,
        })
      )
      expect(result).toBeDefined()
    })
  })

  describe('Integration with different moment types', () => {
    it('should handle moment with rich sensory data', async () => {
      // Arrange
      const sensoryRichMoment = createMockMoment({
        sensoryAnchors: ['forest_wind', 'distant_thunder', 'wet_earth', 'smoke'],
        timeline: ['dawn', 'morning', 'afternoon'],
        themes: ['mystery', 'adventure', 'discovery'],
        lore: ['ancient_forest_legend', 'forgotten_temple'],
        subtext: ['hidden_danger', 'ancient_power'],
      })

      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(sensoryRichMoment, mockContext, mockPersonality)

      // Assert
      expect(result).toBeDefined()
      expect(generateSceneFromMoment).toHaveBeenCalledWith(
        expect.objectContaining({
          content: sensoryRichMoment.content,
        })
      )
    })

    it('should handle moment with lore references', async () => {
      // Arrange
      const momentWithLore = createMockMoment({
        loreRefs: [
          {
            id: 'lore_1',
            type: 'historical',
            description: 'Ancient battle that shaped the region',
          },
          {
            id: 'lore_2',
            type: 'cultural',
            description: 'Local traditions and customs',
          },
        ]
      })

      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(momentWithLore, mockContext, mockPersonality)

      // Assert
      expect(result).toBeDefined()
    })
  })

  describe('Performance characteristics', () => {
    it('should complete scene building within reasonable time', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockImplementation(
        () => waitFor(50).then(() => expectedSceneDescriptor)
      )

      // Act & Assert
      await expect(
        sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)
      ).resolves.toBeDefined()
    })

    it('should handle rapid successive calls', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor()
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const startTime = Date.now()
      const promises = Array.from({ length: 5 }, () =>
        sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)
      )

      const results = await Promise.all(promises)
      const endTime = Date.now()

      // Assert
      expect(results).toHaveLength(5)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('Error scenarios', () => {
    it('should handle null moment gracefully', async () => {
      // Act & Assert
      await expect(
        sceneAssembler.buildScene(null as any, mockContext, mockPersonality)
      ).rejects.toThrow()
    })

    it('should handle null context gracefully', async () => {
      // Act & Assert
      await expect(
        sceneAssembler.buildScene(mockMoment, null as any, mockPersonality)
      ).rejects.toThrow()
    })

    it('should pass through invalid personality type to AI flow', async () => {
      // Arrange
      const expectedSceneDescriptor = createMockSceneDescriptor({
        dreamweaverPersonality: 'InvalidPersonality' as any
      })
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(expectedSceneDescriptor)

      // Act
      const result = await sceneAssembler.buildScene(mockMoment, mockContext, 'InvalidPersonality' as any)

      // Assert
      expect(generateSceneFromMoment).toHaveBeenCalledWith(
        expect.objectContaining({
          dreamweaverPersonality: 'InvalidPersonality',
        })
      )
      expect(result.dreamweaverPersonality).toBe('InvalidPersonality')
    })

    it('should handle malformed AI response', async () => {
      // Arrange
      const malformedResponse = { invalidField: 'value' }
      ;(generateSceneFromMoment as jest.Mock).mockResolvedValue(malformedResponse)

      // Act & Assert
      await expect(
        sceneAssembler.buildScene(mockMoment, mockContext, mockPersonality)
      ).resolves.toBeDefined() // Should still work, just with missing fields
    })
  })
})