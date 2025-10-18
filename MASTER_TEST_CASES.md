# Omega Spiral - Master Test Cases Document

## Vision: Testing as Game Design Storytelling

Omega Spiral is a narrative-driven RPG where **scenes are dynamically orchestrated** from authored story moments combined with living party state, equipment context, and emotional tone. Our tests **validate the mechanics of narrative composition**—not the words themselves—enabling creative teams to author and modify content freely without technical constraints.

Tests tell the story of:

- **How the narrative hierarchy works** (Story → Chapter → Arc → Moment → Scene)
- **How party, equipment, and mood shape scenes** without rewriting content
- **How branching choices emerge from restrictions and emotional arcs**
- **How three distinct Dreamweaver personalities interpret the same moment differently**
- **How diagnostics expose the narrative engine for creative debugging**

This document is a **living reference** for creative and design teams to understand what's tested, what's working, and how to extend tests as you create new content.

---

## Test Architecture: How Omega Spiral Tests Work

### Core Principle: Structure Over Content

Our tests validate the **architecture and mechanics** of scene generation, not the specific words used. This means:

- ✅ You can add new narrative content without updating tests
- ✅ You can modify scenes radically without breaking tests
- ✅ Tests focus on metadata, block structure, and relationships
- ❌ Tests don't check for specific sentence content
- ❌ Tests don't require rewrites when you change story text

### Test Categories Overview

| Category | Focus | File |
|----------|-------|------|
| **Narrative Structure** | Story hierarchy, relationships, branching logic | `narrative-structure.test.ts` |
| **Scene Generation** | Scene composition, blocks, metadata | `scene-generation.test.ts` |
| **Personalities** | Luminari, Shadow, Chronicler differences | `scene-generation.test.ts` |
| **Branching** | Branch validity, restrictions, choices | `branching-mechanics.test.ts` |
| **Party & Equipment** | Party integration, equipment highlights | `scene-generation.test.ts` |
| **Mood & Environment** | Context integration, mood/environment effects | `mood-environment.test.ts` |
| **Restrictions** | Content filtering, policy enforcement | `restriction-service.test.ts` |
| **Diagnostics** | Metadata generation, debugging info | `scene-generation.test.ts` |
| **Error Handling** | Edge cases, graceful degradation | Various |
| **AI Enhancements** | Quality scoring, suggestions | `agent-testing-system.test.ts` |

---

## Test Case Categories

### 1. Narrative Structure: The Story's Skeleton

**File:** `src/__tests__/lib/narrative-structure.test.ts`

**What's Being Tested:**

The narrative hierarchy that holds all authored content. Think of this as validating that your story's table of contents is properly organized and internally consistent. If the skeleton breaks, everything falls apart.

**Scenario:**

Validate story, chapter, arc, and moment relationships; ensure narrative continuity and branching logic.

**Acceptance Criteria:**

- Narrative entities are correctly linked (story → chapters → arcs → moments)
- Branching hooks lead to valid moments and maintain continuity
- Narrative blocks are present and logically ordered
- Metadata (IDs, tags, references) is complete and consistent
- Cross-references between moments resolve correctly
- Invalid moment IDs in branches are caught and reported

**Status:** ✅ **IMPLEMENTED**

- Story/chapter/arc/moment hierarchy validated
- Branching hook targets verified
- ID consistency across all narrative levels

**Creative Team Activities:**

- Add new chapters and verify they load properly
- Create experimental arc structures (parallel arcs, alternative timelines)
- Test restriction tag logic on new content
- Modify narrative data in `src/lib/data/sample-narrative.json` to prototype new structures
- No code changes needed to test new narrative arrangements

**Example Creative Extension:**

```typescript
// In sample-narrative.json, add a new chapter with multiple parallel arcs
// Tests automatically validate the structure without code changes
describe('Parallel Arc Structure', () => {
  it('should handle chapters with non-sequential arc switching', () => {
    // Test data automatically validates your new structure
  });
});
```

---

### 2. Scene Generation & Composition: Turning Moments into Living Scenes

