export default function Avatar({ user, size = "md", className = "" }) {
  const sizes = { xs: "h-7 w-7 text-[10px]", sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" };
  const initials = user?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "L";
  if (user?.avatar) return <img src={user.avatar} alt={user.name} className={`${sizes[size]} shrink-0 rounded-full object-cover ring-2 ring-white ${className}`} />;
  return <div className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-300 to-indigo-500 font-bold text-white ring-2 ring-white ${className}`}>{initials}</div>;
}
