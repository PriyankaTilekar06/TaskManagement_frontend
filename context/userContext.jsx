import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assignedInitials, setAssignedInitials] = useState("");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token"); //
    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/api/profile", {
        method: "GET", //
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await response.json();
      console.log("Profile data:", profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  const updateTask = async (taskId, updatedData) => {
    if (!token) {
      setError("No token found for task update");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/task/${taskId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Task updated:", response.data);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        assignedInitials,
        setAssignedInitials,
        error,
        updateTask,
        fetchUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