**File:** `src/__tests__/lib/scene-generation.test.ts` and `scene-generation.mock.test.ts`

**What's Being Tested:**

When a moment from the story is selected, the scene engine orchestrates all the living context—party members, their equipment, mood, environment—to create a unique `SceneDescriptor`. This test validates that all pieces come together correctly.

**Scenario:**

Test scene creation from moments with various runtime contexts; verify `SceneAssembler` and AI flows produce expected blocks and metadata. A scene is not just text; it's a structured composition of narrative, metadata, recommendations, and diagnostics.

**Acceptance Criteria:**

- Scenes are generated for all valid moments and contexts
- `SceneDescriptor` contains all required blocks:
  - `sceneId` and unique identifier
  - `title` reflecting the moment
  - `narrativeText` - the core scene content
  - `mood` - emotional tone of the scene
  - `assetHooks` - visual/audio asset references
  - `recommendedChoices` - suggested narrative branches
  - `partyHighlights` - which party members matter in this scene
  - `equipmentHighlights` - which equipment is relevant
  - `branchOptions` - playable choices and their targets
  - `diagnostics` - metadata about how the scene was constructed
- Generated scenes reflect changes in party, environment, and mood
- Validation uses metadata structure (not content words) to assess scene integrity
- All metadata arrays are properly populated

**Status:** ✅ **IMPLEMENTED**

- Core scene descriptor structure validated
- All required blocks present in generated scenes
- Context integration verified (mood, environment, party reflected in output)
- Diagnostics generated with complete metadata
- Mock scenes created for deterministic testing

**Current Tests:**

```text
Scene Descriptor Structure:
✅ Scene with all required blocks and metadata
✅ All required narrative blocks included
✅ Metadata arrays for all scene elements
✅ Diagnostics with complete metadata

Context Integration:
✅ Runtime context reflected in scene output
✅ Mood context reflected in scene metadata
✅ Environment context reflected in diagnostics
✅ Party snapshot integrated in partyHighlights

Scene Content Structure:
✅ Narrative text generated and non-empty
✅ Asset hooks present for visual/audio references
✅ Branch options point to valid next moments
✅ Recommended choices have descriptions
```

**Creative Team Activities:**

- Test how scenes change when you modify party composition
- Experiment with different environmental contexts
- Explore mood-driven narrative variations
- Modify mock scene creation function to test new narrative structures
- Add personality-specific assertions for new Dreamweaver types
- Test new scene blocks without AI dependencies

**Example Creative Extension:**

```typescript
// Test how a scene changes with different party
it('should adapt scene based on party specialization', () => {
  const scene1 = createMockScene(
    'warrior-heavy-party',
    'combat-focused'
  );
  const scene2 = createMockScene(
    'mage-heavy-party',
    'magic-focused'
  );

  // Verify scenes reflect party differences
  expect(scene1.assetHooks.length).toBeDefined();
  expect(scene2.assetHooks.length).toBeDefined();
  // Each should have distinct character highlights
});
```

---

### 3. Dreamweaver Personalities: Three Lenses, One Story

**File:** `src/__tests__/lib/scene-generation.test.ts` (Personality Influence section)

**What's Being Tested:**

The Dreamweaver is an AI narrator that has three distinct personalities, each interpreting the same moment differently. This validates that personality choice genuinely affects how a scene is presented.

**Personalities:**

- **Luminari**: The idealistic chronicler, emphasizes heroism, hope, and purpose
- **Shadow**: The dark realist, emphasizes danger, moral complexity, and cost
- **Chronicler**: The impartial observer, emphasizes facts, relationships, and connections

**Scenario:**

Test scene generation for Luminari, Shadow, and Chronicler; ensure personality-driven narrative blocks and metadata are reflected. Each personality should generate visibly different scene compositions from the same story moment.

**Acceptance Criteria:**

- Scenes generated with each personality show distinct block structures and metadata
- Personality-driven changes are visible in:
  - Tone of narrative text (inferred from content structure, not word-by-word)
  - Recommended choices (different narrative options highlighted)
  - Mood adjustments (personality influences emotional reading)
  - Asset hook selections (different visual/audio emphasis)
  - Diagnostics notes (personality decision-making visible)
