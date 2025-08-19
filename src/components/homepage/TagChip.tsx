import React from "react";

export default function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-block px-3 py-1 mr-2 mb-2 rounded-full bg-[#f4f4f7] text-xs font-semibold text-[#6f42c1] border border-[#e0e0e0]">
      #{tag}
    </span>
  );
} 