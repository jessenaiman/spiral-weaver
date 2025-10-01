import type { EquipmentItem } from './types';
import equipmentData from './data/sample-equipment.json';

/**
 * The EquipmentRegistry manages equipment-related data including 
 * equipped items, inventory, and gear tags.
 */
export class EquipmentRegistry {
  private equipment: Map<string, EquipmentItem>;
  private equippedItems: Map<string, string[]>; // Map of party member ID to their equipped item IDs
  private inventory: Map<string, Map<string, number>>; // Map of party member ID to item ID to quantity

  constructor() {
    this.equipment = new Map();
    this.equippedItems = new Map();
    this.inventory = new Map();
    
    // Initialize with sample data
    this.loadSampleData();
  }

  private loadSampleData() {
    // Load equipment data
    const equipmentList = equipmentData as EquipmentItem[];
    equipmentList.forEach(item => {
      this.equipment.set(item.itemId, item);
    });

    // Initialize equipped items for sample party members
    // In a real implementation, this would come from character data
    this.equippedItems.set('member-1', ['sword-001', 'shield-001']);
    this.equippedItems.set('member-2', ['bow-001']);
    this.equippedItems.set('member-3', ['staff-001']);

    // Initialize basic inventory
    this.inventory.set('member-1', new Map([['potion-001', 3]]));
    this.inventory.set('member-2', new Map([['arrows-001', 20]]));
    this.inventory.set('member-3', new Map([['mana-potion-001', 2]]));
  }

  /**
   * Gets a specific equipment item by ID
   */
  getEquipmentItem(itemId: string): EquipmentItem | undefined {
    return this.equipment.get(itemId);
  }

  /**
   * Gets all available equipment items
   */
  getAllEquipment(): EquipmentItem[] {
    return Array.from(this.equipment.values());
  }

  /**
   * Gets equipment items available for a specific party
   */
  listForParty(partyId: string): EquipmentItem[] {
    const partyInventory = this.inventory.get(partyId);
    if (!partyInventory) return [];

    const items: EquipmentItem[] = [];
    for (const [itemId] of partyInventory) {
      const item = this.getEquipmentItem(itemId);
      if (item) {
        items.push(item);
      }
    }
    return items;
  }

  /**
   * Gets equipped items for a specific party member
   */
  getEquippedForMember(memberId: string): EquipmentItem[] {
    const equippedIds = this.equippedItems.get(memberId) || [];
    return equippedIds
      .map(id => this.getEquipmentItem(id))
      .filter(Boolean) as EquipmentItem[];
  }

  /**
   * Gets the inventory for a specific party member
   */
  getInventoryForMember(memberId: string): Map<string, number> {
    return this.inventory.get(memberId) || new Map();
  }

  /**
   * Equips an item for a specific party member
   */
  equipItem(memberId: string, itemId: string): boolean {
    if (!this.equipment.has(itemId)) return false;

    let equippedList = this.equippedItems.get(memberId);
    if (!equippedList) {
      equippedList = [];
      this.equippedItems.set(memberId, equippedList);
    }

    if (!equippedList.includes(itemId)) {
      equippedList.push(itemId);
    }
    return true;
  }

  /**
   * Unequips an item for a specific party member
   */
  unequipItem(memberId: string, itemId: string): boolean {
    const equippedList = this.equippedItems.get(memberId);
    if (!equippedList) return false;

    const index = equippedList.indexOf(itemId);
    if (index !== -1) {
      equippedList.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Adds an item to a party member's inventory
   */
  addToInventory(memberId: string, itemId: string, quantity: number = 1): boolean {
    if (!this.equipment.has(itemId)) return false;

    let memberInventory = this.inventory.get(memberId);
    if (!memberInventory) {
      memberInventory = new Map();
      this.inventory.set(memberId, memberInventory);
    }

    const currentQuantity = memberInventory.get(itemId) || 0;
    memberInventory.set(itemId, currentQuantity + quantity);
    return true;
  }

  /**
   * Removes an item from a party member's inventory
   */
  removeFromInventory(memberId: string, itemId: string, quantity: number = 1): boolean {
    const memberInventory = this.inventory.get(memberId);
    if (!memberInventory) return false;

    const currentQuantity = memberInventory.get(itemId) || 0;
    if (currentQuantity < quantity) return false; // Not enough items

    if (currentQuantity === quantity) {
      memberInventory.delete(itemId); // Remove if quantity becomes 0
    } else {
      memberInventory.set(itemId, currentQuantity - quantity);
    }
    return true;
  }

  /**
   * Checks if an item has specific gear tags
   */
  hasGearTags(itemId: string, tags: string[]): boolean {
    const item = this.getEquipmentItem(itemId);
    if (!item || !item.gearTags) return false;

    return tags.some(tag => item.gearTags.includes(tag));
  }
}