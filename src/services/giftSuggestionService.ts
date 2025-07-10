import { Product } from '../types';

export interface GiftSuggestionCriteria {
  occasion: string;
  relation: string;
  ageGroup: string;
  budget: number;
  interests?: string[];
  personality?: string;
}

export interface GiftSuggestion {
  product: Product;
  reason: string;
  matchScore: number;
  occasion: string;
  tags: string[];
}

class GiftSuggestionService {
  // Occasion-based product categories
  private occasionCategories: Record<string, string[]> = {
    'birthday': ['jewelry', 'accessories', 'home-decor', 'art', 'personalized'],
    'anniversary': ['jewelry', 'romantic', 'luxury', 'personalized', 'home-decor'],
    'wedding': ['jewelry', 'luxury', 'home-decor', 'art', 'personalized'],
    'housewarming': ['home-decor', 'kitchen', 'art', 'plants', 'practical'],
    'graduation': ['jewelry', 'accessories', 'practical', 'personalized', 'art'],
    'baby-shower': ['baby', 'home-decor', 'personalized', 'practical'],
    'christmas': ['home-decor', 'jewelry', 'art', 'personalized', 'seasonal'],
    'valentines': ['romantic', 'jewelry', 'personalized', 'art', 'luxury'],
    'mothers-day': ['jewelry', 'home-decor', 'art', 'personalized', 'luxury'],
    'fathers-day': ['accessories', 'practical', 'art', 'personalized', 'luxury'],
    'diwali': ['home-decor', 'jewelry', 'art', 'traditional', 'luxury'],
    'holi': ['art', 'home-decor', 'traditional', 'colorful'],
    'eid': ['jewelry', 'home-decor', 'art', 'traditional', 'luxury'],
    'new-year': ['jewelry', 'accessories', 'art', 'personalized', 'luxury'],
  };

  // Relation-based preferences
  private relationPreferences: Record<string, { categories: string[], budgetMultiplier: number }> = {
    'spouse': { categories: ['jewelry', 'romantic', 'luxury', 'personalized'], budgetMultiplier: 1.5 },
    'partner': { categories: ['jewelry', 'romantic', 'personalized', 'art'], budgetMultiplier: 1.3 },
    'parent': { categories: ['jewelry', 'home-decor', 'art', 'practical'], budgetMultiplier: 1.2 },
    'child': { categories: ['toys', 'art', 'personalized', 'educational'], budgetMultiplier: 0.8 },
    'sibling': { categories: ['accessories', 'art', 'personalized', 'practical'], budgetMultiplier: 1.0 },
    'friend': { categories: ['accessories', 'art', 'home-decor', 'practical'], budgetMultiplier: 0.9 },
    'colleague': { categories: ['practical', 'home-decor', 'art', 'accessories'], budgetMultiplier: 0.7 },
    'boss': { categories: ['luxury', 'art', 'home-decor', 'practical'], budgetMultiplier: 1.4 },
    'teacher': { categories: ['art', 'home-decor', 'practical', 'personalized'], budgetMultiplier: 0.8 },
    'neighbor': { categories: ['home-decor', 'practical', 'art'], budgetMultiplier: 0.6 },
  };

  // Age group preferences
  private ageGroupPreferences: Record<string, string[]> = {
    'kids': ['toys', 'educational', 'colorful', 'fun'],
    'teens': ['accessories', 'trendy', 'art', 'personalized'],
    'young-adults': ['accessories', 'art', 'trendy', 'personalized'],
    'adults': ['jewelry', 'home-decor', 'art', 'practical'],
    'seniors': ['practical', 'home-decor', 'art', 'traditional'],
  };

  // Personality-based preferences
  private personalityPreferences: Record<string, string[]> = {
    'creative': ['art', 'handmade', 'unique', 'colorful'],
    'practical': ['practical', 'home-decor', 'kitchen', 'useful'],
    'luxury-loving': ['jewelry', 'luxury', 'premium', 'elegant'],
    'minimalist': ['simple', 'elegant', 'practical', 'clean'],
    'traditional': ['traditional', 'art', 'home-decor', 'cultural'],
    'trendy': ['trendy', 'accessories', 'art', 'modern'],
    'nature-lover': ['plants', 'natural', 'eco-friendly', 'art'],
    'tech-savvy': ['modern', 'practical', 'accessories', 'trendy'],
  };

  // Interest-based categories
  private interestCategories: Record<string, string[]> = {
    'cooking': ['kitchen', 'practical', 'home-decor'],
    'art': ['art', 'creative', 'handmade'],
    'music': ['art', 'accessories', 'creative'],
    'reading': ['home-decor', 'practical', 'art'],
    'fitness': ['accessories', 'practical', 'health'],
    'travel': ['accessories', 'practical', 'art'],
    'gardening': ['plants', 'home-decor', 'natural'],
    'photography': ['art', 'accessories', 'creative'],
    'fashion': ['accessories', 'jewelry', 'trendy'],
    'technology': ['practical', 'accessories', 'modern'],
  };

