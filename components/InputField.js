// components/InputField.js
import React from "react";

export default function InputField({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-muted">
        {label}
      </span>

      <input
        {...props}
        className={`mt-1 block w-full rounded-xl border-gray-300
                    text-sm placeholder:text-muted
                    focus:border-primary focus:ring-primary/30 ${className}`}
      />
    </label>
  );
}
