/** 限速等待（毫秒） */
export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));
