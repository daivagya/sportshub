import { cn } from "@/lib/utils"; // optional if you’re using clsx/cn helper

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "primary" &&
          "bg-black text-white hover:bg-black/80 focus:ring-blue-500",
        variant === "outline" &&
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
        "px-4 py-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
