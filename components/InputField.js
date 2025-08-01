// components/InputField.js
import React from "react";

export default function InputField({ label, help, className = "", ...props }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label}
      </label>
      {help && (
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{help}</p>
      )}
      <input
        {...props}
        className={`beveled-input ${className}`}
      />
    </div>
  );
}
