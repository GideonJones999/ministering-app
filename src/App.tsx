import React, { useState } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  ministers as allMinisters,
  members,
  Minister,
  Member,
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
  const [newMinister, setNewMinister] = useState({ name: "", gender: "male" });
  const [newMember, setNewMember] = useState({ name: "", isFamily: false });
  const [unassignedMinisters, setUnassignedMinisters] =
    useState<Minister[]>(allMinisters);
  const [unassignedMembers, setUnassignedMembers] = useState<Member[]>(members);
  const [showAddMinisterForm, setShowAddMinisterForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  const isMinisterAssigned = (ministerId: string) =>
    companionships.some((c) => c.ministers.some((mi) => mi.id === ministerId));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const minister = unassignedMinisters.find((m) => m.id === active.id);
    const member = unassignedMembers.find((m) => m.id === active.id);
    if (!minister && !member) return;

    // — 1. Remove minister/member from any current companionship —
    let updated = companionships.map((c) => ({
      ...c,
      ministers: c.ministers.filter((mi) => mi.id !== active.id),
      members: c.members?.filter((me) => me.id !== active.id) || [],
    }));

    // — 2. Dropped back on Unassigned panel —
    if (over.id === "unassigned-ministers") {
      setUnassignedMinisters((prev) => [...prev, minister!]);
      updated = updated.filter((c) => c.ministers.length > 0);
      setCompanionships(updated);
      return;
    }

    if (over.id === "unassigned-members") {
      setUnassignedMembers((prev) => [...prev, member!]);
      updated = updated.filter((c) => c.ministers.length > 0);
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
      setUnassignedMinisters((prev) => prev.filter((m) => m.id !== active.id)); // Remove from unassigned ministers
      setUnassignedMembers((prev) => prev.filter((m) => m.id !== active.id)); // Remove from unassigned members
      setCompanionships(updated);
      return;
    }

    // — 4. Dropped on an EXISTING companionship zone —
    if (typeof over.id === "string") {
      if (
        over.id.startsWith("companionship-") &&
        !over.id.endsWith("-members")
      ) {
        const targetId = over.id.replace("companionship-", "");
        updated = updated.map((c) => {
          if (c.id !== targetId) return c;

          if (minister) {
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
        setUnassignedMinisters((prev) =>
          prev.filter((m) => m.id !== active.id)
        ); // Remove from unassigned ministers
      } else if (over.id.endsWith("-members")) {
        const targetId = over.id
          .replace("companionship-", "")
          .replace("-members", "");
        updated = updated.map((c) => {
          if (c.id !== targetId) return c;

          if (member) {
            if (c.members?.some((me) => me.id === member.id)) return c;

            return { ...c, members: [...(c.members || []), member] };
          }
          return c;
        });
        setUnassignedMembers((prev) => prev.filter((m) => m.id !== active.id)); // Remove from unassigned members
      }
    }

    // — 5. Auto‑delete empty companionships —
    updated = updated.filter((c) => c.ministers.length > 0);
    setCompanionships(updated);
  };

  const handleAddMinister = () => {
    const newMinisterData = {
      id: `min-${uuidv4()}`,
      name: newMinister.name,
      gender: newMinister.gender as "male" | "female",
    };
    setUnassignedMinisters((prev) => [...prev, newMinisterData]);
    setNewMinister({ name: "", gender: "male" });
    setShowAddMinisterForm(false);
  };

  const handleAddMember = () => {
    const newMemberData = {
      id: `mem-${uuidv4()}`,
      name: newMember.name,
      isFamily: newMember.isFamily,
    };
    setUnassignedMembers((prev) => [...prev, newMemberData]);
    setNewMember({ name: "", isFamily: false });
    setShowAddMemberForm(false);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="app-container">
        <h1 className="app-title">Ministering App</h1>

        {/* ------------- MAIN GRID ------------- */}
        <div className="main-grid">
          {/* ------------ Unassigned Ministers ------------ */}
          <DropZone id="unassigned-ministers" label="Unassigned Ministers">
            {unassignedMinisters.length === 0 ? (
              <p className="na-text">No Unassigned Ministers</p>
            ) : (
              unassignedMinisters.map((m) => (
                <MinisterCard key={m.id} minister={m} />
              ))
            )}
          </DropZone>
          <button onClick={() => setShowAddMinisterForm(true)}>
            Add Minister
          </button>

          {showAddMinisterForm && (
            <div className="form-container">
              <h3>Add New Minister</h3>
              <input
                type="text"
                placeholder="Name"
                value={newMinister.name}
                onChange={(e) =>
                  setNewMinister({ ...newMinister, name: e.target.value })
                }
              />
              <select
                value={newMinister.gender}
                onChange={(e) =>
                  setNewMinister({ ...newMinister, gender: e.target.value })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <button onClick={handleAddMinister}>Add Minister</button>
              <button onClick={() => setShowAddMinisterForm(false)}>
                Cancel
              </button>
            </div>
          )}

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
          {unassignedMembers.length === 0 ? (
            <p className="na-text">No Unassigned Members</p>
          ) : (
            unassignedMembers.map((m) => <MemberCard key={m.id} member={m} />)
          )}
        </DropZone>
        <button onClick={() => setShowAddMemberForm(true)}>Add Member</button>
        {showAddMemberForm && (
          <div className="form-container">
            <h3>Add New Member</h3>
            <input
              type="text"
              placeholder="Name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
            />
            <label>
              <input
                type="checkbox"
                checked={newMember.isFamily}
                onChange={(e) =>
                  setNewMember({ ...newMember, isFamily: e.target.checked })
                }
              />
              Is Family
            </label>
            <button onClick={handleAddMember}>Add Member</button>
            <button onClick={() => setShowAddMemberForm(false)}>Cancel</button>
          </div>
        )}
      </div>
    </DndContext>
  );
}
export default App;
