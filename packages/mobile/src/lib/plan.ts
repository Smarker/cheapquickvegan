// The cook's plan is a week or a month, whichever matches how they shop. Every label reads from here.
export type PlanSpan = 'week' | 'month';

export const planWords = (span: PlanSpan) => {
  const unit = span === 'month' ? 'month' : 'week';
  return {
    /** "This week" / "This month" */
    title: `This ${unit}`,
    /** "Cook this month" */
    add: `Cook this ${unit}`,
    remove: `Remove from this ${unit}`,
    /** "planned this month" */
    planned: `planned this ${unit}`,
    allCooked: `All cooked. Nice ${unit}!`,
    empty: `Planning a few meals? Tap "This ${unit}" on any recipe and they'll gather here.`,
  };
};
