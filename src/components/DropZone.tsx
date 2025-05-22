import React from "react";
import { useDroppable } from "@dnd-kit/core";
import "../styling/DropZone/DropZone.scss"; // Import your CSS file

export default function DropZone({
  id,
  label,
  disabled = false,
  children,
  small = false,
}: {
  id: string;
  label: string;
  disabled?: boolean;
  children?: React.ReactNode;
  small?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${disabled ? "disabled" : ""}
        ${isOver && !disabled ? "is-over" : ""} ${small ? "small" : ""}`}
    >
      <div className="drop-zone-header">
        <h2>{label}</h2>
      </div>
      <div className="drop-zone-content">{children}</div>
    </div>
  );
}
