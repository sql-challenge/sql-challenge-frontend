import { mockMysteries, getMysteryById } from "@/_lib/mock/mystery";
import type { Mystery, MysteryDetail } from "@/_lib/types/mystery";

/**
 * Service for managing mystery data
 */
export class MysteryService {
  /**
   * Get all available mysteries
   */
  static async getAllMysteries(): Promise<Mystery[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMysteries;
  }

  /**
   * Get mystery details by ID
   */
  static async getMysteryDetail(id: string): Promise<MysteryDetail | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getMysteryById(id);
  }

  /**
   * Get mysteries by difficulty
   */
  static async getMysteriesByDifficulty(difficulty: string): Promise<Mystery[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMysteries.filter((m) => m.difficulty === difficulty);
  }

  /**
   * Get mysteries by category
   */
  static async getMysteriesByCategory(category: string): Promise<Mystery[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockMysteries.filter((m) => m.category === category);
  }

  /**
   * Search mysteries by title or description
   */
  static async searchMysteries(query: string): Promise<Mystery[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const lowerQuery = query.toLowerCase();
    return mockMysteries.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }
}