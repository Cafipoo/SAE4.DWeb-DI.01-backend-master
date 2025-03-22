import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva("font-medium focus:outline-none transition-colors", {
  variants: {
    variant: {
      default: "bg-primary text-[var(--color-white)] shadow-lg hover:opacity-90 focus:ring-[var(--color-primary)] cursor-pointer",
      secondary: "bg-[var(--color-secondary)] text-[var(--color-white)] shadow-lg hover:opacity-90 focus:ring-[var(--color-secondary)] cursor-pointer",
      destructive: "bg-[var(--color-danger)] text-[var(--color-white)] shadow-lg hover:opacity-90 focus:ring-[var(--color-danger)]",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
      xl: "w-full px-10 py-2",
      icon: "h-10 w-10",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      default: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: "default",
  },
});

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  rounded?: "none" | "sm" | "default" | "lg" | "full";
  children?: React.ReactNode;
  className?: string;
}

const Button = ({
  variant,
  size,
  rounded,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, rounded, className }))}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 