  // Calculate match score for a product based on criteria
  private calculateMatchScore(product: Product, criteria: GiftSuggestionCriteria): number {
    let score = 0;
    const maxScore = 100;

    // Budget match (30 points)
    const budgetScore = Math.max(0, 30 - Math.abs(product.price - criteria.budget) / criteria.budget * 30);
    score += budgetScore;

    // Category match (25 points)
    const occasionCategories = this.occasionCategories[criteria.occasion.toLowerCase()] || [];
    const relationCategories = this.relationPreferences[criteria.relation.toLowerCase()]?.categories || [];
    const ageCategories = this.ageGroupPreferences[criteria.ageGroup.toLowerCase()] || [];
    
    const allPreferredCategories = [...occasionCategories, ...relationCategories, ...ageCategories];
    const categoryMatch = product.tags.some(tag => 
      allPreferredCategories.some(cat => tag.toLowerCase().includes(cat.toLowerCase()))
    );
    score += categoryMatch ? 25 : 0;

    // Interest match (20 points)
    if (criteria.interests) {
      const interestMatch = criteria.interests.some(interest => {
        const interestCats = this.interestCategories[interest.toLowerCase()] || [];
        return product.tags.some(tag => 
          interestCats.some(cat => tag.toLowerCase().includes(cat.toLowerCase()))
        );
      });
      score += interestMatch ? 20 : 0;
    }

    // Personality match (15 points)
    if (criteria.personality) {
      const personalityCats = this.personalityPreferences[criteria.personality.toLowerCase()] || [];
      const personalityMatch = product.tags.some(tag => 
        personalityCats.some(cat => tag.toLowerCase().includes(cat.toLowerCase()))
      );
      score += personalityMatch ? 15 : 0;
    }

    // Product quality indicators (10 points)
    if (product.instantDeliveryEligible) score += 5;
    if (product.status === 'approved') score += 5;

    return Math.min(maxScore, score);
  }

  // Generate gift suggestions
  async getGiftSuggestions(criteria: GiftSuggestionCriteria, products: Product[]): Promise<GiftSuggestion[]> {
    // Filter products by budget
    const budgetMultiplier = this.relationPreferences[criteria.relation.toLowerCase()]?.budgetMultiplier || 1;
    const adjustedBudget = criteria.budget * budgetMultiplier;
    
    const affordableProducts = products.filter(product => 
      product.price <= adjustedBudget * 1.2 && product.status === 'approved'
    );

    // Calculate scores for all products
    const scoredProducts = affordableProducts.map(product => ({
      product,
      score: this.calculateMatchScore(product, criteria),
      reason: this.generateReason(product, criteria),
      occasion: criteria.occasion,
      tags: product.tags
    }));

    // Sort by score and return top suggestions
    return scoredProducts
      .filter(item => item.score > 30) // Only return products with decent match
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(item => ({
        product: item.product,
        reason: item.reason,
        matchScore: item.score,
        occasion: item.occasion,
        tags: item.tags
      }));
  }

  // Generate personalized reason for suggestion
  private generateReason(product: Product, criteria: GiftSuggestionCriteria): string {
    const reasons = [];
    
    // Occasion-based reason
    const occasionReasons: Record<string, string> = {
      'birthday': 'Perfect for celebrating their special day',
      'anniversary': 'A thoughtful way to commemorate your journey together',
      'wedding': 'A beautiful gift to start their new chapter',
      'housewarming': 'Great addition to their new home',
      'graduation': 'Celebrate their achievement with this special gift',
      'christmas': 'Spread holiday cheer with this festive gift',
      'valentines': 'Express your love with this romantic gesture',
      'mothers-day': 'Show your appreciation for everything she does',
      'fathers-day': 'Honor the special man in your life',
    };
    
    if (occasionReasons[criteria.occasion.toLowerCase()]) {
      reasons.push(occasionReasons[criteria.occasion.toLowerCase()]);
    }

    // Relation-based reason
    const relationReasons: Record<string, string> = {
      'spouse': 'A meaningful gift for your life partner',
      'partner': 'Perfect for your significant other',
      'parent': 'Show your gratitude to your parent',
      'child': 'Delight your little one with this gift',
      'friend': 'A thoughtful gift for your dear friend',
      'colleague': 'Professional yet personal gift choice',
    };

    if (relationReasons[criteria.relation.toLowerCase()]) {
      reasons.push(relationReasons[criteria.relation.toLowerCase()]);
    }

    // Product-specific reason
    if (product.instantDeliveryEligible) {
      reasons.push('Available for instant delivery');
    }

    if (product.tags.includes('handmade')) {
      reasons.push('Uniquely handmade with care');
    }

    if (product.tags.includes('personalized')) {
      reasons.push('Can be personalized for extra meaning');
    }

    return reasons.length > 0 ? reasons.join('. ') + '.' : 'A thoughtful gift choice.';
  }

  // Get trending gift categories
  getTrendingCategories(): string[] {
    return ['personalized', 'handmade', 'eco-friendly', 'art', 'jewelry', 'home-decor'];
  }

  // Get popular occasions
  getPopularOccasions(): string[] {
    return ['birthday', 'anniversary', 'wedding', 'housewarming', 'christmas', 'valentines'];
  }

  // Get relation types
  getRelationTypes(): string[] {
    return Object.keys(this.relationPreferences);
  }

  // Get age groups
  getAgeGroups(): string[] {
    return Object.keys(this.ageGroupPreferences);
  }

  // Get personality types
  getPersonalityTypes(): string[] {
    return Object.keys(this.personalityPreferences);
  }

  // Get interests
  getInterests(): string[] {
    return Object.keys(this.interestCategories);
  }
}

export const giftSuggestionService = new GiftSuggestionService(); 