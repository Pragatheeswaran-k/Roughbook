// utils/xpUtils.ts
export function getLevelFromXP(xp: number): number {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 800) return 4;
    if (xp < 1200) return 5;
    return Math.floor(Math.log2(xp)) + 1;
  }
  
  export function getNextLevelXP(currentXP: number): number {
    const level = getLevelFromXP(currentXP);
    return Math.pow(level + 1, 2) * 50; // example scale
  }
  