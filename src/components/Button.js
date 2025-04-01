
import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "default",
  iconSize = "default",
  className,
  confirm = false, 
  onClick,
  ...props
}) {
  const variants = {
    default: "bg-green-800 text-white hover:bg-orange-800", 
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const handleClick = (e) => {
    if (confirm) {
      const ok = window.confirm("Are you sure you want to delete this?");
      if (!ok) return;
    }

    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition duration-200",
        iconSize === "wide" && "w-full",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
