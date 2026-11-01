'use client';

import React, { useState } from 'react';
import type { EventInput } from '@/backend/schemas/eventInputSchema';
import { eventInputSchema } from '@/backend/schemas/eventInputSchema';
import { SUPPORTED_CURRENCIES, SUPPORTED_EVENT_TYPES } from '@/backend/utils/constants';
import { Sparkles, Calendar, MapPin, Users, DollarSign, Palette, HeartHandshake } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface EventSetupFormProps {
  onSubmit: (data: EventInput) => Promise<void>;
  isLoading: boolean;
}

export function EventSetupForm({ onSubmit, isLoading }: EventSetupFormProps) {
  // Default to a date 3 months in the future
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 3);
  const defaultDateStr = defaultDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<EventInput>>({
    eventType: 'wedding',
    date: defaultDateStr,
    city: 'Mumbai',
    guestCount: 250,
    totalBudget: 1500000,
    currency: 'INR',
    themeStyle: 'Royal Floral Elegance',
    preferences: 'Evening reception with outdoor lighting, live instrumentalists',
    culturalOrDietaryNotes: 'Traditional ceremonies (Mehendi, Sangeet), strict vegetarian & Jain options'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;

    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = eventInputSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      // Focus first error field
      const firstField = Object.keys(fieldErrors)[0];
      const el = document.getElementById(`field-${firstField}`);
      if (el) el.focus();
      return;
    }

    await onSubmit(validation.data);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Plan Your Next Event
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Tell our GenAI assistant about your vision, budget, and cultural preferences to create an end-to-end plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Top level global error announcement */}
        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            aria-live="polite"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm"
          >
            Please review and correct the {Object.keys(errors).length} highlighted error(s) below.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Type */}
          <div>
            <label
              htmlFor="field-eventType"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
            >
              Event Type <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <select
                id="field-eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!errors.eventType}
                aria-describedby={errors.eventType ? 'error-eventType' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors capitalize text-sm"
              >
                {SUPPORTED_EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {errors.eventType && (
              <p id="error-eventType" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.eventType}
              </p>
            )}
          </div>

          {/* Event Date */}
          <div>
            <label
              htmlFor="field-date"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
            >
              Target Date <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="field-date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'error-date' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>
            {errors.date && (
              <p id="error-date" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.date}
              </p>
            )}
          </div>

          {/* City / Location */}
          <div>
            <label
              htmlFor="field-city"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
            >
              City / Destination <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="field-city"
                name="city"
                placeholder="e.g. Mumbai, Jaipur, London, Chicago"
                value={formData.city}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? 'error-city' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>
            {errors.city && (
              <p id="error-city" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.city}
              </p>
            )}
          </div>

          {/* Guest Count */}
          <div>
            <label
              htmlFor="field-guestCount"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
            >
              Guest Count <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="field-guestCount"
                name="guestCount"
                min="1"
                max="50000"
                value={formData.guestCount || ''}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!errors.guestCount}
                aria-describedby={errors.guestCount ? 'error-guestCount' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>
            {errors.guestCount && (
              <p id="error-guestCount" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.guestCount}
              </p>
            )}
          </div>

          {/* Total Budget */}
          <div>
            <label
              htmlFor="field-totalBudget"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
            >
              Total Budget <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="field-totalBudget"
                name="totalBudget"
                min="1000"
                step="1000"
                value={formData.totalBudget || ''}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!errors.totalBudget}
                aria-describedby={errors.totalBudget ? 'error-totalBudget' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
              />
            </div>
            {errors.totalBudget && (
              <p id="error-totalBudget" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.totalBudget}
              </p>
            )}
          </div>

          {/* Currency Selection */}
          <div>
            <label
              htmlFor="field-currency"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
            >
              Currency <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <select
                id="field-currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                aria-required="true"
                aria-invalid={!!errors.currency}
                aria-describedby={errors.currency ? 'error-currency' : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr} {curr === 'INR' ? '(₹)' : curr === 'USD' ? '($)' : curr === 'EUR' ? '(€)' : '(£)'}
                  </option>
                ))}
              </select>
            </div>
            {errors.currency && (
              <p id="error-currency" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.currency}
              </p>
            )}
          </div>
        </div>

        {/* Theme & Style */}
        <div>
          <label
            htmlFor="field-themeStyle"
            className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
          >
            Theme & Style Preferences
          </label>
          <input
            type="text"
            id="field-themeStyle"
            name="themeStyle"
            placeholder="e.g. Minimalist Boho, Royal Heritage, Retro 80s, Cyberpunk, Tropical Oasis"
            value={formData.themeStyle}
            onChange={handleChange}
            maxLength={200}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
          />
        </div>

        {/* Dietary / Cultural Notes */}
        <div>
          <label
            htmlFor="field-culturalOrDietaryNotes"
            className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
          >
            Cultural Ceremonies & Dietary Requirements
          </label>
          <textarea
            id="field-culturalOrDietaryNotes"
            name="culturalOrDietaryNotes"
            rows={2}
            placeholder="e.g. Mehendi & Sangeet ceremonies, Jain/Halal dining, Nut allergies, Vegan welcome drinks"
            value={formData.culturalOrDietaryNotes}
            onChange={handleChange}
            maxLength={500}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
          />
        </div>

        {/* General Preferences */}
        <div>
          <label
            htmlFor="field-preferences"
            className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1"
          >
            Additional Notes & Organizer Priorities
          </label>
          <textarea
            id="field-preferences"
            name="preferences"
            rows={2}
            placeholder="e.g. Prioritize high-end candid photography, keep music volume moderate after 10 PM"
            value={formData.preferences}
            onChange={handleChange}
            maxLength={500}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md shadow-brand-500/20 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base transition-all"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Crafting Your Personalized Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                <span>Generate Complete Event Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

