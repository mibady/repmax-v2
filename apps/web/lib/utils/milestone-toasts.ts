import { toast } from 'sonner';

const milestones = [
  { threshold: 100, message: "Player Card complete! You're fully visible to recruiters.", icon: '🏆' },
  { threshold: 75, message: "Almost complete! You're ahead of most athletes.", icon: '⭐' },
  { threshold: 50, message: 'Halfway there! Coaches are starting to notice.', icon: '🔥' },
  { threshold: 25, message: "You're getting started! Keep building your card.", icon: '💪' },
] as const;

export function checkMilestones(percentage: number): void {
  // Find the highest uncelebrated milestone the athlete qualifies for
  for (const { threshold, message, icon } of milestones) {
    if (percentage < threshold) continue;

    const key = `repmax_milestone_${threshold}`;
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(key)) continue;

    // Fire toast for only the highest uncelebrated milestone
    localStorage.setItem(key, 'true');
    toast.success(`${icon} ${message}`, { duration: 5000 });
    return;
  }
}
