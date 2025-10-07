"use client";

export default function Input({ label, id, type = "text", className = "", ...props }) {
  return (
    <div className="grid gap-2">
      {label && (
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 ${className}`}
        {...props}
      />
    </div>
  );
}


