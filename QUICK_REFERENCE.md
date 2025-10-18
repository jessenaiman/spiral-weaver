# Omega Spiral Test Framework - Quick Reference Card

## 🎮 For Game Designers

### Add a New Feature

1. Identify what you're testing (branching? mood? personality?)
2. Look at similar test in `src/__tests__/lib/`
3. Copy the pattern
4. Modify test data (JSON files) instead of code
5. Run: `npx jest feature-name.test.ts`

### Key Commands

```bash
npx jest                          # Run all tests
npx jest --watch                  # Watch mode
npx jest branching-mechanics.test.ts  # Specific test
npx jest --coverage               # See coverage
```

### Test Files by Feature

| Want to Test | File |
|---|---|
| Story structure | `narrative-structure.test.ts` |
| How scenes work | `scene-generation.test.ts` |
| Personalities | `scene-generation.test.ts` |
| Branching logic | `branching-mechanics.test.ts` |
| Mood/environment | `mood-environment.test.ts` |
| Content filtering | `restriction-service.test.ts` |
| Party/equipment | `scene-generation.test.ts` |

---

## ✍️ For Narrative Writers

### Modify Story Content

1. Open `src/lib/data/sample-narrative.json`
2. Add/modify your chapters, arcs, moments
3. Keep the same JSON structure
4. Run tests - they validate structure automatically
5. Modify narrative freely - tests track mechanics, not words

### No Code Changes Needed!

- Tests validate **structure**, not **content**
- Change narrative text → Tests still pass ✅
- Add new chapters → Tests validate relationships ✅
- Create new branches → Tests verify they work ✅

### Example: Add a Chapter

```json
{
  "chapters": [
    {
      "id": "ch1",
      "name": "Your Chapter Name",
      "arcs": [
        {
          "id": "arc1",
          "moments": [
            {
              "id": "m1",
              "title": "Your Moment",
              "content": "Your narrative text here..."
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🔧 For AI/Genkit Specialists

### Understanding Scene Assembly

```
Moment (Story Data)
    ↓
+ Runtime Context (party, mood, environment)
    ↓
+ Personality (Luminari/Shadow/Chronicler)
    ↓
+ Restrictions (content policies)
    ↓
