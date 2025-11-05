
export function levelStatsFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currStart = (level - 1) * (level - 1) * 100;
  const nextStart = level * level * 100;
  const currentInLevel = Math.max(0, xp - currStart);
  const toNext = Math.max(1, nextStart - currStart);
  const progress = Math.min(1, currentInLevel / toNext);

  return { level, currStart, nextStart, currentInLevel, toNext, progress };
}

export function getXpLevelText(xp: number): string {
  const { level, progress } = levelStatsFromXp(xp);
  const percent = Math.round(progress * 100);
  return `Nivel ${level} (${percent}%)`;
}
