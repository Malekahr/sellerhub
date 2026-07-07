import { useEffect, useState } from "react";

import { apiDelete, apiGet, apiPost } from "../api/api.js";
import GroupCard from "../components/GroupCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function GroupsPage() {
  const { currentUser } = useAuth();

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedMembersGroupId, setSelectedMembersGroupId] = useState(null);
  const [activeAddMemberGroupId, setActiveAddMemberGroupId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [addingMemberGroupId, setAddingMemberGroupId] = useState(null);
  const [addMemberForms, setAddMemberForms] = useState({});
  const [removingMemberUserId, setRemovingMemberUserId] = useState(null);
  const [leavingGroupId, setLeavingGroupId] = useState(null);

  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    is_private: false,
  });

  async function loadGroups() {
    const data = await apiGet("/groups");
    setGroups(data);
  }

  async function loadMyGroups() {
    const data = await apiGet("/groups/my");
    setMyGroups(data);
  }

  async function loadMembers(groupId) {
    const data = await apiGet(`/groups/${groupId}/members`);
    setGroupMembers(data);
  }

  async function loadGroupData() {
    setError("");
    setIsLoading(true);

    try {
      await Promise.all([loadGroups(), loadMyGroups()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCreateGroupChange(event) {
    const { name, value, type, checked } = event.target;

    setCreateFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleCreateGroup(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsCreating(true);

    try {
      const newGroup = await apiPost("/groups", {
        name: createFormData.name.trim(),
        description: createFormData.description.trim(),
        is_private: createFormData.is_private,
      });

      setMyGroups((previousGroups) => [newGroup, ...previousGroups]);

      if (!newGroup.is_private) {
        setGroups((previousGroups) => [newGroup, ...previousGroups]);
      }

      setCreateFormData({
        name: "",
        description: "",
        is_private: false,
      });

      setSuccessMessage("Group created successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoinGroup(groupId) {
    setError("");
    setSuccessMessage("");
    setJoiningGroupId(groupId);

    try {
      await apiPost(`/groups/${groupId}/join`);
      await loadMyGroups();

      setSuccessMessage("You have joined the group successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setJoiningGroupId(null);
    }
  }

  async function handleShowMembers(groupId) {
    setError("");
    setSuccessMessage("");

    if (selectedMembersGroupId === groupId) {
      setSelectedMembersGroupId(null);
      setGroupMembers([]);
      return;
    }

    setSelectedMembersGroupId(groupId);
    setIsLoadingMembers(true);

    try {
      await loadMembers(groupId);
    } catch (error) {
      setError(error.message);
      setSelectedMembersGroupId(null);
      setGroupMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }

  function handleToggleAddMember(groupId) {
    setError("");
    setSuccessMessage("");

    setActiveAddMemberGroupId((currentGroupId) =>
      currentGroupId === groupId ? null : groupId
    );
  }

  function handleAddMemberChange(groupId, value) {
    setAddMemberForms((previousForms) => ({
      ...previousForms,
      [groupId]: value,
    }));
  }

  async function handleAddMember(event, groupId) {
    event.preventDefault();

    const username = addMemberForms[groupId]?.trim();

    if (!username) {
      setError("Please enter a username.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setAddingMemberGroupId(groupId);

    try {
      await apiPost(`/groups/${groupId}/members/by-username`, {
        username,
      });

      setAddMemberForms((previousForms) => ({
        ...previousForms,
        [groupId]: "",
      }));

      if (selectedMembersGroupId === groupId) {
        await loadMembers(groupId);
      }

      setActiveAddMemberGroupId(null);
      setSuccessMessage(`${username} has been added to the group.`);
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingMemberGroupId(null);
    }
  }

  async function handleRemoveMember(groupId, userId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this user from the group?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setRemovingMemberUserId(userId);

    try {
      await apiDelete(`/groups/${groupId}/members/${userId}`);
      await loadMembers(groupId);

      setSuccessMessage("User removed from the group.");
    } catch (error) {
      setError(error.message);
    } finally {
      setRemovingMemberUserId(null);
    }
  }

  async function handleLeaveGroup(groupId) {
    const confirmed = window.confirm(
      "Are you sure you want to leave this group?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setLeavingGroupId(groupId);

    try {
      await apiPost(`/groups/${groupId}/leave`);

      setMyGroups((previousGroups) =>
        previousGroups.filter((group) => group.id !== groupId)
      );

      if (selectedMembersGroupId === groupId) {
        setSelectedMembersGroupId(null);
        setGroupMembers([]);
      }

      if (activeAddMemberGroupId === groupId) {
        setActiveAddMemberGroupId(null);
      }

      setSuccessMessage("You left the group.");
    } catch (error) {
      setError(error.message);
    } finally {
      setLeavingGroupId(null);
    }
  }

  function isMyGroup(groupId) {
    return myGroups.some((group) => group.id === groupId);
  }

  function isGroupOwner(group) {
    return currentUser && group.owner_id === currentUser.id;
  }

  useEffect(() => {
    loadGroupData();
  }, []);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">
            Browse public groups, join communities, and manage your own groups.
          </p>
        </div>
      </div>

      <div className="card group-create-card">
        <h2>Create a new group</h2>

        <form onSubmit={handleCreateGroup} className="form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Group name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={createFormData.name}
                onChange={handleCreateGroupChange}
                placeholder="Example: Sneaker Finds"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="is_private">
                <input
                  id="is_private"
                  name="is_private"
                  type="checkbox"
                  checked={createFormData.is_private}
                  onChange={handleCreateGroupChange}
                />
                Private group
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={createFormData.description}
              onChange={handleCreateGroupChange}
              placeholder="What is this group about?"
              rows="3"
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create group"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="card loading-state">
          <p>Loading groups...</p>
        </div>
      ) : (
        <>
          <section className="groups-section">
            <h2>My groups</h2>

            {myGroups.length === 0 ? (
              <div className="card empty-state">
                <p>You are not a member of any groups yet.</p>
              </div>
            ) : (
              <div className="group-list">
                {myGroups.map((group) => (
                  <div key={group.id} className="group-item-block">
                    <GroupCard group={group}>
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled
                      >
                        Joined
                      </button>

                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => handleShowMembers(group.id)}
                      >
                        {selectedMembersGroupId === group.id
                          ? "Hide members"
                          : "View members"}
                      </button>

                      {isGroupOwner(group) && (
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => handleToggleAddMember(group.id)}
                        >
                          {activeAddMemberGroupId === group.id
                            ? "Close add user"
                            : "Add user"}
                        </button>
                      )}

                      {!isGroupOwner(group) && (
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => handleLeaveGroup(group.id)}
                          disabled={leavingGroupId === group.id}
                        >
                          {leavingGroupId === group.id
                            ? "Leaving..."
                            : "Leave group"}
                        </button>
                      )}
                    </GroupCard>

                    {isGroupOwner(group) &&
                      activeAddMemberGroupId === group.id && (
                        <div className="card add-member-card">
                          <h3>Add user to {group.name}</h3>

                          <form
                            onSubmit={(event) =>
                              handleAddMember(event, group.id)
                            }
                            className="add-member-form"
                          >
                            <input
                              type="text"
                              value={addMemberForms[group.id] || ""}
                              onChange={(event) =>
                                handleAddMemberChange(
                                  group.id,
                                  event.target.value
                                )
                              }
                              placeholder="Username"
                              minLength={2}
                              maxLength={50}
                            />

                            <button
                              type="submit"
                              className="button button-primary"
                              disabled={addingMemberGroupId === group.id}
                            >
                              {addingMemberGroupId === group.id
                                ? "Adding..."
                                : "Add member"}
                            </button>
                          </form>
                        </div>
                      )}

                    {selectedMembersGroupId === group.id && (
                      <div className="card members-card">
                        <h3>Members of {group.name}</h3>

                        {isLoadingMembers ? (
                          <p>Loading members...</p>
                        ) : groupMembers.length === 0 ? (
                          <p className="muted-text">No members found.</p>
                        ) : (
                          <div className="member-list">
                            {groupMembers.map((member) => (
                              <div key={member.id} className="member-item">
                                <div>
                                  <strong>
                                    {member.user?.username ||
                                      `User ${member.user_id}`}
                                  </strong>
                                </div>

                                <div className="member-actions">
                                  <span className="badge badge-public">
                                    {member.role}
                                  </span>

                                  {isGroupOwner(group) &&
                                    member.user_id !== currentUser?.id && (
                                      <button
                                        type="button"
                                        className="button button-danger"
                                        onClick={() =>
                                          handleRemoveMember(
                                            group.id,
                                            member.user_id
                                          )
                                        }
                                        disabled={
                                          removingMemberUserId === member.user_id
                                        }
                                      >
                                        {removingMemberUserId === member.user_id
                                          ? "Removing..."
                                          : "Remove"}
                                      </button>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="groups-section">
            <h2>Public groups</h2>

            {groups.length === 0 ? (
              <div className="card empty-state">
                <h3>No public groups yet</h3>
                <p>No public groups have been created yet.</p>
              </div>
            ) : (
              <div className="group-list">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group}>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={joiningGroupId === group.id || isMyGroup(group.id)}
                    >
                      {isMyGroup(group.id)
                        ? "Joined"
                        : joiningGroupId === group.id
                          ? "Joining..."
                          : "Join group"}
                    </button>
                  </GroupCard>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default GroupsPage;