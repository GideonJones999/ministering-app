import React from "react";
import { Minister } from "../data/exampleData";
import { useDraggable } from "@dnd-kit/core";
import "../styling/MemberCard/MemberCard.scss"; // Import your CSS file

interface MinisterCardProps {
  minister: Minister;
  onRemove: (id: string) => void;
  setEditingPerson: (person: {
    id: string;
    name: string;
    type: "minister";
  }) => void;
}

export default function MinisterCard({
  minister,
  onRemove,
  setEditingPerson,
}: MinisterCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: minister.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="minister-card">
      <div {...attributes} {...listeners} className="drag-handle">
        <h4 className="minister-name">{minister.name}</h4>
      </div>
      <button
        onClick={(e) => {
          console.log("Remove button clicked for minister:", minister.id);
          e.stopPropagation();
          onRemove(minister.id);
        }}
        className="card-button"
        id="remove-button"
      >
        Remove
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditingPerson({
            id: minister.id,
            name: minister.name,
            type: "minister",
          });
        }}
        className="card-button"
        id="edit-button"
      >
        Edit
      </button>
    </div>
  );
}
