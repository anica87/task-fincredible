import type React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: ReactNode;
}

/** Small generic button — not bank-specific, reusable across the app. */
export function Button({
  children,
  variant = "primary",
  isLoading = false,
  loadingText,
  disabled,
  className,
  ...rest
}: ButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className={["btn", `btn--${variant}`, className].filter(Boolean).join(" ")}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (loadingText ?? "Loading…") : children}
      {/* nullish coalescing operator,
      ako je loadingText null ili undefined, koristi 'Loading…'
      || vraća desnu vrednost ako je leva falsy (false, 0, '', null, undefined, NaN).
      && vraća desnu vrednost ako je leva truthy.
      ?? vraća desnu vrednost samo ako je leva null ili undefined.
       */}
    </button>
  );
}
