/**
 * Categorization utilities for grocery items using a local dictionary approach.
 * This avoids the need for AI calls while covering 90%+ of common cases.
 */

import { GROCERY_CATEGORIES, type GroceryCategory } from './categoryDictionary'

export interface CategorizedItem {
  content: string
  category: GroceryCategory
  confidence: 'high' | 'low'
}

/**
 * Normalize text for comparison (remove accents, lowercase, trim)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ')
}

/**
 * Categorize a single item based on its content.
 * Returns the category and a confidence level based on exact vs partial match.
 */
export function categorizeItem(content: string): CategorizedItem {
  const normalizedContent = normalizeText(content)

  // First, try exact match with keywords
  for (const [category, keywords] of Object.entries(GROCERY_CATEGORIES)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword)

      // Exact match (high confidence)
      if (normalizedContent === normalizedKeyword) {
        return {
          content,
          category: category as GroceryCategory,
          confidence: 'high',
        }
      }

      // Partial match - check if the keyword is contained in the content
      // or if the content is contained in the keyword (for singular/plural variants)
      if (
        normalizedContent.includes(normalizedKeyword) ||
        normalizedKeyword.includes(normalizedContent)
      ) {
        // Make sure it's a word boundary match for better accuracy
        const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i')
        if (regex.test(normalizedContent) || regex.test(normalizedKeyword)) {
          return {
            content,
            category: category as GroceryCategory,
            confidence: 'low',
          }
        }
      }
    }
  }

  // No match found
  return { content, category: 'Autres', confidence: 'low' }
}

/**
 * Categorize multiple items at once.
 */
export function categorizeItems(items: string[]): CategorizedItem[] {
  return items.map(categorizeItem)
}

/**
 * Group categorized items by category.
 */
export function groupByCategory(
  items: CategorizedItem[]
): Record<GroceryCategory, CategorizedItem[]> {
  const groups: Record<string, CategorizedItem[]> = {}

  // Initialize all categories with empty arrays
  for (const category of Object.keys(GROCERY_CATEGORIES)) {
    groups[category] = []
  }
  groups['Autres'] = []

  // Group items
  for (const item of items) {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
  }

  // Remove empty categories
  const result: Record<GroceryCategory, CategorizedItem[]> = {} as any
  for (const [category, items] of Object.entries(groups)) {
    if (items.length > 0) {
      result[category as GroceryCategory] = items
    }
  }

  return result
}

/**
 * Check if an item belongs to a specific category.
 */
export function isInCategory(content: string, category: GroceryCategory): boolean {
  const result = categorizeItem(content)
  return result.category === category
}

/**
 * Get a display-friendly category name.
 */
export function getCategoryDisplayName(category: GroceryCategory): string {
  return category
}

/**
 * Get category color for display purposes.
 */
export function getCategoryColor(category: GroceryCategory): string {
  const colors: Record<GroceryCategory, string> = {
    'Fruits & Légumes': 'bg-green-500/20 text-green-500 border-green-500/30',
    'Produits Laitiers': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    'Boulangerie': 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    'Viandes & Poissons': 'bg-red-500/20 text-red-500 border-red-500/30',
    'Surgelés': 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
    'Épicerie': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    'Boissons': 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    'Hygiène & Maison': 'bg-pink-500/20 text-pink-500 border-pink-500/30',
    'Autres': 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  }

  return colors[category] || colors['Autres']
}

/**
 * Get category icon name (for use with lucide-react)
 */
export function getCategoryIcon(category: GroceryCategory): string {
  const icons: Record<GroceryCategory, string> = {
    'Fruits & Légumes': 'apple',
    'Produits Laitiers': 'milk',
    'Boulangerie': 'wheat',
    'Viandes & Poissons': 'beef',
    'Surgelés': 'snowflake',
    'Épicerie': 'wheat-awn',
    'Boissons': 'glass-water',
    'Hygiène & Maison': 'home',
    'Autres': 'package',
  }

  return icons[category] || 'package'
}
