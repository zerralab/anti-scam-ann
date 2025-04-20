/**
 * 格式化時間持續時間為人類可讀格式
 * @param seconds 秒數
 * @returns 格式化後的時間字符串
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分鐘`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}小時${minutes}分鐘` : `${hours}小時`;
}