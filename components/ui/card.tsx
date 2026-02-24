import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "dashed";
}

export function Card({
  variant = "default",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 transition-colors",
        variant === "default" && "border border-gray-200 bg-white",
        variant === "active" && "border border-primary bg-primary/5",
        variant === "dashed" &&
          "border border-dashed border-gray-300 bg-white",
        className
      )}
      {...props}
    />
  );
}
