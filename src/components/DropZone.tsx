import React from "react";
import { useDroppable } from "@dnd-kit/core";
import "../styling/DropZone/DropZone.scss"; // Import your CSS file

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
      className={`drop-zone ${disabled ? "disabled" : ""}
        ${isOver && !disabled ? "is-over" : ""}`}
    >
      <div className="drop-zone-header">
        <h2>{label}</h2>
      </div>
      <div className="drop-zone-content">{children}</div>
    </div>
  );
}
