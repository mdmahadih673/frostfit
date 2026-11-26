"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { inputClassName } from "./form-field";

type PasswordInputProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
  required?: boolean;
  describedBy?: string;
};

export function PasswordInput({ id, name, value, onChange, autoComplete, placeholder, required, describedBy }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-describedby={describedBy}
        className={`${inputClassName} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center rounded-full text-[#6f746e] transition-colors duration-300 hover:text-[#1d2c27] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27]"
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}
