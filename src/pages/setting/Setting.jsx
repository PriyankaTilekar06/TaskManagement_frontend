import React, { useEffect, useState } from "react";
import styles from "./Setting.module.css";
import Sidebar from "../../components/sidebar/Sidebar";
import { CiUser } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { CiLock } from "react-icons/ci";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Setting() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      const updatedInfo = {
        name,
        email,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined,
      };

      console.log("Request Headers:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      const response = await fetch("http://localhost:8000/updateUser", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInfo),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        setError("An error occurred: " + errorText);
        return;
      }
      const responseData = await response.json();
      setSuccess("Profile updated successfully!");
      const updatedUser = {
        ...user,
        name: responseData.name,
        email: responseData.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (user && email !== user.email) {
        const oldEmail = user.email;
        const oldTasks = localStorage.getItem(`tasks_${oldEmail}`);
        if (oldTasks) {
          localStorage.setItem(`tasks_${email}`, oldTasks);
          localStorage.removeItem(`tasks_${oldEmail}`);
        }

        toast.success("Profile updated, you will be logged out.");
        logout();
      } else {
        setSuccess("Profile updated successfully!");
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.error ||
            "An error occurred while updating the profile."
        );
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div>
      <Sidebar />
      <div className={styles.content}>
        <h1 className={styles.title}>Settings</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleUpdate}>
          <div className={styles.formGroup}>
            <CiUser className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Name"
              className={styles.inputField}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <MdOutlineEmail className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Update Email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <CiLock className={styles.inputIcon} />
            <input
              type="password"
              placeholder="Old Password"
              className={styles.inputField}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <CiLock className={styles.inputIcon} />
            <input
              type="password"
              placeholder="New Password"
              className={styles.inputField}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className={styles.update}
            disabled={!name && !email && !oldPassword && !newPassword}
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}
