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
import "./styling/Home/Home.scss"; // Import your CSS file
import "./styling/CompCard/CompCard.scss"; // Import your CSS file

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
    if (typeof over.id === "string")
      if (
        over.id.startsWith("companionship-") &&
        !over.id.endsWith("-members")
      ) {
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
          return c;
        });
      } else if (over.id.endsWith("-members")) {
        // Member drop zone
        const targetId = over.id
          .replace("companionship-", "")
          .replace("-members", "");
        updated = updated.map((c) => {
          if (c.id !== targetId) return c;

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
      <div className="app-container">
        <h1 className="app-title">Ministering App</h1>

        {/* ------------- MAIN GRID ------------- */}
        <div className="main-grid">
          {/* ------------ Unassigned Ministers ------------ */}
          <DropZone id="unassigned-ministers" label="Unassigned Ministers">
            {allMinisters.filter((m) => !isMinisterAssigned(m.id)).length ===
            0 ? (
              <p className="na-text">No Unassigned Ministers</p>
            ) : (
              allMinisters
                .filter((m) => !isMinisterAssigned(m.id))
                .map((m) => <MinisterCard key={m.id} minister={m} />)
            )}
          </DropZone>

          {/* ------------ Companionships Column ------------ */}
          <div className="main-column">
            <h2 className="column-title">Companionships</h2>

            {/* Existing companionships */}
            {companionships.map((c) => (
              <div key={c.id} className="comp-card">
                <div className="ministers-group">
                  {c.ministers.map((m) => (
                    <MinisterCard key={m.id} minister={m} />
                  ))}
                  {c.ministers.length < 3 && (
                    <DropZone
                      id={`companionship-${c.id}`}
                      label="Drop minister here"
                    />
                  )}
                </div>
                <div className="members-group">
                  {c.members?.map((m) => (
                    <MemberCard key={m.id} member={m} />
                  ))}
                  <DropZone
                    id={`companionship-${c.id}-members`}
                    label="Drop member here"
                  />
                </div>
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
            <p className="na-text">No Unassigned Members</p>
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