- Scenes use the correct personality label
- All three personalities succeed in generating valid scenes

**Status:** ✅ **IMPLEMENTED**

- Luminari scenes generated and validated
- Shadow scenes generated and validated
- Chronicler scenes generated and validated
- Personality influence detectable in scene structure and metadata

**Current Tests:**

```text
Scene Personality Influence:
✅ Distinct scenes for Luminari personality
✅ Distinct scenes for Shadow personality
✅ Distinct scenes for Chronicler personality
✅ Personality metadata consistent across contexts
✅ Personality-driven branching options differ
✅ Mood adjustments reflect personality tone
```

**Creative Team Activities:**

- Experiment with how each personality handles emotional moments
- Test personality combinations with different party compositions
- Create new personality archetypes by extending the system
- Design narrative moments that play to each personality's strengths
- Document how personalities influence gameplay feel

**Example Creative Extension:**

```typescript
// Add a new personality type
describe('New Personality: Harbinger', () => {
  it('should interpret moments through prophecy lens', () => {
    const scene = await assembler.buildScene(
      testMoment,
      testContext,
      'Harbinger'
    );

    expect(scene.dreamweaverPersonality).toBe('Harbinger');
    // Harbinger should highlight fate, cycles, and consequences
    expect(scene.diagnostics.appliedRestrictions).toContain(
      'personality-prophetic-lens'
    );
  });
});
```

---

### 4. Branching Mechanics: Choice and Consequence

**File:** `src/__tests__/lib/branching-mechanics.test.ts`

**What's Being Tested:**

The game is driven by branching choices. This validates that branching logic is sound: every option leads somewhere valid, restrictions are respected, and probabilities work correctly.

**Scenario:**

Test branching hooks, options, and probabilities; ensure restriction tags and notes are respected as metadata. Validate that every path through the story is reachable and meaningful.

**Acceptance Criteria:**

- All branching options are valid and point to real moments
- Branch probabilities sum to 1.0 (or are properly validated)
- Restriction tags correctly limit available branches
- Branching metadata is complete and logical
- Invalid branch targets are caught
- Circular branching (dead ends, infinite loops) is detectable
- Branch probability distribution is reasonable (no 0% branches)
- Restriction logic gates branches correctly

**Status:** ✅ **IMPLEMENTED**

- Branching hook targets verified
- Restriction tag application tested
- Branch option structure validated
- Probability calculations checked

**Current Tests:**

```text
Branching Structure:
✅ All branching hooks have valid targets
✅ Branch options resolve to valid moments
✅ Restriction tags applied correctly
✅ Branching metadata is complete
✅ No orphaned or invalid branches

Restriction Application:
✅ Restrictions filter available branches
✅ Restriction combinations handled correctly
✅ Branching with different restrictions
✅ Probability distribution validated
```

**Creative Team Activities:**

- Add new restriction types to control which branches are available
- Test complex restriction combinations
- Validate probability distribution of branches
- Design branching scenarios with multiple restriction types
- Create edge cases (all branches restricted, no branches available)
- Test branching that adapts to party composition

**Example Creative Extension:**

```typescript
// Test a new restriction type
describe('Combat-Level Restrictions', () => {
  it('should restrict branches based on party power level', () => {
    const lowLevelParty = {
      /* party snapshot with level 1 members */
    };
    const highLevelParty = {
      /* party snapshot with level 20 members */
    };

    const validation = NarrativeStructureValidator
      .validateBranchingLogic(story, lowLevelParty);

    // Low-level party should have restricted branch options
    expect(validation.errors).toBeDefined();
  });
});
```

---

### 5. Party & Equipment Integration: The Adventure's Tools

**File:** `src/__tests__/lib/scene-generation.test.ts` (Context Integration section)

**What's Being Tested:**

The party members and their equipment are not just flavor—they shape the scene. This validates that the party state is correctly integrated into scenes.

**Scenario:**

