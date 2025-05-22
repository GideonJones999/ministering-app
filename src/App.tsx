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

// Add Search for Minister List and Member List
// Add Search for Companionships
// Add Districts
// Import Tutorial
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
  const [editingPerson, setEditingPerson] = useState<{
    id: string;
    name: string;
    type: "minister" | "member";
  } | null>(null);

  const getContainerId = (id: string): string | null => {
    if (unassignedMinisters.some((m) => m.id === id)) {
      console.log(`ID ${id} found in unassigned-ministers`);
      return "unassigned-ministers";
    }
    if (unassignedMembers.some((m) => m.id === id)) {
      console.log(`ID ${id} found in unassigned-members`);
      return "unassigned-members";
    }

    const found = companionships.find(
      (c) =>
        c.ministers.some((m) => m.id === id) ||
        c.members?.some((m) => m.id === id)
    );

    if (!found) {
      console.log(`ID ${id} not found in any container`);
      return null;
    }

    const isMinister = found.ministers.some((m) => m.id === id);
    const containerId = isMinister
      ? `companionship-${found.id}`
      : `companionship-${found.id}-members`;

    console.log(`ID ${id} found in ${containerId}`);
    return containerId;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id;

    if (typeof activeId !== "string") {
      console.error("Invalid active ID:", activeId);
      return;
    }
    const sourceId = getContainerId(activeId);
    console.log("Dragging from:", sourceId);
    setActiveDragStartZoneId(sourceId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If there's no valid drop target, do nothing
    if (!over) {
      console.log("Drag ended without a valid drop.");
      return;
    }

    console.log("Drag ended:", { active, over });

    // If the card is dropped back into the same zone, do nothing
    if (activeDragStartZoneId === over.id) {
      console.log("Card dropped back into the same zone. No action taken.");
      return;
    }

    const minister =
      unassignedMinisters.find((m) => m.id === active.id) ||
      companionships
        .flatMap((c) => c.ministers)
        .find((m) => m.id === active.id);

    const member =
      unassignedMembers.find((m) => m.id === active.id) ||
      companionships
        .flatMap((c) => c.members || [])
        .find((m) => m.id === active.id);

    if (!minister && !member) return;

    // Remove minister/member from any current companionship
    let updated = companionships.map((c) => ({
      ...c,
      ministers: c.ministers.filter((mi) => mi.id !== active.id),
      members: c.members?.filter((me) => me.id !== active.id) || [],
    }));

    // Handle drop zones
    if (over.id === "unassigned-ministers" && minister) {
      // Dropped back on Unassigned Ministers panel
      setUnassignedMinisters((prev) =>
        [...prev, minister].sort((a, b) => a.name.localeCompare(b.name))
      );
      updated = updated.filter(
        (c) => c.ministers.length > 0 || c.members.length > 0
      );
      setCompanionships(updated);
      return;
    }

    if (over.id === "unassigned-members" && member) {
      // Dropped back on Unassigned Members panel
      setUnassignedMembers((prev) =>
        [...prev, member].sort((a, b) => a.name.localeCompare(b.name))
      );
      updated = updated.filter(
        (c) => c.ministers.length > 0 || c.members.length > 0
      );
      setCompanionships(updated);
      return;
    }

    if (over.id === "new-companionship") {
      // Dropped on NEW companionship zone
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

    if (typeof over.id === "string") {
      // Dropped on an EXISTING companionship zone
      if (
        over.id.startsWith("companionship-") &&
        !over.id.endsWith("-members")
      ) {
        // Dropped on ministers section of a companionship
        const targetId = over.id.replace("companionship-", "");
        updated = updated.map((c) => {
          if (c.id !== targetId) return c;

          if (minister) {
            if (c.ministers.length >= 3) return c; // Limit to 3 ministers
            return { ...c, ministers: [...c.ministers, minister] };
          }
          return c;
        });
        setUnassignedMinisters((prev) =>
          prev.filter((m) => m.id !== active.id)
        ); // Remove from unassigned ministers
      } else if (over.id.endsWith("-members")) {
        // Dropped on members section of a companionship
        const targetId = over.id
          .replace("companionship-", "")
          .replace("-members", "");
        updated = updated.map((c) => {
          if (c.id !== targetId) return c;

          if (member) {
            if (c.members?.some((me) => me.id === member.id)) return c; // Avoid duplicates
            return { ...c, members: [...(c.members || []), member] };
          }
          return c;
        });
        setUnassignedMembers((prev) => prev.filter((m) => m.id !== active.id)); // Remove from unassigned members
      }
    }

    // Auto-delete empty companionships
    updated = updated.filter(
      (c) => c.ministers.length > 0 || c.members.length > 0
    );
    setCompanionships(updated);
  };

  const handleAddMinister = () => {
    const newMinisterData = {
      id: `min-${uuidv4()}`,
      name: newMinister.name,
    };
    setUnassignedMinisters((prev) =>
      [...prev, newMinisterData].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNewMinister({ name: "" });
    setShowAddMinisterForm(false);
  };

  const handleAddMember = () => {
    const newMemberData = {
      id: `mem-${uuidv4()}`,
      name: newMember.name,
    };
    setUnassignedMembers((prev) =>
      [...prev, newMemberData].sort((a, b) => a.name.localeCompare(b.name))
    );
    setNewMember({ name: "" });
    setShowAddMemberForm(false);
  };

  const handleBulkAdd = (type: "minister" | "member" | "both") => {
    const names = bulkInput
      .split("\n") // Split input by new lines
      .map((name) => name.trim()) // Trim whitespace
      .filter((name) => name.length > 0); // Remove empty lines

    if (type === "minister" || type === "both") {
      const newMinisters = names.map((name) => ({
        id: `min-${uuidv4()}`,
        name,
      }));
      setUnassignedMinisters((prev) =>
        [...prev, ...newMinisters].sort((a, b) => a.name.localeCompare(b.name))
      );
    }
    if (type === "member" || type === "both") {
      const newMembers = names.map((name) => ({
        id: `mem-${uuidv4()}`,
        name,
      }));
      setUnassignedMembers((prev) =>
        [...prev, ...newMembers].sort((a, b) => a.name.localeCompare(b.name))
      );
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

  const handleSaveEdit = () => {
    if (!editingPerson) return;

    if (editingPerson.type === "minister") {
      // Update minister
      setUnassignedMinisters((prev) =>
        prev.map((m) =>
          m.id === editingPerson.id ? { ...m, name: editingPerson.name } : m
        )
      );
      setCompanionships((prev) =>
        prev.map((c) => ({
          ...c,
          ministers: c.ministers.map((m) =>
            m.id === editingPerson.id ? { ...m, name: editingPerson.name } : m
          ),
        }))
      );
    } else {
      // Update member
      setUnassignedMembers((prev) =>
        prev.map((m) =>
          m.id === editingPerson.id ? { ...m, name: editingPerson.name } : m
        )
      );
      setCompanionships((prev) =>
        prev.map((c) => ({
          ...c,
          members: c.members?.map((m) =>
            m.id === editingPerson.id ? { ...m, name: editingPerson.name } : m
          ),
        }))
      );
    }

    setEditingPerson(null); // Close the form
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      {/* ------------- APP CONTAINER ------------- */}
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">Ministering App</h1>
          <button onClick={() => setShowBulkAddForm(true)}>
            Add Multiple People
          </button>
        </div>
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
              <button onClick={() => handleBulkAdd("both")}>Add to Both</button>
              <button
                className="cancel-button"
                onClick={() => setShowBulkAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {editingPerson && (
          <div className="form-container" id="edit-form">
            <h3>
              Edit {editingPerson.type === "minister" ? "Minister" : "Member"}
            </h3>
            <input
              type="text"
              value={editingPerson.name}
              onChange={(e) =>
                setEditingPerson({ ...editingPerson, name: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveEdit();
                }
              }}
            />
            <button onClick={handleSaveEdit}>Save</button>
            <button
              className="cancel-button"
              onClick={() => setEditingPerson(null)}
            >
              Cancel
            </button>
          </div>
        )}
        {/* ------------- MAIN GRID ------------- */}
        <div className="main-grid">
          {/* ------------ Unassigned Ministers ------------ */}
          <div className="main-column" id="unassigned-ministers-column">
            <DropZone
              id="unassigned-ministers"
              label="Unassigned Ministers Here"
            >
              {unassignedMinisters.length === 0 ? (
                <p className="na-text">No Unassigned Ministers</p>
              ) : (
                unassignedMinisters.map((m) => (
                  <MinisterCard
                    key={m.id}
                    minister={m}
                    onRemove={handleRemoveMinister}
                    setEditingPerson={setEditingPerson}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddMinister();
                    }
                  }}
                />
                <button onClick={handleAddMinister}>Add Minister</button>
                <button
                  className="cancel-button"
                  onClick={() => setShowAddMinisterForm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ------------ Companionships Column ------------ */}
          <div className="main-column" id="comp-column">
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
                      setEditingPerson={setEditingPerson}
                    />
                  ))}
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
                    />
                  ))}
                  <DropZone
                    id={`companionship-${c.id}-members`}
                    label="Drop member here"
                    small={true}
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

          {/* ------------ Unassigned Members ------------ */}
          <div className="main-column">
            <DropZone id="unassigned-members" label="Unassigned Members Here">
              {unassignedMembers.length === 0 ? (
                <p className="na-text">No Unassigned Members</p>
              ) : (
                unassignedMembers.map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    setEditingPerson={setEditingPerson}
                    onRemove={handleRemoveMember}
                  />
                ))
              )}
            </DropZone>
            <button onClick={() => setShowAddMemberForm(true)}>
              Add Member
            </button>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddMember();
                    }
                  }}
                />
                <button onClick={handleAddMember}>Add Member</button>
                <button
                  className="cancel-button"
                  onClick={() => setShowAddMemberForm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
export default App;
