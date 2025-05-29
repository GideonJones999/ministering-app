import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
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

// Add Districts Dropdown
// Import Tutorial
// Priority Tag to certain Members (Binary)

function App() {
  // State management
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
  const [activeDragItem, setActiveDragItem] = useState<
    Minister | Member | null
  >(null);
  const [ministerSearch, setMinisterSearch] = useState("");
  const [companionshipSearch, setCompanionshipSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const totalMembers =
    unassignedMembers.length +
    companionships.reduce((sum, c) => sum + (c.members?.length || 0), 0);

  const expectedMembersPerCompanionship =
    companionships.length > 0
      ? (totalMembers / companionships.length).toFixed(2)
      : "N/A";

  // Functions
  const getContainerId = (id: string): string | null => {
    if (unassignedMinisters.some((m) => m.id === id)) {
      return "unassigned-ministers";
    }
    if (unassignedMembers.some((m) => m.id === id)) {
      return "unassigned-members";
    }

    const found = companionships.find(
      (c) =>
        c.ministers.some((m) => m.id === id) ||
        c.members?.some((m) => m.id === id)
    );

    if (!found) {
      return null;
    }

    const isMinister = found.ministers.some((m) => m.id === id);
    const containerId = isMinister
      ? `companionship-${found.id}`
      : `companionship-${found.id}-members`;

    return containerId;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id;

    if (typeof activeId !== "string") {
      console.error("Invalid active ID:", activeId);
      return;
    }
    const minister =
      unassignedMinisters.find((m) => m.id === activeId) ||
      companionships.flatMap((c) => c.ministers).find((m) => m.id === activeId);

    const member =
      unassignedMembers.find((m) => m.id === activeId) ||
      companionships
        .flatMap((c) => c.members || [])
        .find((m) => m.id === activeId);

    setActiveDragItem(minister || member || null); // Set the dragged item
    const sourceId = getContainerId(activeId);
    setActiveDragStartZoneId(sourceId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null); // Clear the dragged item
    const { active, over } = event;

    // If there's no valid drop target, do nothing
    if (!over) {
      return;
    }

    // If the card is dropped back into the same zone, do nothing
    if (activeDragStartZoneId === over.id) {
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

    const duplicateMinisters: string[] = [];
    const duplicateMembers: string[] = [];
    const uniqueMinisters: string[] = [];
    const uniqueMembers: string[] = [];

    // Check for duplicates in the respective lists
    names.forEach((name) => {
      if (
        (type === "minister" || type === "both") &&
        unassignedMinisters.some((m) => m.name === name)
      ) {
        duplicateMinisters.push(name);
      } else if (type === "minister" || type === "both") {
        uniqueMinisters.push(name);
      }

      if (
        (type === "member" || type === "both") &&
        unassignedMembers.some((m) => m.name === name)
      ) {
        duplicateMembers.push(name);
      } else if (type === "member" || type === "both") {
        uniqueMembers.push(name);
      }
    });

    // Add unique ministers
    if (type === "minister" || type === "both") {
      const newMinisters = uniqueMinisters.map((name) => ({
        id: `min-${uuidv4()}`,
        name,
      }));
      setUnassignedMinisters((prev) =>
        [...prev, ...newMinisters].sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    // Add unique members
    if (type === "member" || type === "both") {
      const newMembers = uniqueMembers.map((name) => ({
        id: `mem-${uuidv4()}`,
        name,
      }));
      setUnassignedMembers((prev) =>
        [...prev, ...newMembers].sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    // Show warnings for duplicates
    showDuplicateWarnings(duplicateMinisters, duplicateMembers);

    setBulkInput(""); // Clear the input
    setShowBulkAddForm(false); // Hide the form
  };

  const handleRemoveMinister = (id: string) => {
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

  const matchesMinisterSearch = (name: string) =>
    name.toLowerCase().includes(ministerSearch.toLowerCase());
  const matchesCompanionshipSearch = (name: string) =>
    name.toLowerCase().includes(companionshipSearch.toLowerCase());
  const matchesMemberSearch = (name: string) =>
    name.toLowerCase().includes(memberSearch.toLowerCase());

  const handleExportToCSV = () => {
    const rows: string[][] = [];

    // Add header for unassigned ministers
    rows.push(["Unassigned Ministers"]);
    unassignedMinisters.forEach((minister) => {
      rows.push([minister.name]);
    });

    // Add header for unassigned members
    rows.push([]);
    rows.push(["Unassigned Members"]);
    unassignedMembers.forEach((member) => {
      rows.push([member.name, member.priority ? "1" : "0"]);
    });

    // Add header for companionships
    rows.push([]);
    rows.push(["Ministers", "Members"]);
    companionships.forEach((companionship) => {
      const ministers = companionship.ministers.map((m) => m.name).join("; ");
      const members = (companionship.members ?? [])
        .map((m) => m.name)
        .join("; ");
      const priorities = (companionship.members ?? [])
        .map((m) => (m.priority ? "1" : "0"))
        .join("; ");
      rows.push([ministers, members, priorities]);
    });

    // Convert rows to CSV format
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.join(",")).join("\n");

    // Get the current date
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `companionship-assignments-${formattedDate}.csv`
    );
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;

      // Parse the CSV content
      const rows = content
        .trim()
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));

      // Initialize new state
      const newUnassignedMinisters: Minister[] = [];
      const newUnassignedMembers: Member[] = [];
      const newCompanionships: Companionship[] = [];
      const duplicateMinisters: string[] = [];
      const duplicateMembers: string[] = [];

      let currentSection:
        | "unassigned-ministers"
        | "unassigned-members"
        | "companionships"
        | null = null;

      // Maps to track existing ministers and members by name
      const existingMinisters = new Map<string, Minister>();
      const existingMembers = new Map<string, Member>();

      // Populate maps with existing unassigned ministers and members
      unassignedMinisters.forEach((minister) => {
        existingMinisters.set(minister.name, minister);
      });
      unassignedMembers.forEach((member) => {
        existingMembers.set(member.name, member);
      });

      // Populate maps with ministers and members in companionships
      companionships.forEach((companionship) => {
        companionship.ministers.forEach((minister) => {
          existingMinisters.set(minister.name, minister);
        });
        companionship.members?.forEach((member) => {
          existingMembers.set(member.name, member);
        });
      });

      rows.forEach((row) => {
        const rowHeader = row
          .map((cell) => cell.trim())
          .join(",")
          .toLowerCase();

        // Detect section headers
        if (rowHeader === "unassigned ministers") {
          currentSection = "unassigned-ministers";
          return;
        } else if (rowHeader === "unassigned members") {
          currentSection = "unassigned-members";
          return;
        } else if (rowHeader === "ministers,members") {
          currentSection = "companionships";
          return;
        }

        // Handle row based on current section
        if (currentSection === "unassigned-ministers") {
          const ministerName = row[0];
          console.log("Processing minister:", ministerName);
          if (ministerName && !existingMinisters.has(ministerName)) {
            const minister = { id: `min-${uuidv4()}`, name: ministerName };
            newUnassignedMinisters.push(minister);
            existingMinisters.set(ministerName, minister);
          } else if (ministerName) {
            duplicateMinisters.push(ministerName);
          }
        } else if (currentSection === "unassigned-members") {
          const memberName = row[0];
          const priority = row[1] === "1"; // Check if priority is set
          console.log("Processing member:", memberName);
          if (memberName && !existingMembers.has(memberName)) {
            const member = {
              id: `mem-${uuidv4()}`,
              name: memberName,
              priority,
            };
            newUnassignedMembers.push(member);
            existingMembers.set(memberName, member);
          } else if (memberName) {
            duplicateMembers.push(memberName);
          }
        } else if (currentSection === "companionships") {
          console.log("Processing companionship row:", row);
          const ministerNames = row[0]
            .split(";")
            .map((name) => name.trim())
            .filter(Boolean);
          const memberNames = row[1]
            ? row[1]
                .split(";")
                .map((name) => name.trim())
                .filter(Boolean)
            : [];
          const priorities = row[2]
            ? row[2].split(";").map((val) => val.trim() === "1")
            : []; // Create or get Minister objects
          const ministers = ministerNames.map((name) => {
            let minister = existingMinisters.get(name);
            if (!minister) {
              minister = { id: `min-${uuidv4()}`, name };
              existingMinisters.set(name, minister);
            }
            return minister;
          });

          // Create or get Member objects
          const members = memberNames.map((name, idx) => {
            let member = existingMembers.get(name);
            const priority = priorities[idx] || false;
            if (!member) {
              member = { id: `mem-${uuidv4()}`, name, priority };
              existingMembers.set(name, member);
            } else {
              member = { ...member, priority };
            }
            return member;
          });

          // Only add if there is at least one minister or member
          if (ministers.length > 0 || members.length > 0) {
            newCompanionships.push({
              id: `comp-${uuidv4()}`,
              ministers,
              members,
            });
          }
        }
      });

      // Update state
      setCompanionships((prev) => [...prev, ...newCompanionships]);
      setUnassignedMembers((prev) =>
        [...prev, ...newUnassignedMembers].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setUnassignedMinisters((prev) =>
        [...prev, ...newUnassignedMinisters].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      showDuplicateWarnings(duplicateMinisters, duplicateMembers);
    };

    reader.readAsText(file);
  };

  const handleTogglePriority = (id: string) => {
    setUnassignedMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, priority: !m.priority } : m))
    );
    setCompanionships((prev) =>
      prev.map((c) => ({
        ...c,
        members: c.members?.map((m) =>
          m.id === id ? { ...m, priority: !m.priority } : m
        ),
      }))
    );
  };

  function showDuplicateWarnings(
    duplicateMinisters: string[],
    duplicateMembers: string[]
  ) {
    const duplicateWarnings: string[] = [];
    if (duplicateMinisters.length > 0) {
      duplicateWarnings.push(
        `The following names were not added as ministers because they already exist: ${duplicateMinisters.join(
          ", "
        )}`
      );
    }
    if (duplicateMembers.length > 0) {
      duplicateWarnings.push(
        `The following names were not added as members because they already exist: ${duplicateMembers.join(
          ", "
        )}`
      );
    }
    if (duplicateWarnings.length > 0) {
      alert(duplicateWarnings.join("\n"));
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <DragOverlay>
        {activeDragItem ? (
          <div className="drag-overlay">
            <h4>{activeDragItem.name}</h4>
          </div>
        ) : null}
      </DragOverlay>
      {/* ------------- APP CONTAINER ------------- */}
      <div className="app-container">
        <div className="app-header">
          <h1 className="app-title">Ministering App</h1>
          <div className="header-buttons">
            <span>
              Expected Members per Companionship:{" "}
              <b style={{ paddingLeft: ".25em" }}>
                {expectedMembersPerCompanionship}
              </b>
            </span>
            <button
              onClick={() => document.getElementById("file-input")?.click()}
            >
              Import CSV
            </button>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleImportCSV}
            />
            <button onClick={() => setShowBulkAddForm(true)}>
              Add Multiple People
            </button>
          </div>
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
            <h2 className="column-title">Ministers</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search ministers..."
                value={ministerSearch}
                onChange={(e) => setMinisterSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <DropZone id="unassigned-ministers" label="Drop Ministers Here">
              {unassignedMinisters.length === 0 ? (
                <p className="na-text">No Unassigned Ministers</p>
              ) : (
                unassignedMinisters
                  .filter((m) => matchesMinisterSearch(m.name))
                  .map((m) => {
                    // Find a member with the same name as the minister
                    const matchingMember =
                      unassignedMembers.find(
                        (member) => member.name === m.name
                      ) ||
                      companionships
                        .flatMap((c) => c.members || [])
                        .find((member) => member.name === m.name);

                    // Get the ministers assigned to the matching member
                    const matchingMemberMinisters = matchingMember
                      ? companionships
                          .filter((c) =>
                            c.members?.some(
                              (member) => member.id === matchingMember.id
                            )
                          )
                          .flatMap((c) => c.ministers)
                      : [];

                    return (
                      <MinisterCard
                        key={m.id}
                        minister={m}
                        onRemove={handleRemoveMinister}
                        setEditingPerson={setEditingPerson}
                        matchingMemberMinisters={matchingMemberMinisters} // Pass assigned ministers
                      />
                    );
                  })
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
            <div className="search-container">
              <input
                type="text"
                placeholder="Search companionships..."
                value={companionshipSearch}
                onChange={(e) => setCompanionshipSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="comps-container">
              {/* Zone to create new companionships */}
              <DropZone
                id="new-companionship"
                label="Drop minister here to start a new companionship"
              />

              {/* Existing companionships */}
              {companionships.map((c) => {
                const filteredMinisters = c.ministers.filter((m) =>
                  matchesCompanionshipSearch(m.name)
                );
                const filteredMembers = (c.members ?? []).filter((m) =>
                  matchesCompanionshipSearch(m.name)
                );

                if (
                  filteredMinisters.length === 0 &&
                  filteredMembers.length === 0
                )
                  return null;
                return (
                  <div key={c.id} className="comp-card">
                    <div className="ministers-group">
                      {c.ministers.map((m) => {
                        const matchingMember =
                          unassignedMembers.find(
                            (member) => member.name === m.name
                          ) ||
                          companionships
                            .flatMap((c) => c.members || [])
                            .find((member) => member.name === m.name);

                        const matchingMemberMinisters = matchingMember
                          ? companionships
                              .filter((c) =>
                                c.members?.some(
                                  (member) => member.id === matchingMember.id
                                )
                              )
                              .flatMap((c) => c.ministers)
                          : [];

                        return (
                          <MinisterCard
                            key={m.id}
                            minister={m}
                            onRemove={handleRemoveMinister}
                            setEditingPerson={setEditingPerson}
                            matchingMemberMinisters={matchingMemberMinisters} // Pass assigned ministers
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
                );
              })}
            </div>
            <button onClick={handleExportToCSV}>Export to CSV</button>
          </div>

          {/* ------------ Unassigned Members ------------ */}
          <div className="main-column" id="unassigned-members-column">
            <h2 className="column-title">Members</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <DropZone id="unassigned-members" label="Drop Members Here">
              {unassignedMembers.length === 0 ? (
                <p className="na-text">No Unassigned Members</p>
              ) : (
                unassignedMembers
                  .filter((m) => matchesMemberSearch(m.name))
                  .map((m) => (
                    <MemberCard
                      key={m.id}
                      member={m}
                      setEditingPerson={setEditingPerson}
                      onRemove={handleRemoveMember}
                      onTogglePriority={handleTogglePriority}
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
