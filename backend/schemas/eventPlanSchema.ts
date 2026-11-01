import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '../utils/constants';

export const budgetCategorySchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  percentage: z.number().min(0).max(100),
  allocatedAmount: z.number().nonnegative(),
  actualSpent: z.number().nonnegative().default(0),
  rationale: z.string().min(1)
});

export type BudgetCategory = z.infer<typeof budgetCategorySchema>;

export const timelineTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  owner: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  completed: z.boolean().default(false)
});

export type TimelineTask = z.infer<typeof timelineTaskSchema>;

export const timelineMilestoneSchema = z.object({
  id: z.string().min(1),
  tMinusWeeks: z.number().int(),
  phaseTitle: z.string().min(1),
  tasks: z.array(timelineTaskSchema).min(1)
});

export type TimelineMilestone = z.infer<typeof timelineMilestoneSchema>;

export const vendorChecklistItemSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  vendorType: z.string().min(1),
  estimatedCostMin: z.number().nonnegative(),
  estimatedCostMax: z.number().nonnegative(),
  questionsToAsk: z.array(z.string()).min(1),
  isBooked: z.boolean().default(false),
  notes: z.string().optional().default('')
});

export type VendorChecklistItem = z.infer<typeof vendorChecklistItemSchema>;

export const personalizedIdeasSchema = z.object({
  themes: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1)
      })
    )
    .min(1),
  activities: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        timelineStage: z.string().min(1)
      })
    )
    .min(1),
  menuRecommendations: z
    .array(
      z.object({
        course: z.string().min(1),
        items: z.array(z.string()).min(1),
        dietaryNotes: z.string().default('')
      })
    )
    .min(1),
  invitationWording: z.string().min(1),
  returnGifts: z
    .array(
      z.object({
        item: z.string().min(1),
        description: z.string().min(1),
        estimatedUnitCost: z.number().nonnegative()
      })
    )
    .min(1)
});

export type PersonalizedIdeas = z.infer<typeof personalizedIdeasSchema>;

export const eventPlanSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  totalBudget: z.number().positive(),
  currency: z.enum(SUPPORTED_CURRENCIES),
  generatedAt: z.string().datetime(),
  isAIGenerated: z.boolean(),
  budgetBreakdown: z.array(budgetCategorySchema).min(1),
  timeline: z.array(timelineMilestoneSchema).min(1),
  vendorChecklist: z.array(vendorChecklistItemSchema).min(1),
  personalizedIdeas: personalizedIdeasSchema
});

export type EventPlan = z.infer<typeof eventPlanSchema>;

/**
 * Normalizes budget breakdown so sum(allocatedAmount) === totalBudget exactly.
 * Handles rounding discrepancies on the largest budget category.
 */
export function normalizeBudgetBreakdown(
  categories: BudgetCategory[],
  totalBudget: number
): BudgetCategory[] {
  if (!categories.length || totalBudget <= 0) return categories;

  // Calculate sum of percentages
  const totalPercent = categories.reduce((sum, cat) => sum + cat.percentage, 0);
  const factor = totalPercent > 0 ? 100 / totalPercent : 1;

  // First pass: normalize percentages and compute integer rounded amounts
  let currentSum = 0;
  const normalized = categories.map((cat) => {
    const adjustedPercent = Number((cat.percentage * factor).toFixed(2));
    const allocated = Math.round((adjustedPercent / 100) * totalBudget);
    currentSum += allocated;
    return {
      ...cat,
      percentage: adjustedPercent,
      allocatedAmount: allocated
    };
  });

  // Second pass: correct rounding error (difference between currentSum and totalBudget)
  const diff = totalBudget - currentSum;
  if (diff !== 0) {
    // Apply difference to largest allocated item to minimize distortion
    let maxIndex = 0;
    for (let i = 1; i < normalized.length; i++) {
      if (normalized[i].allocatedAmount > normalized[maxIndex].allocatedAmount) {
        maxIndex = i;
      }
    }
    normalized[maxIndex].allocatedAmount += diff;
    normalized[maxIndex].percentage = Number(
      ((normalized[maxIndex].allocatedAmount / totalBudget) * 100).toFixed(2)
    );
  }

  return normalized;
}

