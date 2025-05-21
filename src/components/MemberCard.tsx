import React from "react";
import { Member } from "../data/exampleData";
import { useDraggable } from "@dnd-kit/core";

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
    border: "1px solid #ccc",
    borderRadius: "5em",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border rounded p-3 mb-2 bg-blue-50 member-card"
    >
      <h4 className="font-semibold">{member.name}</h4>
      <p className="text-sm text-gray-600">
        {member.isFamily ? "Family" : "Individual"}
      </p>
    </div>
  );
}
