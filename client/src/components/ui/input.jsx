import React from 'react';

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5CE65C] focus:border-transparent ${className}`}
      {...props}
    />
  );
}

export default Input;

