import React, { useState } from "react";

type InputType = "text" | "email" | "password" | "phone" | "textarea";

type InputProps = {
  label?: string;
  name: string;
  type: InputType;
  value?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  className?: string;
};

const Input: React.FC<InputProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputClass =
    "w-full px-4 py-2 border border-[#E8E8E8] placeholder:text-[#A8A8A8] placeholder:text-sm text-sm font-normal placeholder:font-normal rounded-md  focus:outline-none focus:ring-1 focus:ring-green " +
    className;

  return (
    <div className="mb-4 max-w-xl ">
      {label && (
        <label htmlFor={name} className="block mb-1 font-normal text-[#525252]">
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClass} h-[160px]`}
        />
      ) : type === "password" ? (
        <div className="relative">
          <input
            id={name}
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
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
          id={name}
          name={name}
          type={type === "phone" ? "tel" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
};

export default Input;
