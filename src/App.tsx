import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
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

// Change Rows into Columns
// Organize Lists Alphabetically
// Add Distrcits
// Import Tutorial
// Edit a minister or member
// Priority Tag to certain Members (Binary)
// Export the list to a CSV

function App() {
  const [companionships, setCompanionships] = useState<Companionship[]>([]);
  const [newMinister, setNewMinister] = useState({ name: "" });
  const [newMember, setNewMember] = useState({ name: "" });
  const [unassignedMinisters, setUnassignedMinisters] =
    useState<Minister[]>(allMinisters);
  const [unassignedMembers, setUnassignedMembers] = useState<Member[]>(members);
  const [showAddMinisterForm, setShowAddMinisterForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [bulkInput, setBulkInput] = useState(""); // For bulk input
  const [showBulkAddForm, setShowBulkAddForm] = useState(false); // Toggle bulk add form
  const [activeDragStartZoneId, setActiveDragStartZoneId] = useState<
    string | null
  >(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Determine which zone the item started in
    const isMinister = unassignedMinisters.some((m) => m.id === active.id);
    const isMember = unassignedMembers.some((m) => m.id === active.id);

    if (isMinister) {
      setActiveDragStartZoneId("unassigned-ministers");
    } else if (isMember) {
      setActiveDragStartZoneId("unassigned-members");
    } else {
      // Look for the companionship it came from
      const fromComp = companionships.find(
        (c) =>
          c.ministers.some((m) => m.id === active.id) ||
          c.members?.some((m) => m.id === active.id)
      );
      if (fromComp) {
        const minister = fromComp.ministers.find((m) => m.id === active.id);
        const zoneId = minister
          ? `companionship-${fromComp.id}`
          : `companionship-${fromComp.id}-members`;
        setActiveDragStartZoneId(zoneId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id === activeDragStartZoneId) {
      console.log("Drag ended without a valid drop or no real drag happened.");
      setActiveDragStartZoneId(null);
      return;
    }
    console.log("Drag ended:", { active, over });
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
    if (over.id === "unassigned-ministers" && minister) {
      setUnassignedMinisters((prev) => [...prev, minister]);
      updated = updated.filter((c) => c.ministers.length > 0);
      setCompanionships(updated);
      return;
    }

    if (over.id === "unassigned-members" && member) {
      setUnassignedMembers((prev) => [...prev, member]);
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
            if (c.ministers.length >= 3) return c;
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
    setActiveDragStartZoneId(null);
  };

  const handleAddMinister = () => {
    const newMinisterData = {
      id: `min-${uuidv4()}`,
      name: newMinister.name,
    };
    setUnassignedMinisters((prev) => [...prev, newMinisterData]);
    setNewMinister({ name: "" });
    setShowAddMinisterForm(false);
  };

  const handleAddMember = () => {
    const newMemberData = {
      id: `mem-${uuidv4()}`,
      name: newMember.name,
    };
    setUnassignedMembers((prev) => [...prev, newMemberData]);
    setNewMember({ name: "" });
    setShowAddMemberForm(false);
  };

  const handleBulkAdd = (type: "minister" | "member") => {
    const names = bulkInput
      .split("\n") // Split input by new lines
      .map((name) => name.trim()) // Trim whitespace
      .filter((name) => name.length > 0); // Remove empty lines

    if (type === "minister") {
      const newMinisters = names.map((name) => ({
        id: `min-${uuidv4()}`,
        name,
      }));
      setUnassignedMinisters((prev) => [...prev, ...newMinisters]);
    } else if (type === "member") {
      const newMembers = names.map((name) => ({
        id: `mem-${uuidv4()}`,
        name,
      }));
      setUnassignedMembers((prev) => [...prev, ...newMembers]);
    }

    setBulkInput(""); // Clear the input
    setShowBulkAddForm(false); // Hide the form
  };

  const handleRemoveMinister = (id: string) => {
    console.log("Removing minister with ID:", id);

    // Remove from unassigned ministers
    setUnassignedMinisters((prev) =>
      prev.filter((minister) => minister.id !== id)
    );

    // Remove from companionships
    setCompanionships(
      (prev) =>
        prev
          .map((companionship) => ({
            ...companionship,
            ministers: companionship.ministers.filter(
              (minister) => minister.id !== id
            ),
          }))
          .filter(
            (companionship) =>
              companionship.ministers.length > 0 ||
              (companionship.members ?? []).length > 0
          ) // Keep only non-empty companionships
    );
  };

  const handleRemoveMember = (id: string) => {
    console.log("Removing member with ID:", id);

    // Remove from unassigned members
    setUnassignedMembers((prev) => prev.filter((member) => member.id !== id));

    // Remove from companionships
    setCompanionships((prev) =>
      prev.map((companionship) => ({
        ...companionship,
        members: (companionship.members ?? []).filter(
          (member) => member.id !== id
        ),
      }))
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      {/* ------------- APP CONTAINER ------------- */}
      <div className="app-container">
        <h1 className="app-title">Ministering App</h1>
        <button onClick={() => setShowBulkAddForm(true)}>
          Add Multiple People
        </button>
        {showBulkAddForm && (
          <div className="form-container">
            <h3>Add Multiple People</h3>
            <textarea
              placeholder="Enter one name per line"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={5}
            />
            <div className="form-buttons">
              <button onClick={() => handleBulkAdd("minister")}>
                Add as Ministers
              </button>
              <button onClick={() => handleBulkAdd("member")}>
                Add as Members
              </button>
              <button onClick={() => setShowBulkAddForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ------------- MAIN GRID ------------- */}
        <div className="main-grid">
          {/* ------------ Unassigned Ministers ------------ */}
          <DropZone id="unassigned-ministers" label="Unassigned Ministers">
            {unassignedMinisters.length === 0 ? (
              <p className="na-text">No Unassigned Ministers</p>
            ) : (
              unassignedMinisters.map((m) => (
                <MinisterCard
                  key={m.id}
                  minister={m}
                  onRemove={handleRemoveMinister}
                />
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
                    <MinisterCard
                      key={m.id}
                      minister={m}
                      onRemove={handleRemoveMinister}
                    />
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
                    <MemberCard
                      key={m.id}
                      member={m}
                      onRemove={handleRemoveMember}
                    />
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
            unassignedMembers.map((m) => (
              <MemberCard key={m.id} member={m} onRemove={handleRemoveMember} />
            ))
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
            <button onClick={handleAddMember}>Add Member</button>
            <button onClick={() => setShowAddMemberForm(false)}>Cancel</button>
          </div>
        )}
      </div>
    </DndContext>
  );
}
export default App;
