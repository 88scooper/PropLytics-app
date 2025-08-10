"use client";

export default function Button({ children, variant = "primary", loading = false, disabled = false, className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "secondary"
      ? "border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5"
      : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90";
  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? "Saving..." : children}
    </button>
  );
}


