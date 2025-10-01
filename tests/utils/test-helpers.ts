// Jest globals for TypeScript
declare const jest: any
declare const expect: any
declare const beforeEach: any
declare const afterEach: any

import { render, RenderOptions, RenderResult } from '@testing-library/react'
import React, { ReactElement } from 'react'
// Prisma imports (will be resolved when Prisma client is generated)
// import { PrismaClient } from '@prisma/client'

// Using any type for PrismaClient for test utilities
type PrismaClient = any
import { Story, Chapter, Arc, Moment } from '@/lib/types'

// Database test utilities
export class TestDatabase {
  private static prisma: PrismaClient | null = null

  static getInstance(): PrismaClient {
    if (!this.prisma) {
      // Mock PrismaClient for test environment
      this.prisma = {} as PrismaClient
    }
    return this.prisma
  }

  static async setupTestDatabase(): Promise<void> {
    const prisma = this.getInstance()

    // Clean up existing data
    await prisma.moment.deleteMany()
    await prisma.arc.deleteMany()
    await prisma.chapter.deleteMany()
    await prisma.story.deleteMany()

    // Note: Add any additional setup here
  }

  static async cleanupTestDatabase(): Promise<void> {
    const prisma = this.getInstance()

    // Clean up in reverse order of dependencies
    await prisma.moment.deleteMany()
    await prisma.arc.deleteMany()
    await prisma.chapter.deleteMany()
    await prisma.story.deleteMany()

    await prisma.$disconnect()
  }
}

// Async test utilities
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const createDeferredPromise = <T = void>(): {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
} => {
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: any) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve: resolve!, reject: reject! }
}

// Mock implementations for external dependencies
export const mockFirebaseAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback: any) => {
    callback(null)
    return () => {}
  }),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}

export const mockFirebaseFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    where: jest.fn(() => ({
      get: jest.fn(),
    })),
    orderBy: jest.fn(() => ({
      get: jest.fn(),
    })),
  })),
}

// Component test utilities
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<any>
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { wrapper, ...renderOptions } = options

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children)
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'

// Test data validation utilities
export const validateStoryStructure = (story: Story): void => {
  expect(story).toBeDefined()
  expect(story.id).toBeDefined()
  expect(story.title).toBeDefined()
  expect(story.summary).toBeDefined()
  expect(Array.isArray(story.chapters)).toBe(true)

  story.chapters.forEach(chapter => {
    validateChapterStructure(chapter)
  })
}

export const validateChapterStructure = (chapter: Chapter): void => {
  expect(chapter).toBeDefined()
  expect(chapter.id).toBeDefined()
  expect(chapter.name).toBeDefined()
  expect(chapter.synopsis).toBeDefined()
  expect(chapter.storyId).toBeDefined()
  expect(Array.isArray(chapter.arcs)).toBe(true)

  chapter.arcs.forEach(arc => {
    validateArcStructure(arc)
  })
}

export const validateArcStructure = (arc: Arc): void => {
  expect(arc).toBeDefined()
  expect(arc.id).toBeDefined()
  expect(arc.label).toBeDefined()
  expect(arc.theme).toBeDefined()
  expect(arc.chapterId).toBeDefined()
  expect(arc.storyId).toBeDefined()
  expect(Array.isArray(arc.moments)).toBe(true)

  arc.moments.forEach(moment => {
    validateMomentStructure(moment)
  })
}

export const validateMomentStructure = (moment: Moment): void => {
  expect(moment).toBeDefined()
  expect(moment.id).toBeDefined()
  expect(moment.momentId).toBeDefined()
  expect(moment.title).toBeDefined()
  expect(moment.content).toBeDefined()
  expect(moment.arcId).toBeDefined()
  expect(moment.chapterId).toBeDefined()
  expect(moment.storyId).toBeDefined()
  expect(Array.isArray(moment.timeline)).toBe(true)
  expect(Array.isArray(moment.themes)).toBe(true)
  expect(Array.isArray(moment.lore)).toBe(true)
  expect(Array.isArray(moment.subtext)).toBe(true)
  expect(Array.isArray(moment.branchingHooks)).toBe(true)
  expect(Array.isArray(moment.sensoryAnchors)).toBe(true)
  expect(Array.isArray(moment.loreRefs)).toBe(true)
  expect(Array.isArray(moment.restrictionTags)).toBe(true)
}

export const validateSceneDescriptorStructure = (sceneDescriptor: any): void => {
  expect(sceneDescriptor).toBeDefined()
  expect(sceneDescriptor.sceneId).toBeDefined()
  expect(sceneDescriptor.title).toBeDefined()
  expect(sceneDescriptor.narrativeText).toBeDefined()
  expect(sceneDescriptor.mood).toBeDefined()
  expect(Array.isArray(sceneDescriptor.assetHooks)).toBe(true)
  expect(Array.isArray(sceneDescriptor.recommendedChoices)).toBe(true)
  expect(Array.isArray(sceneDescriptor.partyHighlights)).toBe(true)
  expect(Array.isArray(sceneDescriptor.equipmentHighlights)).toBe(true)
  expect(Array.isArray(sceneDescriptor.branchOptions)).toBe(true)
  expect(sceneDescriptor.diagnostics).toBeDefined()
  expect(sceneDescriptor.dreamweaverPersonality).toBeDefined()
  expect(['Luminari', 'Shadow', 'Chronicler']).toContain(sceneDescriptor.dreamweaverPersonality)
}

