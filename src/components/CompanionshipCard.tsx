import React from "react";
import MinisterCard from "./MinisterCard";
import MemberCard from "./MemberCard";
import DropZone from "./DropZone";
import { Companionship, Minister, Member } from "../data/exampleData";

interface CompanionshipCardProps {
  companionship: Companionship;
  districtColors: Record<string, string>;
  districtCount: number;
  setCompanionships: React.Dispatch<React.SetStateAction<Companionship[]>>;
  companionships: Companionship[];
  unassignedMembers: Member[];
  handleRemoveMinister: (id: string) => void;
  handleRemoveMember: (id: string) => void;
  setEditingPerson: (person: any) => void;
  handleTogglePriority: (id: string) => void;
  matchesCompanionshipSearch: (name: string) => boolean;
}

const CompanionshipCard: React.FC<CompanionshipCardProps> = ({
  companionship: c,
  districtColors,
  districtCount,
  setCompanionships,
  companionships,
  unassignedMembers,
  handleRemoveMinister,
  handleRemoveMember,
  setEditingPerson,
  handleTogglePriority,
  matchesCompanionshipSearch,
}) => {
  const filteredMinisters = c.ministers.filter((m) =>
    matchesCompanionshipSearch(m.name)
  );
  const filteredMembers = (c.members ?? []).filter((m) =>
    matchesCompanionshipSearch(m.name)
  );

  if (filteredMinisters.length === 0 && filteredMembers.length === 0)
    return null;

  return (
    <div
      className="comp-card"
      style={{
        backgroundColor: c.district ? districtColors[c.district] : undefined,
      }}
    >
      <div className="comp-district">
        <select
          value={c.district || ""}
          onChange={(e) =>
            setCompanionships((prev) =>
              prev.map((comp) =>
                comp.id === c.id ? { ...comp, district: e.target.value } : comp
              )
            )
          }
        >
          <option value="">Select District</option>
          {Array.from({ length: districtCount }, (_, i) => {
            const key = `District ${i + 1}`;
            return (
              <option key={key} value={key}>
                {key}
              </option>
            );
          })}
        </select>
      </div>
      <div className="person-cards">
        <div className="ministers-group">
          {c.ministers.map((m) => {
            const matchingMember =
              unassignedMembers.find((member) => member.name === m.name) ||
              companionships
                .flatMap((c) => c.members || [])
                .find((member) => member.name === m.name);

            const matchingMemberMinisters = matchingMember
              ? companionships
                  .filter((c) =>
                    c.members?.some((member) => member.id === matchingMember.id)
                  )
                  .flatMap((c) => c.ministers)
              : [];

            return (
              <MinisterCard
                key={m.id}
                minister={m}
                onRemove={handleRemoveMinister}
                setEditingPerson={setEditingPerson}
                matchingMemberMinisters={matchingMemberMinisters}
              />
            );
          })}
          {c.ministers.length < 3 && (
            <DropZone
              id={`companionship-${c.id}`}
              label="Drop minister here"
              small={true}
            />
          )}
        </div>
        <div className="members-group">
          {c.members?.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onRemove={handleRemoveMember}
              setEditingPerson={setEditingPerson}
              onTogglePriority={handleTogglePriority}
            />
          ))}
          <DropZone
            id={`companionship-${c.id}-members`}
            label="Drop member here"
            small={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanionshipCard;
