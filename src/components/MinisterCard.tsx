import React from "react";
import { Minister } from "../data/exampleData";
import { useDraggable } from "@dnd-kit/core";
import "../styling/MemberCard/MemberCard.scss"; // Import your CSS file

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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="minister-card"
    >
      <h4 className="minister-name">{minister.name}</h4>
      <p className="minister-gender">{minister.gender}</p>
    </div>
  );
}
