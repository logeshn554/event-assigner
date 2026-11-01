'use client';

import React from 'react';
import type { TimelineMilestone } from '@/backend/schemas/eventPlanSchema';
import { Badge } from '../ui/Badge';
import { Check, Clock, Calendar } from 'lucide-react';

interface TimelineViewProps {
  timeline: TimelineMilestone[];
  onToggleTask: (milestoneId: string, taskId: string) => void;
}

export function TimelineView({ timeline, onToggleTask }: TimelineViewProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Milestone Timeline & Action Plan
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Chronological stages scheduled from kickoff down to event day execution.
          </p>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-brand-200 dark:border-brand-900 space-y-10">
        {timeline.map((milestone) => {
          const totalTasks = milestone.tasks.length;
          const completedCount = milestone.tasks.filter((t) => t.completed).length;
          const isAllDone = totalTasks > 0 && totalTasks === completedCount;

          return (
            <div key={milestone.id} className="relative">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center transition-colors ${isAllDone ? 'bg-emerald-600' : 'bg-brand-600'}`}
                aria-hidden="true"
              >
                {isAllDone ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                    {milestone.tMinusWeeks === 0
                      ? 'Event Day (T-0)'
                      : `T-minus ${milestone.tMinusWeeks} Weeks`}
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {milestone.phaseTitle}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {completedCount} of {totalTasks} tasks done
                  </span>
                </div>

                {/* Tasks List */}
                <div className="mt-3 space-y-2">
                  {milestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                    >
                      <label className="flex items-start space-x-3 cursor-pointer flex-1 mr-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleTask(milestone.id, task.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                        />
                        <div>
                          <span
                            className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}
                          >
                            {task.title}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Assigned to: <strong className="font-semibold text-gray-700 dark:text-gray-300">{task.owner}</strong>
                          </span>
                        </div>
                      </label>

                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'danger'
                            : task.priority === 'medium'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

