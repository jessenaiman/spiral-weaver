# Omega Spiral Test Implementation Guide

## Overview

This guide enables creative and design teams to write, modify, and extend test cases without complex rewrites. Tests validate narrative blocks, metadata, and cohesive structure—not exact content.

---

## Test Structure

All tests follow this pattern:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup shared test data
  });

  describe('Sub-feature', () => {
    it('should validate specific behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

---

## Test Categories

### 1. Narrative Structure Tests

**File:** `src/__tests__/lib/narrative-structure.test.ts`

**What it tests:**
- Story, chapter, arc, and moment relationships
- Metadata completeness (IDs, references)
- Branching hook validity
- Cross-reference integrity

**For creative teams:**
- Modify test data in `src/lib/data/sample-narrative.json` to test new narrative structures
- Add new describe blocks for new features (e.g., "Narrative Forks", "Alternative Endings")
- Tests focus on structure, not content—change narrative freely

**Example addition:**
```typescript
describe('New Narrative Feature', () => {
  it('should validate new feature metadata', () => {
    // Get test data
    const moment = await shelf.getMoment(storyId, chapterId, arcId, momentId);
    
    // Validate your new feature exists and is properly structured
    expect(moment.newFeature).toBeDefined();
    expect(Array.isArray(moment.newFeature)).toBe(true);
  });
});
```

---

### 2. Scene Generation Tests (Mocked)

**File:** `src/__tests__/lib/scene-generation.mock.test.ts`

**What it tests:**
- Scene descriptor blocks and metadata
- Personality differentiation (Luminari, Shadow, Chronicler)
- Diagnostics metadata generation
- Equipment and party highlights

**For creative teams:**
- Modify mock scene creation function to test new personality behaviors
- Add personality-specific assertions
- Test new scene blocks without AI dependencies

**Example addition:**
```typescript
it('should generate new personality type', () => {
  const scene = createMockScene('NewPersonality');
  
  expect(scene.dreamweaverPersonality).toBe('NewPersonality');
  expect(scene.title).toBeDefined();
  // Add personality-specific validation
});
```

---

### 3. Branching Mechanics Tests

**File:** `src/__tests__/lib/branching-mechanics.test.ts`

**What it tests:**
- Branching hook validity
- Restriction tag application
- Branch option structure
- Probability calculations

**For creative teams:**
- Test new restriction types by adding them to sample data
- Validate complex branching scenarios
- Verify restriction logic without modifying core code

**Example addition:**
```typescript
it('should respect new restriction type', () => {
  const validation = NarrativeStructureValidator.validateBranchingLogic(story);
  
  story.chapters.forEach(chapter => {
    chapter.arcs.forEach(arc => {
      arc.moments.forEach(moment => {
        if (moment.restrictionTags.includes('new-type')) {
          // Validate behavior specific to new restriction
          expect(moment.branchingHooks.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
```

---

### 4. Mood and Environment Tests (Mocked)

**File:** `src/__tests__/lib/mood-environment.mock.test.ts`

**What it tests:**
- Mood metadata in scenes
- Environment state handling
- Diagnostics metadata
- Context integration

**For creative teams:**
- Add new mood types to `createSceneWithContext`
- Test mood/environment combinations
- Validate diagnostics reflect creative choices

**Example addition:**
```typescript
it('should handle new mood with new environment', () => {
  const scene = createSceneWithContext('new-mood', 'new-environment');
  
  expect(scene.mood).toBe('new-mood');
  expect(scene.diagnostics.appliedRestrictions).toContain('environment-new-environment');
});
```

---

## Test Utilities

**File:** `src/__tests__/utils/test-validators.ts`

Provides reusable validators:

- `NarrativeStructureValidator.validateStoryStructure()` - Validates entity relationships
- `NarrativeStructureValidator.validateBranchingLogic()` - Validates branching
- `SceneValidator.validateSceneDescriptor()` - Validates scene blocks
- `SceneValidator.validateContextIntegration()` - Validates context reflection
- `PersonalityValidator.validatePersonalityInfluence()` - Validates personality differences

**Using validators:**
```typescript
const validation = NarrativeStructureValidator.validateStoryStructure(story);
expect(validation.isValid).toBe(true);
expect(validation.errors).toHaveLength(0);
```

---

## Adding New Tests

### Step 1: Identify What to Test
- Narrative blocks (content structure)
- Metadata (IDs, references, arrays)
- Context integration (mood, environment)
- Personality influence (distinct behaviors)

### Step 2: Create Test File
Name: `src/__tests__/lib/[feature].test.ts` or `[feature].mock.test.ts`

### Step 3: Structure Test
```typescript
describe('Feature', () => {
  let testData;
  
  beforeEach(() => {
    // Setup
  });
  
  describe('Sub-feature', () => {
    it('should validate metadata', () => {
      // Arrange, Act, Assert
    });
  });
});
```

### Step 4: Use Validators
Import and use existing validators rather than creating new ones:
```typescript
import { NarrativeStructureValidator } from '../utils/test-validators';
```

### Step 5: Run Tests
```bash
npx jest src/__tests__/lib/[feature].test.ts --no-coverage
```

---

## Running All Tests

```bash
# Run all tests in __tests__/lib
npx jest src/__tests__/lib --no-coverage

# Run specific test file
npx jest src/__tests__/lib/narrative-structure.test.ts --no-coverage

# Run with coverage
npx jest src/__tests__/lib --coverage
```

---

## Key Principles

1. **Test Structure, Not Content** - Validate blocks and metadata exist, not exact text
2. **Use Mocks for AI** - Tests with `.mock.test.ts` don't depend on AI services
3. **Focus on Relationships** - Validate how entities connect and reference each other
4. **Personality Differentiation** - Ensure different personalities produce distinct structures
5. **Metadata Completeness** - Validate all required metadata blocks are present and valid

---

## Troubleshooting

**Test fails with "Cannot use import statement":**
- Ensure `jest.config.js` has `transformIgnorePatterns` configured
- For AI-dependent tests, use `.mock.test.ts` version instead

**Test data not loading:**
- Verify sample data files exist in `src/lib/data/`
- Check file paths in ReferenceShelf initialization

**Assertion fails unexpectedly:**
- Add `console.log()` to debug
- Check test setup and beforeEach hooks
- Verify test data is valid

---

## Next Steps for Creative Team

1. Review existing tests in `src/__tests__/lib/`
2. Run tests locally: `npx jest src/__tests__/lib --no-coverage`
3. Modify sample data in `src/lib/data/` to test new features
4. Add new test cases using existing patterns
5. Submit test additions for review

Tests remain maintainable by focusing on blocks and metadata, enabling creative freedom without technical rewrites.