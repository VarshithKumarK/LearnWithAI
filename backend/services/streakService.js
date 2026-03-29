import User from '../models/User.js';

/**
 * Updates the user's streak based on daily activity.
 * - If called on a new day (different from lastStreakDate), increment streak by 1.
 * - If called on the same day, do nothing (already counted for today).
 * - If more than 1 day gap, reset streak to 1 (today counts as day 1).
 * 
 * Call this function from any activity endpoint (roadmap, resource, quiz).
 */
export const updateUserStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today

    const lastDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
    const lastDay = lastDate
      ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
      : null;

    if (!lastDay) {
      // First ever activity
      user.streak = 1;
    } else {
      const diffMs = today.getTime() - lastDay.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day — already counted, do nothing
        return;
      } else if (diffDays === 1) {
        // Consecutive day — increment
        user.streak += 1;
      } else {
        // Gap > 1 day — reset
        user.streak = 1;
      }
    }

    user.lastStreakDate = now;
    user.lastActive = now;
    await user.save();
  } catch (error) {
    console.error('Streak update error:', error);
  }
};
