import React from "react";
import { Minister } from "../data/exampleData";
import { useDraggable } from "@dnd-kit/core";

interface MinisterCardProps {
  minister: Minister;
}

export default function MinisterCard({ minister }: MinisterCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: minister.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    border: "1px solid #ccc",
    borderRadius: "5em",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded p-3 mb-2 bg-blue-50 minister-card"
    >
      <h4 className="font-semibold">{minister.name}</h4>
      <p className="text-sm text-gray-600">{minister.gender}</p>
    </div>
  );
}