= SceneDescriptor (fully composed scene)
```

### Test Personality Behavior

```bash
npx jest scene-generation.test.ts -t "Luminari"
npx jest scene-generation.test.ts -t "Shadow"
npx jest scene-generation.test.ts -t "Chronicler"
```

### Read Scene Diagnostics

Every scene includes:
- `appliedRestrictions` - What policies shaped this scene
- `moodAdjustments` - How emotion affected it
- `branchForecast` - What options are available
- `enhancements` - AI suggestions for improvement
- `qualityScore` - How good is this scene?

---

## 📊 For QA/Testers

### Before Release

```bash
npx jest --coverage        # Check coverage
npx jest --verbose         # Detailed output
npx jest --bail            # Stop on first failure
```

### Review Test Results

- **Terminal:** Quick pass/fail
- **junit.xml:** CI/CD integration
- **test-report.html:** Human-readable HTML
- **coverage/:** Code coverage details

### Common Test Failures

| Error | Solution |
|---|---|
| "Moment not found" | Check moment ID in narrative data |
| "Invalid branch target" | Verify branch points to real moment |
| "Personality undefined" | Use: Luminari, Shadow, or Chronicler |
| "Missing party data" | Add partySnapshot to context |

---

## 📚 For Developers

### Extend the Framework

1. Study existing test pattern
2. Create new test file: `feature-name.test.ts`
3. Follow this structure:

```typescript
describe('Feature Name', () => {
  let testData;

  beforeEach(() => {
    // Setup
  });

  it('should validate behavior', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Add Test Utilities

Use validators from `src/__tests__/utils/test-validators.ts`:

```typescript
// Validate narrative structure
const validation = NarrativeStructureValidator
  .validateStoryStructure(story);

// Validate scene descriptor
const sceneValidation = SceneValidator
  .validateSceneDescriptor(scene);

// Validate personality differences
const personalityDiff = PersonalityValidator
  .validatePersonalityInfluence(scene1, scene2);
```

### Test Best Practices

✅ Test structure, not content  
✅ Use metadata for validation  
✅ Include multiple contexts  
✅ Test error cases  
✅ Document expectations  
❌ Don't check exact text  
❌ Don't validate word count  
❌ Don't parse narrative content  

---

## 📖 Documentation Map

| Need | Read |
|---|---|
| How to use tests | `TEST_IMPLEMENTATION_GUIDE.md` |
| All test categories | `MASTER_TEST_CASES.md` |
| What's implemented | `TEST_CASE_REVIEW.md` |
| What was built | `WHATS_DEVELOPED.md` |
| Example tests | `src/__tests__/lib/` |
| Test data | `src/lib/data/sample-narrative.json` |

---

## 🎯 Test Categories at a Glance

### 1. Narrative Structure ✅
- Story → Chapter → Arc → Moment relationships
- Branching hook validity
- ID consistency

### 2. Scene Generation ✅
- All required blocks present
- Metadata complete
- Diagnostics generated

### 3. Personalities ✅
- Luminari (idealistic)
- Shadow (realistic)
- Chronicler (impartial)

### 4. Branching ✅
- Valid targets
- Restrictions apply
- Probabilities sum to 1.0

### 5. Party & Equipment ✅
- Party snapshots integrated
- Equipment highlighted
- Party affinities reflected

### 6. Mood & Environment ✅
- Context reflected in scenes
- Transitions tracked
- Diagnostics updated

### 7. Restrictions ✅
- Policies enforced
- Multiple types supported
- Fallback content provided

### 8. Diagnostics ✅
- All metadata present
- Decision-making visible
- Issues reported clearly

### 9. Error Handling ✅
- Graceful degradation
- Fallback logic
- Edge cases handled

### 10. AI Enhancements ⏳
- Quality scoring ready
- Suggestion framework ready
- Enhancement engine in progress

---

## 🚀 Quick Wins (Try These First)

### 1. Add a New Moment
```
Edit src/lib/data/sample-narrative.json
Add moment with id, title, content
Run: npx jest narrative-structure.test.ts
✓ Structure validated automatically
```

### 2. Test a Personality
```
Run: npx jest scene-generation.test.ts -t "Shadow"
Check output for personality-specific metadata
Review diagnostics to understand why
```

### 3. Create a Branch Restriction
```
Add restriction tag to moment
Run: npx jest branching-mechanics.test.ts
Verify restriction is applied
```

### 4. Debug a Scene
```
Find scene in test output
Look at diagnostics.appliedRestrictions
Check diagnostics.moodAdjustments
Review diagnostics.enhancements
```

---

## 💡 Remember

### The Core Principle
```
Tests validate ARCHITECTURE, not CONTENT
           ↓
    Creative teams can modify
           ↓
 Freely without breaking tests
```

### What Tests Check
✅ Does this scene have all required blocks?  
✅ Are relationships valid?  
✅ Is metadata properly populated?  
✅ Did restrictions apply correctly?  
✅ Are branch targets real moments?  

### What Tests Don't Check
❌ Exact narrative text  
❌ Specific word choices  
❌ Sentence structure  
❌ Grammar/spelling  
❌ Exact content  

**This is intentional!** It frees creatives to innovate.

---

## 🔗 Quick Links

- **Test Suite:** Run `npx jest`
- **Watch Mode:** Run `npx jest --watch`
- **HTML Report:** `test-results/test-report.html`
- **Coverage:** `coverage/lcov-report/index.html`
- **Test Files:** `src/__tests__/lib/`
- **Test Data:** `src/lib/data/`
- **Documentation:** `*.md` files in project root

---

## 📞 Common Questions

**Q: I modified narrative text, why did tests break?**  
A: Tests shouldn't break for content changes. Check if you changed structure (IDs, relationships, etc.)

**Q: How do I add a new restriction type?**  
A: Add to moment's restrictionTags array in JSON. Tests validate automatically.

**Q: Can I create a new personality?**  
A: Yes! Update types.ts with new personality, update tests to check it.

**Q: What if a test fails?**  
A: Check diagnostics output. It explains why scene was generated that way.

**Q: Do I need to know programming?**  
A: No! Most modifications are JSON data. Minimal code understanding needed.

---

**Last Updated:** October 18, 2025  
**Status:** Ready for Creative Team Use  
**Questions?** Check the full documentation files or example tests.
