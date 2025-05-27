import React, { ButtonHTMLAttributes } from 'react';
import { ChevronRight, Check, CircleCheck, Loader2 } from 'lucide-react';

// Type definitions
type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'small' | 'medium' | 'big';
type ButtonState = 'default' | 'hover' | 'loading' | 'disabled';
type IconPosition = 'none' | 'left' | 'right' | 'only';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
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
  variant = 'primary',
  size = 'medium',
  state = 'default',
  iconPosition = 'none',
  children = 'Button',
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses: string =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Size classes mapping
  const sizeClasses: Record<ButtonSize, string> = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-4 py-2 text-sm gap-2',
    big: 'px-6 py-3 text-base gap-2',
  };

  // Variant classes for different states
  const variantClasses: Record<ButtonVariant, Record<ButtonState, string>> = {
    primary: {
      default:
        'bg-teal-600 text-white border border-teal-600 hover:bg-teal-700 focus:ring-teal-500',
      hover:
        'bg-teal-700 text-white border border-teal-700 focus:ring-teal-500',
      loading:
        'bg-teal-600 text-white border border-teal-600 cursor-wait opacity-80',
      disabled:
        'bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed',
    },
    secondary: {
      default:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
      hover:
        'bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500',
      loading:
        'bg-white text-gray-700 border border-gray-300 cursor-wait opacity-80',
      disabled:
        'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed',
    },
    tertiary: {
      default:
        'bg-transparent text-gray-700 border-none hover:bg-gray-100 focus:ring-gray-500',
      hover: 'bg-gray-100 text-gray-700 border-none focus:ring-gray-500',
      loading:
        'bg-transparent text-gray-700 border-none cursor-wait opacity-80',
      disabled: 'bg-transparent text-gray-400 border-none cursor-not-allowed',
    },
  };

  // Helper function to get icon size classes based on button size
  const getIconSizeClass = (buttonSize: ButtonSize): string => {
    switch (buttonSize) {
      case 'small':
        return 'w-3 h-3';
      case 'big':
        return 'w-5 h-5';
      case 'medium':
      default:
        return 'w-4 h-4';
    }
  };

  // Combine all classes
  const buttonClasses: string =
    `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant][state]} rounded-md ${className}`.trim();

  // Icon rendering function
  const renderIcon = (): React.ReactElement | null => {
    const iconSizeClass = getIconSizeClass(size);

    if (state === 'loading') {
      return <Loader2 className={`${iconSizeClass} animate-spin`} />;
    }

    switch (iconPosition) {
      case 'left':
      case 'only':
        return variant === 'primary' ? (
          <Check className={iconSizeClass} />
        ) : (
          <CircleCheck className={iconSizeClass} />
        );
      case 'right':
        return <ChevronRight className={iconSizeClass} />;
      default:
        return null;
    }
  };

  const isDisabled: boolean = state === 'disabled' || state === 'loading';

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
      {iconPosition === 'left' && renderIcon()}
      {iconPosition !== 'only' && children}
      {iconPosition === 'right' && renderIcon()}
      {iconPosition === 'only' && renderIcon()}
    </button>
  );
};

export default Button;

// Export types for external use
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonState,
  IconPosition,
};