Validate party snapshot integration in scenes; test equipment highlights and usage notes as metadata blocks. Different parties should result in different scene narratives.

**Acceptance Criteria:**

- Party members and equipment are referenced in scene metadata
- Party highlights show which members are relevant to the scene
- Equipment highlights reflect actual usage context
- Equipment description blocks are present for highlighted items
- Party affinities and status effects influence scene options
- Scene adapts to party power level and composition

**Status:** ✅ **IMPLEMENTED**

- Party snapshots captured in scene context
- Equipment highlights generated
- Party metadata integrated in scenes
- Equipment usage notes present

**Current Tests:**

```text
Party Integration:
✅ Party snapshot captured in scene context
✅ Party members referenced in highlights
✅ Party affinities reflected in scene options
✅ Status effects considered in branching

Equipment Integration:
✅ Equipment highlights generated for scene
✅ Equipment usage notes present
✅ Equipment context reflected in narrative
✅ Multiple equipment pieces handled correctly
```

**Creative Team Activities:**

- Design scenes where equipment choice matters dramatically
- Create party compositions and test scene variations
- Test how party power level affects available choices
- Modify equipment definitions to test highlighting
- Create scenarios where specific party members shine
- Design equipment that enables unique narrative branches

**Example Creative Extension:**

```typescript
// Test equipment-driven narrative branches
describe('Equipment-Specific Branching', () => {
  it('should unlock branches when specific equipment is equipped', () => {
    const partyWithMagicWand = {
      /* party with mage and magic wand */
    };
    const partyWithoutMagic = {
      /* party without magic */
    };

    const scene1 = await assembler.buildScene(
      moment,
      { partySnapshot: partyWithMagicWand },
      'Luminari'
    );
    const scene2 = await assembler.buildScene(
      moment,
      { partySnapshot: partyWithoutMagic },
      'Luminari'
    );

    // Scenes should have different branch options
    expect(scene1.branchOptions.length).not.toBe(scene2.branchOptions.length);
  });
});
```

---

### 6. Mood & Environment: The Emotional Landscape

**File:** `src/__tests__/lib/mood-environment.test.ts` and `mood-environment.mock.test.ts`

**What's Being Tested:**

Mood and environment are the emotional and physical context of scenes. This validates that they influence scenes and are properly tracked.

**Scenario:**

Test mood adjustments and environment state handling; verify diagnostics panel reflects correct metadata blocks. The same moment should feel different in a peaceful tavern vs. a dark cave.

**Acceptance Criteria:**

- Mood and environment changes are reflected in diagnostics and narrative blocks
- Diagnostics panel displays all relevant metadata
- Mood affects branch recommendations and asset hooks
- Environment affects scene composition and available choices
- Mood/environment transitions are tracked
- Extreme states (e.g., "panicked" mood) produce coherent scenes
- Environment-specific restrictions are applied
- Mood history can be traced through diagnostics

**Status:** ✅ **IMPLEMENTED**

- Mood metadata generated and tracked
- Environment state reflected in scenes
- Diagnostics contains mood/environment info
- Mock scenes with various contexts tested

**Current Tests:**

```text
Mood Handling:
✅ Mood reflected in scene metadata
✅ Mood changes affect branch recommendations
✅ Mood state tracked in diagnostics
✅ Personality influences mood interpretation
✅ Mood adjustments recorded

Environment Handling:
✅ Environment state reflected in diagnostics
✅ Environment affects branch options
✅ Environment-specific restrictions applied
✅ Environment transitions handled correctly
✅ Multiple environment contexts tested
```

**Creative Team Activities:**

- Design moments that are sensitive to mood/environment combinations
- Test extreme mood states (panic, euphoria, despair)
- Create environment-specific narrative branches
- Test how personality reacts to difficult moods
- Design puzzles/challenges that depend on environment awareness
- Create environmental hazards that affect branching

**Example Creative Extension:**

