/**
 * Game Engine Service
 */

const calculateReward = ({
  basePoints,
  accuracy,
  timeTaken,
  maxTime,
  streak,
}) => {
  // Time factor (faster = higher score)
  const timeFactor = Math.max(0.5, (maxTime - timeTaken) / maxTime);

  // Streak multiplier
  let streakMultiplier = 1;
  if (streak >= 5) streakMultiplier = 1.2;
  if (streak >= 10) streakMultiplier = 1.5;

  const reward =
    basePoints *
    accuracy *
    timeFactor *
    streakMultiplier;

  return Math.round(reward);
};

module.exports = {
  calculateReward,
};
