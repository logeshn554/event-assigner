import { describe, it, expect } from 'vitest';
import { eventInputSchema } from '@/backend/schemas/eventInputSchema';
import { chatRequestSchema } from '@/backend/schemas/chatSchema';
import { eventPlanSchema } from '@/backend/schemas/eventPlanSchema';

describe('Zod Schemas', () => {
  describe('eventInputSchema', () => {
    it('accepts valid event setup input', () => {
      const valid = {
        eventType: 'wedding',
        date: '2027-04-15',
        city: 'Mumbai',
        guestCount: 200,
        totalBudget: 1500000,
        currency: 'INR',
        themeStyle: 'Royal Heritage',
        preferences: 'Live acoustic music',
        culturalOrDietaryNotes: 'Jain options'
      };
      const result = eventInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects unknown or injected properties due to strict mode', () => {
      const injected = {
        eventType: 'wedding',
        date: '2027-04-15',
        city: 'Mumbai',
        guestCount: 200,
        totalBudget: 1500000,
        currency: 'INR',
        maliciousField: 'DROP TABLE events;'
      };
      const result = eventInputSchema.safeParse(injected);
      expect(result.success).toBe(false);
    });

    it('rejects invalid event types and out-of-range numbers', () => {
      const invalid = {
        eventType: 'concert', // not in wedding | birthday | community
        date: 'invalid-date',
        city: 'A', // too short (< 2 chars)
        guestCount: 0,
        totalBudget: -500,
        currency: 'XYZ'
      };
      const result = eventInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('chatRequestSchema', () => {
    it('validates a valid chat refinement payload', () => {
      const validPayload = {
        message: 'Can we reduce decor by 10%?',
        currentPlan: {
          id: 'plan_1',
          title: 'Test Wedding',
          summary: 'Summary description',
          totalBudget: 100000,
          currency: 'INR',
          generatedAt: new Date().toISOString(),
          isAIGenerated: true,
          budgetBreakdown: [
            { id: '1', category: 'Venue', percentage: 100, allocatedAmount: 100000, actualSpent: 0, rationale: 'R' }
          ],
          timeline: [
            {
              id: 'm1',
              tMinusWeeks: 4,
              phaseTitle: 'Phase',
              tasks: [{ id: 't1', title: 'Task', owner: 'Owner', priority: 'high', completed: false }]
            }
          ],
          vendorChecklist: [
            {
              id: 'v1',
              category: 'Venue',
              vendorType: 'Hall',
              estimatedCostMin: 50000,
              estimatedCostMax: 60000,
              questionsToAsk: ['Capacity?'],
              isBooked: false
            }
          ],
          personalizedIdeas: {
            themes: [{ name: 'Theme', description: 'Desc' }],
            activities: [{ name: 'Act', description: 'Desc', timelineStage: 'Stage' }],
            menuRecommendations: [{ course: 'Appetizers', items: ['Item 1'], dietaryNotes: 'Veg' }],
            invitationWording: 'Please join us!',
            returnGifts: [{ item: 'Gift', description: 'Desc', estimatedUnitCost: 200 }]
          }
        },
        history: []
      };

      const result = chatRequestSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects empty messages', () => {
      const empty = {
        message: '   ',
        currentPlan: {} as any
      };
      const result = chatRequestSchema.safeParse(empty);
      expect(result.success).toBe(false);
    });
  });
});

