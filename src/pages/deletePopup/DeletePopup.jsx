import React from "react";
import styles from "./DeletePopup.module.css";

export default function DeletePopup({ onDelete, onCancel }) {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <h1>Are you sure you want to Delete?</h1>
        <button className={styles.deleteBtn} onClick={onDelete}>
          Yes, Delete
        </button>
        <button className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
