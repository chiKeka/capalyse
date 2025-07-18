import { cn } from "@/lib/uitils/cn";
import React, { useState } from "react";

type InputType = "text" | "email" | "password" | "phone" | "textarea";

type InputProps = {
  label?: string;
  name: string;
  type: InputType;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  className?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({ label, name, type, value, onChange, className = "", ...rest }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClass = cn(
    "w-full px-4 py-2 border border-[#E8E8E8] placeholder:text-[#A8A8A8] placeholder:text-sm text-sm font-normal placeholder:font-normal rounded-md focus:outline-none focus:ring-1 focus:ring-green",
    className
  );

  // Controlled if value/onChange provided, otherwise uncontrolled (for RHF)
  const inputProps = {
    id: name,
    name,
    ref,
    className: inputClass,
    ...rest,
    ...(typeof value !== "undefined" ? { value } : {}),
    ...(typeof onChange !== "undefined" ? { onChange } : {}),
  };

  return (
    <div className="mb-4 max-w-xl ">
      {label && (
        <label htmlFor={name} className="block mb-1 font-normal text-[#525252]">
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : type === "password" ? (
        <div className="relative">
          <input
            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
            type={showPassword ? "text" : "password"}
            className={inputClass + " pr-10"}
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            tabIndex={0}
            role="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
      ) : (
        <input
          {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
          type={type === "phone" ? "tel" : type}
        />
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