```typescript
// Test emotion-sensitive narrative
describe('Mood-Driven Narrative Shifts', () => {
  it('should unlock emotional branches in high-despair states', () => {
    const normalMoodContext = {
      currentMood: 'hopeful',
      environmentState: 'village'
    };
    const despairContext = {
      currentMood: 'despair',
      environmentState: 'ruins'
    };

    const normalScene = await assembler.buildScene(
      moment,
      normalMoodContext,
      'Shadow'
    );
    const despairScene = await assembler.buildScene(
      moment,
      despairContext,
      'Shadow'
    );

    // Despair should unlock different branch options
    expect(normalScene.branchOptions).not.toEqual(despairScene.branchOptions);
  });
});
```

---

### 7. Restrictions & Content Filtering: Creative Boundaries

**File:** `src/__tests__/lib/restriction-service.test.ts`

**What's Being Tested:**

Restrictions allow the game to respect content policies and creative boundaries. This validates that restrictions are applied correctly without breaking narrative flow.

**Scenario:**

Test restriction tag application across all narrative levels; ensure content filtering respects creative intent while enforcing boundaries.

**Acceptance Criteria:**

- Restriction tags are applied to moments, branches, and scenes
- Scenes respect moment-level restrictions
- Branch-level restrictions are enforced
- Multiple restrictions can be applied simultaneously
- Restriction combinations don't create logical errors
- Diagnostics clearly show what restrictions were applied
- Fallback content is provided when restrictions filter content
- Restrictions don't break narrative continuity

**Status:** ✅ **IMPLEMENTED**

- Restriction application to scenes tested
- Missing user restrictions handled
- Error cases covered
- Applied restrictions tracked in diagnostics

**Current Tests:**

```text
Restriction Application:
✅ Restrictions applied to scene content
✅ Multiple restrictions handled
✅ Restriction metadata tracked
✅ Missing restrictions handled gracefully
✅ Error states managed

Restriction Types:
✅ 'no-violence' applied correctly
✅ Environment-specific restrictions
✅ Personality-specific restrictions
✅ Party-based restrictions
✅ Custom restriction types
```

**Creative Team Activities:**

- Define new restriction types for your game's policies
- Test restriction combinations
- Design content that respects restrictions while remaining impactful
- Create restriction-aware branching
- Test how restrictions affect personality behaviors
- Validate restriction enforcement across all systems

**Example Creative Extension:**

```typescript
// Test new content policy
describe('Cultural-Sensitivity Restrictions', () => {
  it('should apply cultural context restrictions', async () => {
    const moment = {
      id: 'm1',
      title: 'Ancient Ritual',
      restrictionTags: ['cultural-context']
    };

    const result = await service.applyRestrictions(
      'original content',
      moment,
      'cultural-context'
    );

    expect(result.appliedRestrictions).toContain('cultural-context');
    expect(result.filteredContent).toBeDefined();
  });
});
```

---

### 8. Diagnostics & Debugging: Peering Inside the Engine

**File:** `src/__tests__/lib/scene-generation.test.ts` (diagnostics sections)

**What's Being Tested:**

The diagnostics panel is where creative teams debug scene generation issues. This validates that all the information needed to understand why a scene is the way it is is present and correct.

**Scenario:**

Test diagnostics generation and metadata tracking; ensure the diagnostics panel shows complete information about scene construction decisions.

**Acceptance Criteria:**

- `SceneDiagnostics` contains all applied restrictions
- Mood adjustments are recorded and traceable
- Branch forecast is complete and accurate
- Enhancement suggestions are present and actionable
- Personality decision-making is visible
- Context integration is documented
- Issues and recommendations are clear
- Diagnostics enable root-cause analysis of narrative problems

**Diagnostic Fields:**

```typescript
**Diagnostic Fields:**

```typescript
interface SceneDiagnostics {
  appliedRestrictions: string[];      // What restrictions shaped this scene
  moodAdjustments: string[];          // How mood influenced the scene
  branchForecast: string[];           // What branches are available
  enhancements: string[];             // AI suggestions for scene improvement
  qualityScore?: number;              // How coherent is this scene?
  issues?: string[];                  // What warnings or problems exist?
  personality?: DreamweaverPersonality; // Which personality is narrating?
}
```
```

