/**
 * Age verification utilities for tournament roster eligibility.
 */

/**
 * Calculate age in years at a given reference date.
 */
export function ageAtDate(dateOfBirth: string | Date, referenceDate: string | Date): number {
  const dob = new Date(dateOfBirth);
  const ref = new Date(referenceDate);

  let age = ref.getFullYear() - dob.getFullYear();
  const monthDiff = ref.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

/**
 * Check if an athlete is eligible based on tournament age restrictions.
 * Returns { eligible, age, reason? }.
 */
export function checkAgeEligibility(
  dateOfBirth: string | Date,
  maxAgeYears: number,
  ageCutoffDate: string | Date
): { eligible: boolean; age: number; reason?: string } {
  const age = ageAtDate(dateOfBirth, ageCutoffDate);

  if (age > maxAgeYears) {
    return {
      eligible: false,
      age,
      reason: `Athlete is ${age} years old (max ${maxAgeYears}) as of cutoff date`,
    };
  }

  return { eligible: true, age };
}
