import React from "react";
import { useDroppable } from "@dnd-kit/core";

export default function DropZone({
  id,
  label,
  disabled = false,
  children,
}: {
  id: string;
  label: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] border-2 border-dashed rounded p-4 text-center
        ${
          disabled
            ? "border-gray-200 text-gray-300"
            : "border-gray-400 text-gray-500"
        }
        ${isOver && !disabled ? "bg-gray-100" : ""}`}
    >
      <div className="font-semibold mb-2">{label}</div>
      {children}
    </div>
  );
}
