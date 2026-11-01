import type { EventInput } from '../schemas/eventInputSchema';
import type { EventPlan, BudgetCategory, TimelineMilestone, VendorChecklistItem, PersonalizedIdeas } from '../schemas/eventPlanSchema';
import { normalizeBudgetBreakdown } from '../schemas/eventPlanSchema';

/**
 * Deterministic rule-based planner that generates high-quality, authentic event plans
 * when the Gemini API is unreachable, unconfigured, or rate-limited.
 */
export function generateFallbackPlan(input: EventInput): EventPlan {
  const planId = `plan_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  // 1. Budget Breakdown Model based on Event Type
  const rawCategories = getFallbackBudgetCategories(input);
  const normalizedBudget = normalizeBudgetBreakdown(rawCategories, input.totalBudget);

  // 2. Timeline Generation based on event date & weeks remaining
  const timeline = getFallbackTimeline(input);

  // 3. Vendor Checklist
  const vendorChecklist = getFallbackVendorChecklist(input, normalizedBudget);

  // 4. Personalized Ideas tailored to cultural notes, theme, and event type
  const personalizedIdeas = getFallbackPersonalizedIdeas(input);

  const title = getEventTitle(input);
  const summary = getEventSummary(input);

  return {
    id: planId,
    title,
    summary,
    totalBudget: input.totalBudget,
    currency: input.currency,
    generatedAt: now,
    isAIGenerated: false,
    budgetBreakdown: normalizedBudget,
    timeline,
    vendorChecklist,
    personalizedIdeas
  };
}

function getEventTitle(input: EventInput): string {
  const typeMap = {
    wedding: 'Dream Wedding Celebration',
    birthday: 'Milestone Birthday Extravaganza',
    community: 'Community Gathering & Festival'
  };
  const theme = input.themeStyle ? ` (${input.themeStyle})` : '';
  return `${input.city} ${typeMap[input.eventType]}${theme}`;
}

function getEventSummary(input: EventInput): string {
  const culturalClause = input.culturalOrDietaryNotes
    ? ` honoring ${input.culturalOrDietaryNotes}`
    : '';
  return `Comprehensive deterministic plan organized for ${input.guestCount} guests in ${input.city} on ${input.date}${culturalClause}, optimized with strict fiscal balance and milestone execution.`;
}

function getFallbackBudgetCategories(input: EventInput): BudgetCategory[] {
  const { eventType } = input;

  if (eventType === 'wedding') {
    return [
      {
        id: 'cat_venue_catering',
        category: 'Venue & Catering',
        percentage: 45,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Primary hospitality cost including banquet hall, multi-course meal, drinks, and service staff.'
      },
      {
        id: 'cat_decor_floral',
        category: 'Decor & Florals',
        percentage: 15,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Stage setup, entrance archway, tablescapes, lighting, and seasonal fresh floral arrangements.'
      },
      {
        id: 'cat_photography_video',
        category: 'Photography & Videography',
        percentage: 14,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Candid and traditional photo coverage, drone footage, teaser video, and premium album.'
      },
      {
        id: 'cat_music_entertainment',
        category: 'Music & Entertainment',
        percentage: 10,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Live band or DJ sound system, MC hosting, dance floor lighting, and cultural artists.'
      },
      {
        id: 'cat_attire_beauty',
        category: 'Attire & Beauty',
        percentage: 8,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Wedding outfits, hair styling, bridal makeup, accessories, and grooming.'
      },
      {
        id: 'cat_contingency',
        category: 'Buffer & Contingency',
        percentage: 8,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Safety cushion for last-minute headcount changes, weather backups, and tips.'
      }
    ];
  }

  if (eventType === 'birthday') {
    return [
      {
        id: 'cat_venue_food',
        category: 'Venue & Food',
        percentage: 45,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Party space rental, buffet or plated dining, finger foods, and beverage station.'
      },
      {
        id: 'cat_cake_desserts',
        category: 'Cake & Custom Desserts',
        percentage: 12,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Multi-tier customized designer cake, dessert table, cupcakes, and party treats.'
      },
      {
        id: 'cat_decor_balloons',
        category: 'Decor & Balloon Styling',
        percentage: 15,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Thematic backdrop, organic balloon arches, personalized photo zone, and table decor.'
      },
      {
        id: 'cat_entertainment_games',
        category: 'Entertainment & Activities',
        percentage: 15,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'DJ/Music host, interactive games, magician/entertainer, and face painting or photo booth.'
      },
      {
        id: 'cat_favors_gifts',
        category: 'Return Gifts & Favors',
        percentage: 8,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Personalized return favors, treat bags, and souvenir keepsakes for all attendees.'
      },
      {
        id: 'cat_misc_contingency',
        category: 'Buffer & Miscellaneous',
        percentage: 5,
        allocatedAmount: 0,
        actualSpent: 0,
        rationale: 'Incidental supplies, transport, extra snacks, and emergency provisions.'
      }
    ];
  }

  // Community Event
  return [
    {
      id: 'cat_venue_permits',
      category: 'Venue, Staging & Permits',
      percentage: 30,
      allocatedAmount: 0,
      actualSpent: 0,
      rationale: 'Public park or auditorium booking, municipal council permits, insurance, and crowd barriers.'
    },
    {
      id: 'cat_food_refreshments',
      category: 'Food & Refreshments',
      percentage: 35,
      allocatedAmount: 0,
      actualSpent: 0,
      rationale: 'Wholesale catering/food trucks, eco-friendly dinnerware, hydration stations, and volunteers snacks.'
    },
    {
      id: 'cat_sound_av',
      category: 'Audio/Visual & Sound',
      percentage: 15,
      allocatedAmount: 0,
      actualSpent: 0,
      rationale: 'High-output PA system, microphones, stage lighting, power generators, and AV tech operator.'
    },
    {
      id: 'cat_marketing_signage',
      category: 'Signage & Community Outreach',
      percentage: 10,
      allocatedAmount: 0,
      actualSpent: 0,
      rationale: 'Directional banners, registration desk signage, printed schedule cards, and local posters.'
    },
    {
      id: 'cat_logistics_safety',
      category: 'Logistics, First Aid & Clean-up',
      percentage: 10,
      allocatedAmount: 0,
      actualSpent: 0,
      rationale: 'Waste management & recycling bins, first-aid kit station, volunteer safety vests, and post-event clean-up.'
    }
  ];
}

function getFallbackTimeline(input: EventInput): TimelineMilestone[] {
  const eventDate = new Date(input.date);
  const now = new Date();
  const diffWeeks = Math.max(1, Math.round((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)));

  return [
    {
      id: 'milestone_initiation',
      tMinusWeeks: Math.max(12, Math.min(diffWeeks, 24)),
      phaseTitle: 'Concept & Foundation Booking',
      tasks: [
        {
          id: 'task_lock_venue',
          title: `Lock in the primary venue in ${input.city}`,
          owner: 'Lead Organizer',
          priority: 'high',
          completed: false
        },
        {
          id: 'task_estimate_guestlist',
          title: `Draft and verify guest list targeting ${input.guestCount} attendees`,
          owner: 'Host / Committee',
          priority: 'high',
          completed: false
        },
        {
          id: 'task_shortlist_catering',
          title: 'Review menu proposals and schedule initial food tasting',
          owner: 'Food Coordinator',
          priority: 'medium',
          completed: false
        }
      ]
    },
    {
      id: 'milestone_vendor_coordination',
      tMinusWeeks: Math.max(6, Math.min(diffWeeks - 2, 10)),
      phaseTitle: 'Vendor Contracts & Creative Design',
      tasks: [
        {
          id: 'task_confirm_decor',
          title: `Finalize design palette and layout with Decor team`,
          owner: 'Creative Lead',
          priority: 'high',
          completed: false
        },
        {
          id: 'task_book_photo',
          title: 'Sign agreement with photography and videography team',
          owner: 'Lead Organizer',
          priority: 'medium',
          completed: false
        },
        {
          id: 'task_dispatch_invites',
          title: 'Send out digital/physical invitations with RSVP cutoff dates',
          owner: 'Host / Communications',
          priority: 'high',
          completed: false
        }
      ]
    },
    {
      id: 'milestone_final_prep',
      tMinusWeeks: 2,
      phaseTitle: 'Final Logistics & Rehearsal',
      tasks: [
        {
          id: 'task_final_headcount',
          title: 'Submit finalized guest count and special dietary requirements to caterer',
          owner: 'Hospitality Lead',
          priority: 'high',
          completed: false
        },
        {
          id: 'task_av_runthrough',
          title: 'Conduct audio/visual check and finalize master schedule run-of-show',
          owner: 'Stage Manager',
          priority: 'medium',
          completed: false
        },
        {
          id: 'task_emergency_kit',
          title: 'Assemble on-site emergency kit and backup contacts list',
          owner: 'Lead Coordinator',
          priority: 'low',
          completed: false
        }
      ]
    },
    {
      id: 'milestone_event_day',
      tMinusWeeks: 0,
      phaseTitle: 'Event Day Execution',
      tasks: [
        {
          id: 'task_vendor_arrival',
          title: 'Supervise vendor load-in and decor completion 3 hours prior to doors',
          owner: 'Lead Coordinator',
          priority: 'high',
          completed: false
        },
        {
          id: 'task_welcome_guests',
          title: 'Open reception desk, manage guest check-in, and start hospitality service',
          owner: 'Welcome Team',
          priority: 'high',
          completed: false
        },
        {
          id: 'task_event_wrap',
          title: 'Oversee scheduled wrap-up, vendor disbursements, and load-out',
          owner: 'Lead Organizer',
          priority: 'medium',
          completed: false
        }
      ]
    }
  ];
}

function getFallbackVendorChecklist(
  input: EventInput,
  categories: BudgetCategory[]
): VendorChecklistItem[] {
  const findAmount = (nameSubstr: string) => {
    const found = categories.find((c) => c.category.toLowerCase().includes(nameSubstr.toLowerCase()));
    return found ? found.allocatedAmount : Math.round(input.totalBudget * 0.15);
  };

  const venueBudget = findAmount('Venue');
  const decorBudget = findAmount('Decor');
  const photoBudget = findAmount('Photo');
  const musicBudget = findAmount('Music') || findAmount('Sound') || findAmount('Entertainment');

  return [
    {
      id: 'v_venue',
      category: 'Venue',
      vendorType: 'Banquet Hall / Event Space Partner',
      estimatedCostMin: Math.round(venueBudget * 0.4),
      estimatedCostMax: Math.round(venueBudget * 0.55),
      questionsToAsk: [
        `Can the venue comfortably seat ${input.guestCount} guests with required aisle spacing?`,
        'What are the exact load-in and load-out hours and overtime penalty rates?',
        'Are outside catering and decor vendors permitted without royalty fees?',
        'Is there dedicated generator backup in case of local power outage?'
      ],
      isBooked: false,
      notes: `Target venue in or around ${input.city}`
    },
    {
      id: 'v_catering',
      category: 'Catering',
      vendorType: 'Full-Service Caterer & Beverage Team',
      estimatedCostMin: Math.round(venueBudget * 0.45),
      estimatedCostMax: Math.round(venueBudget * 0.6),
      questionsToAsk: [
        'How do you accommodate dietary and cultural requests (e.g. vegetarian, allergen-free)?',
        'Does the quote include uniform service staff, cutlery, and water replenishment?',
        'Can we schedule an official menu tasting for 3-4 key decision makers?',
        'What is your policy regarding leftover food packaging and hygiene disposal?'
      ],
      isBooked: false,
      notes: input.culturalOrDietaryNotes ? `Must adhere to: ${input.culturalOrDietaryNotes}` : ''
    },
    {
      id: 'v_decor',
      category: 'Decor & Production',
      vendorType: 'Thematic Decorator & Florist',
      estimatedCostMin: Math.round(decorBudget * 0.8),
      estimatedCostMax: decorBudget,
      questionsToAsk: [
        'Do you provide 3D mockups or mood boards of the stage and entrance setup?',
        'Are flowers fresh or silk, and what seasonal substitutions exist?',
        'Does your team handle full disassembly and disposal after the event?'
      ],
      isBooked: false,
      notes: input.themeStyle ? `Style: ${input.themeStyle}` : ''
    },
    {
      id: 'v_photo',
      category: 'Media',
      vendorType: 'Lead Photographer & Cinematographer',
      estimatedCostMin: Math.round(photoBudget * 0.8),
      estimatedCostMax: photoBudget,
      questionsToAsk: [
        'How many shooters will be on-site on the day of the event?',
        'What is the turnaround time for digital highlight previews and the final album?',
        'Do you retain RAW photo backups and for how many months?'
      ],
      isBooked: false,
      notes: ''
    },
    {
      id: 'v_music',
      category: 'Entertainment',
      vendorType: 'Professional DJ & Sound Engineer',
      estimatedCostMin: Math.round(musicBudget * 0.75),
      estimatedCostMax: musicBudget,
      questionsToAsk: [
        'Does your package include wireless cordless mics and subwoofers suitable for the hall size?',
        'Can we provide a custom "must-play" and "do-not-play" song list in advance?',
        'Do you hold valid public performance sound licenses?'
      ],
      isBooked: false,
      notes: ''
    }
  ];
}

function getFallbackPersonalizedIdeas(input: EventInput): PersonalizedIdeas {
  const isIndianContext =
    input.currency === 'INR' ||
    /india|delhi|mumbai|bangalore|chennai|hyderabad|pune|kolkata|jaipur/i.test(input.city) ||
    /desi|mehendi|sangeet|haldi|vedic|punjabi|south indian|gujarati/i.test(input.culturalOrDietaryNotes + input.preferences);

  const style = input.themeStyle || (isIndianContext ? 'Royal Heritage Elegance' : 'Modern Contemporary Garden');

  return {
    themes: [
      {
        name: style,
        description: `Sophisticated palette combining warm metallics with botanical textures, tailored for ${input.city}'s aesthetic.`
      },
      {
        name: 'Candlelight Luminary',
        description: 'Atmospheric ambient lighting with warm fairy curtains, floating candles, and minimalist floral centerpieces.'
      }
    ],
    activities: [
      {
        name: 'Interactive Memory Capsule & Audio Guestbook',
        description: 'A vintage telephone recording booth where guests leave heartfelt voice messages and blessings.',
        timelineStage: 'Throughout Welcome & Dinner Reception'
      },
      {
        name: isIndianContext ? 'Live Dhol & Flashmob Choreography' : 'Live Acoustic Set & Trivia Showcase',
        description: isIndianContext
          ? 'High-energy celebration moment that brings all age groups onto the dance floor before main dinner.'
          : 'Engaging host-led moments spotlighting key memories with interactive table trivia and live music.',
        timelineStage: 'Mid-evening Entertainment Block'
      }
    ],
    menuRecommendations: [
      {
        course: 'Welcome Refreshments & Appetizers',
        items: isIndianContext
          ? ['Artisanal Spiced Mojito / Kesar Thandai', 'Paneer Tikka Croquettes', 'Crispy Lotus Stem in Plum Glaze']
          : ['Craft Botanical Mocktails', 'Mini Truffle Mushroom Tartlets', 'Herb-Crusted Bruschetta'],
        dietaryNotes: input.culturalOrDietaryNotes || 'Vegetarian and vegan friendly options clearly labeled'
      },
      {
        course: 'Grand Main Course',
        items: isIndianContext
          ? ['Signature Slow-Cooked Dal Bukhara', 'Paneer Lababdar / Butter Chicken', 'Saffron Pulao with Garlic Butter Naan']
          : ['Roasted Herb Chicken / Stuffed Portobello', 'Garlic Rosemary Baby Potatoes', 'Seasonal Glazed Asparagus']
      },
      {
        course: 'Dessert & Celebrations',
        items: isIndianContext
          ? ['Warm Gulab Jamun with Artisanal Rabdi Gelato', 'Gourmet Baklava Cups']
          : ['Signature Celebration Cake', 'Warm Chocolate Lava Molten Cups with Vanilla Bean Ice Cream']
      }
    ],
    invitationWording: `With joyful hearts, we warmly invite you to join us in celebrating ${input.themeStyle || input.eventType} on ${input.date} in ${input.city}. Your gracious presence will make this milestone truly unforgettable!`,
    returnGifts: [
      {
        item: isIndianContext ? 'Handcrafted Brass Diya & Organic Exotic Tea Box' : 'Artisanal Scented Soy Candle & Custom Macaron Box',
        description: 'Thoughtfully packaged sustainable souvenir with custom thank-you wax seal.',
        estimatedUnitCost: Math.round(input.totalBudget / (input.guestCount * 12)) || 250
      }
    ]
  };
}
