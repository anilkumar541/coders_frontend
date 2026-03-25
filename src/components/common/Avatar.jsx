import { getAvatarStyle } from "../../utils/avatarColor";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-[10px]",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-2xl",
};

/**
 * Renders a user avatar: profile picture if available, otherwise initials.
 * @param {object} props
 * @param {{ username?: string, profile_picture?: string }} props.user
 * @param {"sm"|"md"|"lg"|"xl"} [props.size="md"]
 * @param {string} [props.className] - extra classes applied to the root element
 */
export default function Avatar({ user, size = "md", className = "" }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";
  const pictureUrl = user?.profile_picture
    ? user.profile_picture.startsWith("http")
      ? user.profile_picture
      : `${API_URL}${user.profile_picture}`
    : null;

  if (pictureUrl) {
    return (
      <img
        src={pictureUrl}
        alt={user.username}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full text-white flex items-center justify-center font-semibold ${className}`}
      style={getAvatarStyle(user?.username)}
    >
      {initials}
    </div>
  );
}
