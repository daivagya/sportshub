import * as React from "react"
import { cn } from "@/lib/utils"

// 🎨 Color themes for dashboard cards
const colorThemes: Record<string, string> = {
  green: "bg-gradient-to-br from-green-50 to-green-100 border-green-100 text-green-700",
  blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-100 text-blue-700",
  yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-100 text-yellow-700",
  pink: "bg-gradient-to-br from-pink-50 to-pink-100 border-pink-100 text-pink-700",
  default: "bg-gradient-to-br from-white to-gray-50 border-gray-100 text-gray-700",
}

// Main Card container
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "green" | "blue" | "yellow" | "pink" | "default"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, color = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200",
        colorThemes[color],
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

// Card Header
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 border-b border-gray-100", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// Card Title
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold text-lg", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// Card Description
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm opacity-75", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// Card Content
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

// Card Footer
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end p-4 border-t border-gray-100", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
