import type { ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  action?: ReactNode;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export const inputClassName =
  "body-6 h-12 w-full rounded-full border border-[#d8d8d2] bg-white px-4 text-[#151515] placeholder:text-[#8a8f88] transition-colors duration-300 focus:border-[#1d2c27] focus:outline-2 focus:outline-offset-2 focus:outline-[#1d2c27] aria-[invalid=true]:border-[#b3261e] aria-[invalid=true]:outline-[#b3261e]";

export const submitButtonClassName =
  "button-sm flex h-12 w-full items-center justify-center rounded-full bg-[#1d2c27] px-6 text-white transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#344a42] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]";

export function FormField({ id, label, action, hint, error, children }: FormFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="caption-4 text-[#3f413e]">
          {label}
        </label>
        {action}
      </div>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="caption-4 mt-2 text-[#b3261e]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="caption-4 mt-2 text-[#8a8f88]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
