import { useApp } from "../context/AppContext";

export function useXP() {
  const { state, addXP } = useApp();
  const { xp, level, xpToNextLevel } = state.user;

  // Let's assume a level's base XP is (level - 1) * 1000
  const baseLevelXp = (level - 1) * 1000;
  const xpInCurrentLevel = xp - baseLevelXp;
  const xpNeededForCurrentLevel = xpToNextLevel - baseLevelXp;
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((xpInCurrentLevel / xpNeededForCurrentLevel) * 100))
  );

  return {
    xp,
    level,
    xpToNextLevel,
    xpInCurrentLevel,
    xpNeededForCurrentLevel,
    progressPercent,
    addXP,
  };
}
