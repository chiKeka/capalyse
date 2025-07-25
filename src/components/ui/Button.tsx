"use client";

import { Check, ChevronRight, CircleCheck, Loader2Icon } from "lucide-react";
import React, { ButtonHTMLAttributes } from "react";

// Type definitions
type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "small" | "medium" | "big" | "icon";
type ButtonState = "default" | "hover" | "loading" | "disabled";
type IconPosition = "none" | "left" | "right" | "only" | "file";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Current state of the button
   * @default 'default'
   */
  state?: ButtonState;

  /**
   * Position of the icon relative to the text
   * @default 'none'
   */
  iconPosition?: IconPosition;

  /**
   * Button content/text
   * @default 'Button'
   */
  children?: React.ReactNode;

  /**
   * Click handler function
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  state = "default",
  iconPosition = "none",
  children = "Button",
  onClick,
  className = "",
  ...props
}) => {
  const baseClasses: string =
    "inline-flex items-center font-bold justify-center transition-all duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0";

  // Size classes mapping
  const sizeClasses: Record<ButtonSize, string> = {
    small: "px-3 py-1.5 text-sm gap-1.5 h-[2.25rem]",
    medium: "px-4 py-2.5 text-sm gap-2 h-[2.75rem]",
    big: "px-6 py-3 text-sm gap-2 h-[3.5rem]",
    icon: "h-10 w-10",
  };

  // Variant classes for different states
  const variantClasses: Record<ButtonVariant, Record<ButtonState, string>> = {
    primary: {
      default:
        "bg-green text-white hover:bg-primary-green-7 focus:ring-teal-500",
      hover: "bg-primary-green-7 text-white focus:ring-teal-500",
      loading: "bg-primary-green-4 text-white cursor-wait",
      disabled: "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed",
    },
    secondary: {
      default:
        "bg-white text-green border border-green hover:bg-gray-50 focus:ring-gray-500",
      hover: "bg-[#F4F6F8] text-green border border-green focus:ring-gray-500",
      loading: "bg-white text-green border border-green cursor-wait",
      disabled:
        "bg-transparent text-black-50 border border-black-50 cursor-not-allowed",
    },
    tertiary: {
      default:
        "bg-transparent text-black-400 border-none hover:bg-gray-100 focus:ring-gray-500",
      hover: "bg-[#F1F5F9] text-black-400 border-none focus:ring-gray-500",
      loading: "bg-transparent text-black-400 border-none cursor-wait",
      disabled: "bg-transparent text-black-300 border-none cursor-not-allowed",
    },
    ghost: {
      default: "hover:bg-accent hover:text-accent-foreground",
      hover: "bg-accent text-accent-foreground",
      loading: "bg-transparent cursor-wait",
      disabled: "bg-transparent opacity-50 cursor-not-allowed",
    },
  };

  // Helper function to get icon size classes based on button size
  const getIconSizeClass = (buttonSize: ButtonSize): string => {
    switch (buttonSize) {
      case "small":
        return "h-[2.25rem]";
      case "big":
        return "h-[3.5rem]";
      case "icon":
        return "h-10 w-10";
      case "medium":
      default:
        return "h-[2.75rem]";
    }
  };

  // Combine all classes
  const buttonClasses: string =
    `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant][state]} hover:scale-105 transition-all duration-300 rounded-md ${className}`.trim();

  // Icon rendering function
  const renderIcon = (): React.ReactElement | null => {
    const iconSizeClass = getIconSizeClass(size);

    switch (iconPosition) {
      case "left":
      case "only":
        return variant === "primary" ? (
          <Check className={iconSizeClass} />
        ) : (
          <CircleCheck className={iconSizeClass} />
        );
      case "right":
        return <ChevronRight className={iconSizeClass} />;

      case "file":
        return <img src={"/icons/uploadlight.svg"} className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const isDisabled: boolean = state === "disabled" || state === "loading";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (!isDisabled && onClick) {
      onClick(event);
    }
  };

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      onClick={handleClick}
      type="button"
      {...props}
    >
      {state === "loading" && <Loader2Icon className="animate-spin w-6 h-6" />}
      {iconPosition === "left" && renderIcon()}
      {iconPosition !== "only" && children}
      {iconPosition === "right" && renderIcon()}
      {iconPosition === "only" && renderIcon()}
      {iconPosition === "file" && renderIcon()}
    </button>
  );
};

export default Button;

// Export types for external use
export type {
  ButtonProps,
  ButtonSize,
  ButtonState,
  ButtonVariant,
  IconPosition,
};
