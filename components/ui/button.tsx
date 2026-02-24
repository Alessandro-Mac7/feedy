import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-400",
  danger:
    "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-400",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-2.5 text-sm rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        "min-h-[44px] min-w-[44px]",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
