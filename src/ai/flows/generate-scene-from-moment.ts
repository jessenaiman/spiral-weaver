import { SceneDescriptor, DreamweaverPersonality } from '@/lib/types'

export interface SceneInput {
  momentId: string
  content: string
  chapterId: string
  arcId: string
  partySnapshot: any
  environmentState: string
  currentMood: string
  dreamweaverPersonality: DreamweaverPersonality
}

/**
 * Generates a SceneDescriptor from a Moment using AI processing.
 * This is a mock implementation for testing purposes.
 * In a real implementation, this would call an AI service (like Google's Genkit).
 */
export async function generateSceneFromMoment(input: SceneInput): Promise<SceneDescriptor> {
  // Validate input
  if (!input.momentId || !input.content) {
    throw new Error('Invalid input: momentId and content are required')
  }

  // Validate personality - strict validation
  const validPersonalities: DreamweaverPersonality[] = ['Luminari', 'Shadow', 'Chronicler']
  if (!input.dreamweaverPersonality || typeof input.dreamweaverPersonality !== 'string') {
    throw new Error(`Invalid dreamweaver personality: must be a non-empty string`)
  }

  if (!validPersonalities.includes(input.dreamweaverPersonality)) {
    throw new Error(`Invalid dreamweaver personality: ${input.dreamweaverPersonality}. Must be one of: ${validPersonalities.join(', ')}`)
  }

  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 10))

  // Generate scene content based on the input
  const sceneContent = generateSceneContent(input)

  return {
    sceneId: `scene_${input.momentId}_${Date.now()}`,
    title: generateSceneTitle(input),
    narrativeText: sceneContent,
    mood: input.currentMood || 'neutral',
    assetHooks: generateAssetHooks(input),
    recommendedChoices: generateRecommendedChoices(input),
    partyHighlights: generatePartyHighlights(input.partySnapshot),
    equipmentHighlights: generateEquipmentHighlights(input.partySnapshot),
    branchOptions: generateBranchOptions(input),
    diagnostics: generateDiagnostics(input),
    dreamweaverPersonality: input.dreamweaverPersonality,
  }
}

function generateSceneTitle(input: SceneInput): string {
  const titles = [
    `The ${input.currentMood} Moment`,
    `${input.dreamweaverPersonality}'s Vision`,
    `Echoes of ${input.content.substring(0, 20)}...`,
    `A ${input.environmentState} Encounter`,
    `The Turning Point`,
  ]

  return titles[Math.floor(Math.random() * titles.length)]
}

function generateSceneContent(input: SceneInput): string {
  const baseContent = input.content

  // Enhance the content based on personality and mood
  let enhancedContent = baseContent

  switch (input.dreamweaverPersonality) {
    case 'Luminari':
      enhancedContent = `In a blaze of radiant light, ${enhancedContent.toLowerCase()}. The Luminari weaves golden threads of hope through the narrative.`
      break
    case 'Shadow':
      enhancedContent = `From the velvet darkness emerges ${enhancedContent.toLowerCase()}. The Shadow reveals hidden truths in whispered tones.`
      break
    case 'Chronicler':
      enhancedContent = `As the Chronicler observes, ${enhancedContent.toLowerCase()}. Every detail is recorded, every moment preserved for eternity.`
      break
  }

  // Add mood-based modifiers
  if (input.currentMood === 'tense') {
    enhancedContent += ' Tension hangs in the air like a storm about to break.'
  } else if (input.currentMood === 'peaceful') {
    enhancedContent += ' A serene calm settles over the scene like morning mist.'
  }

  return enhancedContent
}

function generateAssetHooks(input: SceneInput): string[] {
  const hooks = [
    'environmental_audio',
    'character_portraits',
    'background_art',
    'ui_overlays',
  ]

  // Add context-specific hooks
  if (input.environmentState.includes('forest')) {
    hooks.push('forest_sounds', 'nature_effects')
  }

  if (input.partySnapshot?.members?.length > 0) {
    hooks.push('party_status_indicators')
  }

  return hooks.slice(0, 3) // Return max 3 hooks
}

function generateRecommendedChoices(input: SceneInput): string[] {
  const choices = [
    'Continue the main path',
    'Explore a side option',
    'Investigate further',
    'Rest and recover',
  ]

  // Filter based on restrictions or context
  if (input.content.includes('combat') || input.content.includes('fight')) {
    choices.unshift('Engage in combat', 'Try to avoid conflict')
  }

  return choices.slice(0, 2) // Return max 2 choices
}

function generatePartyHighlights(partySnapshot: any): string[] {
  if (!partySnapshot?.members) return []

  return partySnapshot.members.map((member: any) =>
    `${member.name} (${member.class} Lvl ${member.level})`
  )
}

function generateEquipmentHighlights(partySnapshot: any): any[] {
  if (!partySnapshot?.members) return []

  // Generate some equipment highlights based on party members
  return partySnapshot.members.slice(0, 2).map((member: any) => ({
    itemId: `item_${member.id}`,
    name: `${member.name}'s Primary Weapon`,
    usageNotes: `Essential for ${member.class} combat maneuvers`,
  }))
}

function generateBranchOptions(input: SceneInput): any[] {
  const options = [
    {
      prompt: 'Follow the obvious path forward',
      targetMomentId: `next_${input.momentId}`,
      probability: 70,
    },
    {
      prompt: 'Investigate the strange noise',
      targetMomentId: `branch_${input.momentId}_1`,
      probability: 20,
    },
  ]

  // Add restriction-aware options
  if (input.content.includes('magic') || input.content.includes('spell')) {
    options.push({
      prompt: 'Attempt to dispel the magic',
      targetMomentId: `branch_${input.momentId}_2`,
      probability: 10,
    })
  }

  return options
}

function generateDiagnostics(input: SceneInput): any {
  return {
    appliedRestrictions: input.content.includes('restricted') ? ['content_warning'] : [],
    moodAdjustments: [input.currentMood],
    branchForecast: `Scene will likely branch to ${Math.floor(Math.random() * 3) + 1} possible paths`,
  }
}
