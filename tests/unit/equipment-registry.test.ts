import { EquipmentRegistry } from '@/lib/equipment-registry';
import type { EquipmentItem } from '@/lib/types';

describe('EquipmentRegistry', () => {
  let equipmentRegistry: EquipmentRegistry;

  beforeEach(() => {
    equipmentRegistry = new EquipmentRegistry();
  });

  test('should initialize with sample equipment data', () => {
    const allEquipment = equipmentRegistry.getAllEquipment();
    expect(allEquipment).toBeDefined();
    expect(Array.isArray(allEquipment)).toBe(true);
    expect(allEquipment.length).toBeGreaterThan(0);
  });

  test('should get a specific equipment item by ID', () => {
    const allEquipment = equipmentRegistry.getAllEquipment();
    if (allEquipment.length > 0) {
      const testItem = allEquipment[0];
      const retrievedItem = equipmentRegistry.getEquipmentItem(testItem.itemId);
      
      expect(retrievedItem).toBeDefined();
      expect(retrievedItem?.itemId).toBe(testItem.itemId);
      expect(retrievedItem?.name).toBe(testItem.name);
    }
  });

  test('should return undefined for non-existent equipment item', () => {
    const nonExistentItem = equipmentRegistry.getEquipmentItem('non-existent-id');
    expect(nonExistentItem).toBeUndefined();
  });

  test('should list equipment for a specific party member', () => {
    const equipmentForParty = equipmentRegistry.listForParty('member-1');
    expect(equipmentForParty).toBeDefined();
    expect(Array.isArray(equipmentForParty)).toBe(true);
  });

  test('should handle equipment with gear tags', () => {
    const allEquipment = equipmentRegistry.getAllEquipment();
    if (allEquipment.length > 0) {
      const testItem = allEquipment[0];
      
      // Check if item has gear tags and test the functionality
      if (testItem.gearTags && testItem.gearTags.length > 0) {
        const hasTag = equipmentRegistry.hasGearTags(testItem.itemId, [testItem.gearTags[0]]);
        expect(hasTag).toBe(true);
      }
      
      // Test with non-matching tags
      const hasNonMatchingTag = equipmentRegistry.hasGearTags(testItem.itemId, ['non-matching-tag']);
      expect(hasNonMatchingTag).toBe(false);
    }
  });

  test('should manage equipped items for party members', () => {
    // Get initial equipped items for a member
    const initialEquipped = equipmentRegistry.getEquippedForMember('member-1');
    expect(initialEquipped).toBeDefined();
    expect(Array.isArray(initialEquipped)).toBe(true);

    // Get an item to equip (if available)
    const allEquipment = equipmentRegistry.getAllEquipment();
    if (allEquipment.length > 0) {
      const testItem = allEquipment[0];
      
      // Try to equip an item
      const equipResult = equipmentRegistry.equipItem('member-2', testItem.itemId);
      expect(equipResult).toBe(true);
      
      // Verify the item is now equipped
      const updatedEquipped = equipmentRegistry.getEquippedForMember('member-2');
      const isEquipped = updatedEquipped.some(item => item.itemId === testItem.itemId);
      expect(isEquipped).toBe(true);
    }
  });

  test('should manage inventory for party members', () => {
    // Get initial inventory for a member
    const initialInventory = equipmentRegistry.getInventoryForMember('member-1');
    expect(initialInventory).toBeDefined();
    
    const allEquipment = equipmentRegistry.getAllEquipment();
    if (allEquipment.length > 0) {
      const testItem = allEquipment[0];
      
      // Add item to inventory
      const addResult = equipmentRegistry.addToInventory('member-3', testItem.itemId, 5);
      expect(addResult).toBe(true);
      
      // Check if item is in inventory
      const updatedInventory = equipmentRegistry.getInventoryForMember('member-3');
      expect(updatedInventory.get(testItem.itemId)).toBe(5);
      
      // Remove some items from inventory
      const removeResult = equipmentRegistry.removeFromInventory('member-3', testItem.itemId, 2);
      expect(removeResult).toBe(true);
      
      // Check if quantity is updated
      const finalInventory = equipmentRegistry.getInventoryForMember('member-3');
      expect(finalInventory.get(testItem.itemId)).toBe(3);
    }
  });

  test('should handle inventory removal edge cases', () => {
    const allEquipment = equipmentRegistry.getAllEquipment();
    if (allEquipment.length > 0) {
      const testItem = allEquipment[0];
      
      // Try to remove more items than available
      const removeResult = equipmentRegistry.removeFromInventory('member-1', testItem.itemId, 999);
      expect(removeResult).toBe(false); // Should fail when not enough items
      
      // Add an item first
      equipmentRegistry.addToInventory('member-2', testItem.itemId, 3);
      
      // Try to remove more than available
      const tooManyResult = equipmentRegistry.removeFromInventory('member-2', testItem.itemId, 5);
      expect(tooManyResult).toBe(false);
      
      // Verify the item count is unchanged
      const inventory = equipmentRegistry.getInventoryForMember('member-2');
      expect(inventory.get(testItem.itemId)).toBe(3);
    }
  });
});