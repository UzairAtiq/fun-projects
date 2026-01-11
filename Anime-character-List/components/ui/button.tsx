import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0F] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#DC2626] text-white hover:bg-[#EF4444] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] shadow-lg",
        destructive:
          "bg-[#991B1B] text-white hover:bg-[#DC2626] hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]",
        outline:
          "border border-[#27272A] bg-transparent text-[#FAFAFA] hover:bg-[#27272A] hover:border-[#DC2626]",
        secondary:
          "bg-[#27272A] text-[#FAFAFA] hover:bg-[#3F3F46] border border-[#3F3F46]",
        ghost: "text-[#FAFAFA] hover:bg-[#27272A]",
        link: "text-[#DC2626] underline-offset-4 hover:underline hover:text-[#EF4444]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
