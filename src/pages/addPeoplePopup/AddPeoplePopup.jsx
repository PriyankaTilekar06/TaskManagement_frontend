import React, { useContext, useState } from "react";
import styles from "./AddPeoplePopup.module.css";
import TaskContext from "../../../context/TaskContext";

export default function AddPeoplePopup({ onClose, onAddMember }) {
  const [email, setEmail] = useState("");
  const [isEmailAdded, setIsEmailAdded] = useState(false);

  const handleAddEmail = () => {
    if (email.trim() !== "") {
      setIsEmailAdded(true);

      const initials = email
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      onAddMember(initials);
    }
  };

  const handleOkayGotIt = () => {
    setIsEmailAdded(false);
    setEmail("");
    onClose();
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        {!isEmailAdded ? (
          <>
            <h1 className={styles.heading}>Add people to the board</h1>
            <input
              className={styles.emailInput}
              type="email"
              placeholder="Enter the email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className={styles.btns}>
              <button className={styles.cancelbtn} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.emailbtn} onClick={handleAddEmail}>
                Add Email
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              height: "150px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1
              className={styles.email}
              style={{
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              {email} added to the board
            </h1>
            <button
              className={styles.okayBtn}
              onClick={handleOkayGotIt}
              style={{
                width: "300px",
                height: "44px",
                backgroundColor: " #17A2B8",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Okay, got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
