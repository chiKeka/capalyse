import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/uitils/cn";
import React, { useState } from "react";

type InputType = "text" | "email" | "password" | "phone" | "textarea" | "number";

type InputProps = {
  label?: string;
  name: string;
  type: InputType;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">;

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, name, type, value, onChange, className = "", ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputClass = cn(
      "w-full px-4 py-2  border border-[#E8E8E8] placeholder:text-[#A8A8A8] placeholder:text-sm text-sm font-normal placeholder:font-normal rounded-md focus:outline-none focus:ring-1 focus:ring-green",
      className,
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
          <label htmlFor={name} className="block mb-1 text-sm font-bold text-[#525252]">
            {label}
          </label>
        )}
        {type === "textarea" ? (
          <textarea {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
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
  },
);

Input.displayName = "Input";
export default Input;

type CurrencyAmountInputProps = {
  amount: number | "";
  onAmountChange: (value: number | string | undefined) => void;
  currency: string;
  tag?: string;
  onCurrencyChange: (currency: string) => void;
  currencyOptions?: string[];
  placeholder?: string;
  currencyDisabled?: boolean;
};

export function CurrencyAmountInput({
  amount,
  onAmountChange,
  currency,
  tag,
  onCurrencyChange,
  currencyOptions = ["USD", "EUR", "NGN", "GBP"],
  placeholder = "Amount",
  currencyDisabled,
}: CurrencyAmountInputProps) {
  return (
    <div className="flex gap-1 w-full h-auto items-center">
      {tag && <p className="block mb-1 text-[10px] font-medium">{tag}</p>}
      <div className="relative w-full">
        <Input
          name="amount"
          type="number"
          className="pr-20 h-auto min-h-10 ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder={placeholder}
          value={amount as string}
          onChange={(e) => onAmountChange(e.target.value === "" ? "" : Number(e.target.value))}
          min={0}
        />
        <div className="absolute right-0 top-0 h-auto flex items-center">
          <Select value={currency} onValueChange={onCurrencyChange} disabled={currencyDisabled}>
            <SelectTrigger
              disabled={currencyDisabled}
              className="w-20 h-auto mt-[0.5px] min-h-9 rounded-none rounded-r-md border-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