**Status:** ✅ **IMPLEMENTED**

- Diagnostics generated for all scenes
- Applied restrictions tracked
- Mood adjustments recorded
- Branch forecasts provided
- Metadata complete and debuggable

**Current Tests:**

```text
Diagnostics Quality:
✅ Applied restrictions documented
✅ Mood adjustments recorded
✅ Branch forecast present
✅ Enhancement suggestions included
✅ Personality documented
✅ All metadata fields populated
✅ No missing diagnostic information
```

**Creative Team Activities:**

- Use diagnostics to understand why scenes are generated a certain way
- Identify patterns in restriction application
- Debug branching issues by examining forecasts
- Track personality decision-making across scenes
- Use enhancement suggestions to improve scene quality
- Troubleshoot context integration problems

**Example Diagnostics Reading:**

```text
Scene Diagnostics for "The Dark Encounter":
├─ Applied Restrictions: ["personality-prophetic-lens", "mood-despair"]
├─ Mood Adjustments: ["tone-darkened", "options-limited-to-survival"]
├─ Branch Forecast: 
│  ├─ "Flee into the darkness" (probability: 0.4)
│  ├─ "Stand and fight" (probability: 0.35)
│  └─ "Seek ancient ritual" (probability: 0.25)
├─ Enhancements:
│  ├─ "Add party member highlight for the healer"
│  └─ "Consider adding equipment hook for defensive gear"
└─ Quality Score: 8.2/10
```

---

### 9. Error Handling & Edge Cases: Graceful Degradation

**File:** `src/__tests__/lib/` (various)

**What's Being Tested:**

Games break in strange ways. This validates that the narrative engine handles unexpected inputs, missing data, and corrupted state gracefully.

**Scenario:**

Test invalid input, missing data, and fallback logic; ensure graceful degradation and clear diagnostics metadata.

**Acceptance Criteria:**

- System handles invalid or missing data without crashing
- Diagnostics clearly indicate errors and fallback actions in metadata
- Invalid moment IDs fail gracefully with helpful errors
- Missing party data is handled with sensible defaults
- Corrupted restriction tags don't break scene generation
- Invalid branching targets are caught and reported
- Empty or null content blocks are handled
- Personality lookup failures have fallbacks
- System continues functioning even with partial data

**Edge Cases to Test:**

- Moment with no branching hooks
- Party with no members
- Scene with empty narrative text
- Invalid personality type
- Missing environment data
- Null or undefined restrictions
- Branching to non-existent moment ID
- Circular branching references
- Party member with invalid equipment
- Mood with no valid environment
- Conflicting restrictions

**Status:** ✅ **PARTIALLY IMPLEMENTED**

- Invalid input rejection tested
- Missing data handling verified
- Error structures implemented
- Fallback logic in place

**Current Tests:**

```text
Error Handling:
✅ Invalid restriction tags handled
✅ Missing party data fallback
✅ Invalid moment IDs rejected
✅ Null/undefined content handled
✅ Missing environment defaults

Edge Cases:
✅ No branching hooks scenario
✅ Empty party scenario
✅ Invalid personality type
⏳ Circular reference detection
⏳ Corrupted state recovery
```

**Creative Team Activities:**

- Test edge cases with your narrative data
- Create intentional "broken" scenarios to verify fallback behavior
- Design content that safely handles invalid states
- Document how errors are reported to players
- Create recovery workflows for data corruption
- Test stress scenarios (very large parties, deep branching trees)

**Example Edge Case Test:**

```typescript
describe('Graceful Degradation', () => {
  it('should generate scene with missing party data', async () => {
    const contextWithoutParty = {
      chapterId: 'c1',
      arcId: 'a1',
      momentId: 'm1',
      partySnapshot: undefined,  // Missing!
      environmentState: 'forest',
      currentMood: 'curious'
    };

    const scene = await assembler.buildScene(
      moment,
      contextWithoutParty,
      'Luminari'
    );

    expect(scene).toBeDefined();
    expect(scene.diagnostics.issues).toContain('missing-party-data');
    expect(scene.partyHighlights).toHaveLength(0);
  });
});
```