// Performance testing utilities
export const measureExecutionTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start

  return { result, duration }
}

export const expectExecutionTimeUnder = async (
  fn: () => Promise<any>,
  maxDuration: number,
  timeout: number = 5000
): Promise<void> => {
  const { duration } = await measureExecutionTime(fn)
  expect(duration).toBeLessThan(maxDuration)
}

// Memory usage testing utilities (Node.js environment)
export const measureMemoryUsage = () => {
  return (process as any).memoryUsage()
}

export const expectMemoryUsageUnder = (
  usage: any,
  maxHeapUsed: number
): void => {
  expect(usage.heapUsed).toBeLessThan(maxHeapUsed)
}

// Error testing utilities
export const expectToThrow = async (fn: () => Promise<any>): Promise<Error> => {
  try {
    await fn()
    throw new Error('Expected function to throw, but it did not')
  } catch (error) {
    if (error instanceof Error) {
      return error
    }
    throw error
  }
}

export const expectToThrowWithMessage = async (
  fn: () => Promise<any>,
  expectedMessage: string
): Promise<void> => {
  const error = await expectToThrow(fn)
  expect(error.message).toContain(expectedMessage)
}

// Mock console methods to avoid noise in tests
export const mockConsole = () => {
  const originalConsole = { ...console }

  beforeEach(() => {
    console.log = jest.fn()
    console.warn = jest.fn()
    console.error = jest.fn()
    console.info = jest.fn()
  })

  afterEach(() => {
    Object.assign(console, originalConsole)
  })

  return { originalConsole }
}

// Test timeout utilities
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    }),
  ])
}

// Deep equality testing with better error messages
export const expectDeepEqual = <T>(actual: T, expected: T): void => {
  try {
    expect(actual).toEqual(expected)
  } catch (error) {
    console.error('Expected:', JSON.stringify(expected, null, 2))
    console.error('Actual:', JSON.stringify(actual, null, 2))
    throw error
  }
}

// Array testing utilities
export const expectArrayToContainObject = <T extends Record<string, any>>(
  array: T[],
  expectedObject: Partial<T>
): void => {
  const found = array.some(item =>
    Object.entries(expectedObject).every(([key, value]) =>
      item[key] === value
    )
  )
  expect(found).toBe(true)
}

export const expectArrayToHaveLength = <T>(array: T[], expectedLength: number): void => {
  expect(array).toHaveLength(expectedLength)
}

// String testing utilities
export const expectStringToContain = (actual: string, expected: string): void => {
  expect(actual).toContain(expected)
}

export const expectStringToMatch = (actual: string, pattern: RegExp): void => {
  expect(actual).toMatch(pattern)
}

// Type testing utilities
export const expectType = <T>(value: any): T => {
  return value as T
}

// Database seed utilities for integration tests
export const seedTestStory = async (prisma: PrismaClient, storyData?: Partial<any>): Promise<string> => {
  const story = await prisma.story.create({
    data: {
      storyId: `test_story_${Date.now()}`,
      title: 'Test Story',
      summary: 'A test story for integration testing',
      ...storyData,
    },
  })
  return story.id
}

export const seedTestChapter = async (
  prisma: PrismaClient,
  storyId: string,
  chapterData?: Partial<any>
): Promise<string> => {
  const chapter = await prisma.chapter.create({
    data: {
      chapterId: `test_chapter_${Date.now()}`,
      name: 'Test Chapter',
      synopsis: 'A test chapter',
      metadata: '{}',
      storyId,
      ...chapterData,
    },
  })
  return chapter.id
}

export const seedTestArc = async (
  prisma: PrismaClient,
  chapterId: string,
  arcData?: Partial<any>
): Promise<string> => {
  const arc = await prisma.arc.create({
    data: {
      arcId: `test_arc_${Date.now()}`,
      label: 'Test Arc',
      theme: 'adventure',
      chapterId,
      ...arcData,
    },
  })
  return arc.id
}

export const seedTestMoment = async (
  prisma: PrismaClient,
  arcId: string,
  momentData?: Partial<any>
): Promise<string> => {
  const moment = await prisma.moment.create({
    data: {
      momentId: `test_moment_${Date.now()}`,
      title: 'Test Moment',
      content: 'Test moment content',
      timeline: '["present"]',
      themes: '["adventure"]',
      lore: '[]',
      subtext: '[]',
      narrativeBeats: 'Test narrative beats',
      branchingHooks: '[]',
      sensoryAnchors: '["silence"]',
      loreRefs: '[]',
      restrictionTags: '["safe"]',
      arcId,
      ...momentData,
    },
  })
  return moment.id
}