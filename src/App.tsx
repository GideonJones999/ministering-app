import React, { useState } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  ministers as allMinisters,
  members,
  Minister,
  Companionship,
} from "./data/exampleData";
import MinisterCard from "./components/MinisterCard";
import MemberCard from "./components/MemberCard";
import DropZone from "./components/DropZone";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

// Add Distrcits
// Make Members to Right of Ministers
// Import names from list to Ministers list and Members List
// Imoport Tutorial
// Add a minister or member
// Edit a minister or member
// Priority Tag to certain Members (Binary)
// Delete a member or minister
// Export the list to a CSV

function App() {
  const [companionships, setCompanionships] = useState<Companionship[]>([]);

  const isMinisterAssigned = (ministerId: string) =>
    companionships.some((c) => c.ministers.some((mi) => mi.id === ministerId));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const minister = allMinisters.find((m) => m.id === active.id);
    const member = members.find((m) => m.id === active.id);
    if (!minister && !member) return;

    // — 1. Remove minister from any current companionship —
    let updated = companionships.map((c) => ({
      ...c,
      ministers: c.ministers.filter((mi) => mi.id !== active.id),
      members: c.members?.filter((me) => me.id !== active.id) || [],
    }));

    // — 2. Dropped back on Unassigned panel —
    if (
      over.id === "unassigned-ministers" ||
      over.id === "unassigned-members"
    ) {
      updated = updated.filter((c) => c.ministers.length > 0); // auto‑delete empties
      setCompanionships(updated);
      return;
    }

    // — 3. Dropped on NEW companionship zone —
    if (over.id === "new-companionship") {
      updated.push({
        id: uuidv4(),
        ministers: minister ? [minister] : [],
        members: member ? [member] : [],
      });
      setCompanionships(updated);
      return;
    }

    // — 4. Dropped on an EXISTING companionship zone —
    if (typeof over.id === "string" && over.id.startsWith("companionship-")) {
      const targetId = over.id.replace("companionship-", "");
      updated = updated.map((c) => {
        if (c.id !== targetId) return c;

        if (minister) {
          // ✋ BLOCK if genders don’t match or already full
          const existingGender = c.ministers[0]?.gender;
          if (
            c.ministers.length >= 3 ||
            (existingGender && existingGender !== minister.gender)
          )
            return c;

          return { ...c, ministers: [...c.ministers, minister] };
        }

        if (member) {
          // Ensure the member is not already in the companionship
          if (c.members?.some((me) => me.id === member.id)) return c;

          return { ...c, members: [...(c.members || []), member] };
        }

        return c;
      });
    }

    // — 5. Auto‑delete empty companionships —
    updated = updated.filter((c) => c.ministers.length > 0);
    setCompanionships(updated);
    console.log(updated);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-4">Ministering App</h1>

        {/* ------------- MAIN GRID ------------- */}
        <div className="grid grid-cols-3 gap-4">
          {/* ------------ Unassigned Ministers ------------ */}
          <DropZone id="unassigned-ministers" label="Unassigned Ministers">
            {allMinisters.filter((m) => !isMinisterAssigned(m.id)).length ===
            0 ? (
              <p className="text-gray-400 italic">No Unassigned Ministers</p>
            ) : (
              allMinisters
                .filter((m) => !isMinisterAssigned(m.id))
                .map((m) => <MinisterCard key={m.id} minister={m} />)
            )}
          </DropZone>

          {/* ------------ Companionships Column ------------ */}
          <div className="bg-white p-4 rounded shadow col-span-2 space-y-4">
            <h2 className="font-semibold mb-2">Companionships</h2>

            {/* Existing companionships */}
            {companionships.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border shadow p-4 bg-white space-y-2"
                style={{
                  margin: "25px 0px",
                  border: "1px solid #ccc",
                  borderRadius: "2em",
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {c.ministers.map((m) => (
                    <MinisterCard key={m.id} minister={m} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.members?.map((m) => (
                    <MemberCard key={m.id} member={m} />
                  ))}
                </div>

                {c.ministers.length < 3 && (
                  <DropZone
                    id={`companionship-${c.id}`}
                    label="Drop minister here"
                  />
                )}
                <DropZone
                  id={`companionship-${c.id}-members`}
                  label="Drop member here"
                />
              </div>
            ))}

            {/* Zone to create new companionships */}
            <DropZone
              id="new-companionship"
              label="Drop minister here to start a new companionship"
            />
          </div>
        </div>

        {/* ------------ Unassigned Members ------------ */}
        <DropZone id="unassigned-members" label="Unassigned Members">
          {members.filter(
            (m) =>
              !companionships.some((c) =>
                c.members?.some((me) => me.id === m.id)
              )
          ).length === 0 ? (
            <p className="text-gray-400 italic">No Unassigned Members</p>
          ) : (
            members
              .filter(
                (m) =>
                  !companionships.some((c) =>
                    c.members?.some((me) => me.id === m.id)
                  )
              )
              .map((m) => <MemberCard key={m.id} member={m} />)
          )}
        </DropZone>
      </div>
    </DndContext>
  );
}
export default App;