---

### 10. AI Agent Enhancements: The Quality Improvement System

**File:** `src/__tests__/lib/agent-testing-system.test.ts`

**What's Being Tested:**

AI agents can enhance scenes by suggesting improvements to narrative quality, checking for logical consistency, and identifying narrative issues. This validates that these suggestions are actionable and appropriate.

**Scenario:**

Validate agent-driven scene improvements and quality scores; test diagnostics for agent suggestions and validation using local LLM.

**Acceptance Criteria:**

- Agent enhancements are present in diagnostics and narrative blocks
- Quality scores are reasonable (0-10 scale)
- Suggestions are actionable and specific
- Agents identify narrative issues
- Suggestions respect personality differences
- Enhancement suggestions don't require rewriting core content
- Multiple agents can collaborate
- Quality metrics track over time
- Suggestions enable creative improvement without forced changes

**Suggestion Types:**

- **Structure**: Missing narrative elements, weak transitions
- **Coherence**: Logical inconsistencies, plot holes
- **Pacing**: Scenes that are too long/short, awkward rhythm
- **Emotional Arc**: Mood progression feels wrong
- **Character Consistency**: Party behavior inconsistent with arc
- **Visual/Audio**: Missing asset references, weak imagery
- **Impact**: Scene doesn't land emotionally

**Status:** ⏳ **IN PROGRESS**

- Quality scoring framework designed
- Diagnostic suggestion generation started
- Local LLM validation framework in progress

**Current Implementation:**

```text
Agent Systems:
✅ Quality score generation
✅ Suggestion metadata structure
⏳ Enhancement recommendation engine
⏳ Local LLM integration
⏳ Multi-agent collaboration
```

**Creative Team Activities:**

- Review and act on agent suggestions
- Refine quality metrics based on feedback
- Create custom suggestion categories
- Use quality scores to track improvement over time
- Collaborate with agents to enhance weak scenes
- Design scenes that trigger specific agent suggestions
- Test agent suggestions with different personalities

**Example Enhancement Test:**

```typescript
describe('Scene Quality Enhancement', () => {
  it('should suggest improvements for weak pacing', () => {
    const slowScene = {
      sceneId: 's1',
      narrativeText: 'Something happens. Then nothing. Then maybe something.',
      // ... other fields
    };

    const enhancement = await agentSystem.analyzeScene(slowScene);

    expect(enhancement.qualityScore).toBeLessThan(7);
    expect(enhancement.suggestions).toContainEqual(
      expect.objectContaining({
        type: 'pacing',
        severity: 'medium',
        suggestion: expect.stringContaining('pacing') || 
                   expect.stringContaining('rhythm')
      })
    );
  });
});
```

---

## Test Implementation Status

### ✅ FULLY IMPLEMENTED

1. **Narrative Structure** - Story/chapter/arc/moment hierarchy validated
2. **Scene Generation** - All required blocks and metadata generated
3. **Personality Influence** - Luminari/Shadow/Chronicler tested
4. **Branching Mechanics** - Branch targets, restrictions validated
5. **Party & Equipment** - Integration tested
6. **Mood & Environment** - Context handling verified
7. **Restrictions** - Content filtering validated
8. **Diagnostics** - Metadata generation complete
9. **Error Handling** - Basic edge cases covered

### ⏳ IN PROGRESS

1. **AI Agent Enhancements** - Quality system framework ready, needs expansion
2. **Advanced Edge Cases** - Additional stress testing planned
3. **Performance Validation** - Load testing not yet implemented

### 📋 FUTURE EXTENSIONS

- Custom personality archetypes
- Advanced environmental mechanics
- Multi-threaded narrative branching
- Narrative loop detection and prevention
- Machine learning-based quality scoring
- Dynamic difficulty based on party power
- Narrative achievements and unlock systems
- Cross-arc narrative callbacks and foreshadowing

---

## Running the Tests

### Run All Tests

```bash
npm run test
```

### Run Specific Test Category

