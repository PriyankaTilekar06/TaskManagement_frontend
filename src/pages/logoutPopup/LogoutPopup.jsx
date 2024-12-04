import React, { useContext } from "react";
import styles from "./LogoutPopup.module.css";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutPopup({ onClose }) {
  const context = useAuth();
  console.log("LogoutPopup Context:", context);
  const { logout } = context;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <h1>Are you sure you want to Logout?</h1>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Yes, Logout
        </button>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
