/**
 * Returns a deterministic gradient style object based on a username.
 * Each user always gets the same unique color.
 */
export function getAvatarStyle(username) {
  if (!username) {
    return { background: "linear-gradient(135deg, #6366f1, #4f46e5)" };
  }
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const hue2 = (hue + 40) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${hue2}, 70%, 40%))`,
  };
}
