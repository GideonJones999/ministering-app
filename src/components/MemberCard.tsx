import React from "react";
import { Member } from "../data/exampleData";

interface MemberCardProps {
  member: Member;
}


export default function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="border rounded p-3 mb-2 bg-green-50">
      <p className="font-semibold">{member.name}</p>
      <p className="text-sm text-gray-600">
        {member.isFamily ? "Family" : "Individual"}
      </p>
    </div>
  );
}
