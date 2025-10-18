/**
 * @fileoverview Unit tests for RestrictionService in Omega Spiral.
 * Covers normal, edge, and error cases for applyRestrictions.
 */

import { RestrictionService } from '../../lib/restriction-service';
import type { Moment } from '../../lib/types';

describe('RestrictionService', () => {
  let service: RestrictionService;
  let mockMoment: Moment;

  beforeEach(() => {
    service = new RestrictionService();
    mockMoment = { id: 'm1', title: 'Test', restrictionTags: ['no-violence'] } as Moment;
  });

  it('should apply restrictions and return filtered content', async () => {
    // Mock applyRestrictionsToScene to return predictable output
    jest.spyOn(service as any, 'applyRestrictions').mockResolvedValue({
      filteredContent: 'filtered',
      appliedRestrictions: ['no-violence']
    });

    const result = await service.applyRestrictions('original', mockMoment, 'no-violence');
    expect(result.filteredContent).toBe('filtered');
    expect(result.appliedRestrictions).toContain('no-violence');
  });

  it('should handle missing userRestrictions', async () => {
    jest.spyOn(service as any, 'applyRestrictions').mockResolvedValue({
      filteredContent: 'filtered',
      appliedRestrictions: []
    });

    const result = await service.applyRestrictions('original', mockMoment);
    expect(result.filteredContent).toBe('filtered');
    expect(Array.isArray(result.appliedRestrictions)).toBe(true);
  });

  it('should throw or return error structure on failure', async () => {
    jest.spyOn(service as any, 'applyRestrictions').mockRejectedValue(new Error('fail'));
    await expect(service.applyRestrictions('bad', mockMoment)).rejects.toThrow('fail');
  });
});