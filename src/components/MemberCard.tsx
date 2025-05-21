import React from "react";
import { Member } from "../data/exampleData";
import { useDraggable } from "@dnd-kit/core";
import "../styling/MemberCard/MemberCard.scss"; // Import your CSS file

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: member.id,
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
      className="member-card"
    >
      <h4 className="member-name">{member.name}</h4>
      <p className="member-type">{member.isFamily ? "Family" : "Individual"}</p>
    </div>
  );
}
