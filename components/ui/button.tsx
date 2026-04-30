import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-white hover:opacity-90",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border bg-white hover:bg-[#F5F2EC]",
        secondary: "bg-[#F5F2EC] hover:bg-[#E0DDD6]",
        ghost: "hover:bg-[#F5F2EC]",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const brandStyle =
      !variant || variant === "default"
        ? { backgroundColor: "#1B3A2D", ...style }
        : variant === "outline"
        ? { borderColor: "#E0DDD6", color: "#1B3A2D", ...style }
        : variant === "ghost" || variant === "link" || variant === "secondary"
        ? { color: "#1B3A2D", ...style }
        : style;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={brandStyle}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