```bash
# Narrative structure tests
npm run test -- narrative-structure.test.ts

# Scene generation tests
npm run test -- scene-generation.test.ts

# Branching mechanics tests
npm run test -- branching-mechanics.test.ts

# Mood and environment tests
npm run test -- mood-environment.test.ts

# Restriction service tests
npm run test -- restriction-service.test.ts
```

### Run with Coverage

```bash
npm run test -- --coverage
```

### Watch Mode (for development)

```bash
npm run test -- --watch
```

---

## For Creative Teams: How to Extend Tests

### Quick Start: Adding a New Test

1. **Identify what to test**: Narrative structure, scene behavior, personality, restrictions, or branching
2. **Find the test file**: Each category has its own file in `src/__tests__/lib/`
3. **Add a test case**:

```typescript
describe('My New Feature', () => {
  beforeEach(() => {
    // Setup
  });

  it('should validate new feature behavior', () => {
    // Arrange: Set up test data
    const testData = {
      /* Your test data */
    };

    // Act: Do the thing you're testing
    const result = await service.doSomething(testData);

    // Assert: Verify the result
    expect(result).toBeDefined();
    expect(result.someProperty).toHaveProperty('expectedValue');
  });
});
```

### Adding Test Data Without Code Changes

Most tests use test data that can be modified without touching code:

- **Narrative data**: `src/lib/data/sample-narrative.json`
- **Mock scenes**: Modify factory functions in test files
- **Party data**: Update snapshots in test setup
- **Equipment**: Modify equipment highlights in test context

### Common Test Patterns

**Testing narrative structure:**

```typescript
const validation = NarrativeStructureValidator.validateStoryStructure(story);
expect(validation.isValid).toBe(true);
expect(validation.errors).toHaveLength(0);
```

**Testing scene generation:**

```typescript
const scene = await assembler.buildScene(moment, context, personality);
const validation = SceneValidator.validateSceneDescriptor(scene);
expect(validation.hasRequiredBlocks).toBe(true);
```

**Testing branching logic:**

```typescript
const validation = NarrativeStructureValidator.validateBranchingLogic(story);
expect(validation.errors).toHaveLength(0);
```

**Testing personality differences:**

```typescript
const scene1 = await assembler.buildScene(moment, context, 'Luminari');
const scene2 = await assembler.buildScene(moment, context, 'Shadow');
expect(scene1).not.toEqual(scene2);
```

---

## Key Principles for Test Development

1. **Test Structure, Not Words**: Validate that narrative blocks exist and are properly organized, not that specific sentences appear
2. **No Content Rewrites on Test Changes**: Add new tests without requiring content modification
3. **Accessible to Non-Technical Teams**: Tests should be understandable and modifiable by designers and writers
4. **Leverage Metadata**: Use diagnostics and metadata structures to validate behavior instead of analyzing content
5. **Creative Flexibility**: Tests enable, not constrain, creative evolution
6. **Clear Diagnostics**: When tests fail, diagnostics should explain why in actionable terms

---

## Next Steps & Roadmap

### Q4 2025

- [ ] Expand AI Agent Enhancement tests
- [ ] Add stress tests (large party sizes, deep branching trees)
- [ ] Implement circular reference detection
- [ ] Create performance benchmarks

### Q1 2026

- [ ] Add narrative loop detection tests
- [ ] Implement dynamic difficulty testing framework
- [ ] Create cross-arc callback testing
- [ ] Add foreshadowing validation tests

### Q2 2026

- [ ] Machine learning-based quality scoring
- [ ] Advanced personality archetype testing
- [ ] Environmental hazard system tests
- [ ] Narrative achievement unlock testing

---

## Support & Resources

**Questions about tests?** Check `src/__tests__/TEST_IMPLEMENTATION_GUIDE.md` for detailed examples.

**Need to modify test data?** Edit files in `src/lib/data/` directly—no code changes needed.

**Creating new features?** Follow the patterns in existing tests and use validators from `src/__tests__/utils/test-validators.ts`.

**Report issues?** Document what you were testing, what you expected, and what actually happened in your scene diagnostics.
