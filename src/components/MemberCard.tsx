import React from "react";
import { Member } from "../data/exampleData";
import { useDraggable } from "@dnd-kit/core";
import "../styling/MemberCard/MemberCard.scss"; // Import your CSS file

interface MemberCardProps {
  member: Member;
  onRemove: (id: string) => void;
  setEditingPerson: (person: {
    id: string;
    name: string;
    type: "member";
  }) => void;
}

export default function MemberCard({
  member,
  onRemove,
  setEditingPerson,
}: MemberCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: member.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="member-card">
      <div {...attributes} {...listeners} className="drag-handle">
        <h4 className="member-name">{member.name}</h4>
      </div>
      <button
        onClick={(e) => {
          console.log("Remove button clicked for member:", member.id);
          e.stopPropagation();
          onRemove(member.id);
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
            id: member.id,
            name: member.name,
            type: "member",
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
