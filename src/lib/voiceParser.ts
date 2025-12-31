/**
 * Parse voice input text into multiple items using simple separators.
 * This is a fallback solution before implementing AI-based parsing.
 */

export interface ParsedVoiceResult {
  items: string[]
  originalText: string
}

/**
 * Parse voice input by splitting on common separators.
 * Supports: commas, semicolons, and common French conjunctions.
 *
 * @param text - The text to parse
 * @returns Parsed items array
 */
export function parseVoiceInput(text: string): ParsedVoiceResult {
  // French separators: comma, semicolon, "et", "puis", "aussi", "avec", "ajouter"
  const separators = /[,;]|\bet\b|\bpuis\b|\baussi\b|\bavec\b|\bajouter\b/gi

  const items = text
    .split(separators)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  return {
    items,
    originalText: text,
  }
}

/**
 * Extract priority keywords from text
 */
export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low'

export const PRIORITY_KEYWORDS: Record<PriorityLevel, string[]> = {
  urgent: ['urgent', 'urgence', 'tout de suite', 'immédiatement', 'maintenant'],
  high: ['important', 'vite', 'rapidement', 'prioritaire', 'haute priorité'],
  normal: [], // Default
  low: ['pas urgent', 'quand possible', 'plus tard', 'peu importe'],
}

/**
 * Extract priority from a text item
 */
export function extractPriority(text: string): PriorityLevel {
  const lowerText = text.toLowerCase()

  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return priority as PriorityLevel
      }
    }
  }

  return 'normal'
}

/**
 * Remove priority keywords from text for cleaner display
 */
export function cleanPriorityKeywords(text: string): string {
  let cleaned = text
  const allKeywords = Object.values(PRIORITY_KEYWORDS).flat()

  for (const keyword of allKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    cleaned = cleaned.replace(regex, '').trim()
  }

  return cleaned
}

/**
 * Complete parsing with priority extraction
 */
export interface ParsedItemWithPriority {
  content: string
  priority: PriorityLevel
}

export function parseVoiceInputWithPriorities(text: string): ParsedItemWithPriority[] {
  const { items } = parseVoiceInput(text)

  return items.map((item) => {
    const priority = extractPriority(item)
    const content = cleanPriorityKeywords(item)

    return { content, priority }
  })
}
