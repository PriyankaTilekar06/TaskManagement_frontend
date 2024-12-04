import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./TaskPopup.module.css";
import { MdDelete } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TaskContext, { useTaskContext } from "../../../context/TaskContext";
import { useAuth } from "../../../context/AuthContext";

export default function TaskPopup({ onSave, onClose, taskToEdit }) {
  const { tasks, setTasks, setAssignedAvatars } = useContext(TaskContext);
  const [checklist, setChecklist] = useState(taskToEdit?.task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("LOW PRIORITY");
  const [dueDate, setDueDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [assignedEmails, setAssignedEmails] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.task.title);
      setPriority(taskToEdit.task.priority);
      setDueDate(new Date(taskToEdit.task.dueDate));
      setSelectedAssignees(taskToEdit.task.assignees || []);
    }
  }, [taskToEdit]);

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim() !== "") {
      setChecklist([...checklist, { text: newChecklistItem, checked: false }]);
      setNewChecklistItem("");
    }
  };

  const handleCheckboxToggle = (index) => {
    const updatedChecklist = checklist.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    setChecklist(updatedChecklist);
  };

  const handleDeleteChecklistItem = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/users", { withCredentials: true })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setAssignedEmails(response.data.map((user) => user.email));
        } else {
          console.error("Data fetched is not an array");
        }
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleSave = () => {
    if (!title.trim() || checklist.length === 0) {
      alert("Title and checklist items are required!");
      return;
    }

    if (!user) {
      alert("User not found. Please log in.");
      return;
    }

    const newTask = {
      id: taskToEdit ? taskToEdit.task.id : Date.now(),
      title,
      priority,
      dueDate,
      checklist,
      assignees: selectedAssignees,
    };

    const updatedTasks = { ...tasks };

    const userTasksKey = `tasks_${user.email}`;

    if (taskToEdit) {
      const taskList = Object.keys(updatedTasks).find((listName) =>
        updatedTasks[listName]?.some((task) => task.id === taskToEdit.task.id)
      );
      if (taskList) {
        const taskIndex = updatedTasks[taskList].findIndex(
          (task) => task.id === taskToEdit.task.id
        );
        if (taskIndex !== -1) {
          updatedTasks[taskList][taskIndex] = newTask;
        }
      }
    } else {
      const todo = updatedTasks.todo || [];
      todo.push(newTask);
      updatedTasks.todo = todo;
    }

    console.log("Updated Tasks:", updatedTasks);

    setTasks(updatedTasks);
    localStorage.setItem(userTasksKey, JSON.stringify(updatedTasks));
    onClose();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setDueDate(date);
    setShowCalendar(false);
  };

  const checkedCount = checklist.filter((item) => item.checked).length;

  const handleAssignUser = (email) => {
    setSelectedAssignees([email]);
    const avatar = email.slice(0, 2).toUpperCase();
    const taskId = taskToEdit ? taskToEdit.task.id : Date.now();
    setAssignedAvatars((prev) => ({
      ...prev,
      [taskId]: avatar,
    }));
    setShowDropdown(false);
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <div className={styles.formGroup}>
          <label htmlFor="title">
            Title <span className={styles.asterisk}>*</span>
          </label>
          <input
            type="text"
            className={styles.title}
            placeholder="Enter Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className={styles.priorityContainer}>
          <label>
            Select Priority <span className={styles.asterisk}>*</span>
          </label>
          <div className={styles.priorityButtons}>
            <button
              className={`${styles.priorityButton} ${styles.high} ${
                priority === "HIGH PRIORITY" ? styles.selected : ""
              }`}
              onClick={() => setPriority("HIGH PRIORITY")}
            >
              HIGH PRIORITY
            </button>
            <button
              className={`${styles.priorityButton} ${styles.moderate} ${
                priority === "MODERATE PRIORITY" ? styles.selected : ""
              }`}
              onClick={() => setPriority("MODERATE PRIORITY")}
            >
              MODERATE PRIORITY
            </button>
            <button
              className={`${styles.priorityButton} ${styles.low} ${
                priority === "LOW PRIORITY" ? styles.selected : ""
              }`}
              onClick={() => setPriority("LOW PRIORITY")}
            >
              LOW PRIORITY
            </button>
          </div>
        </div>

        <div className={styles.assignContainer}>
          <label htmlFor="assign">Assign to</label>
          <div className={styles.searchBoxContainer}>
            <input
              type="text"
              className={styles.searchBox}
              placeholder="Add an assignee"
            />
            <RiArrowDropDownLine
              className={styles.dropdownIcon}
              onClick={toggleDropdown}
            />
          </div>
        </div>
        {showDropdown && (
          <div className={styles.dropdown}>
            <ul className={styles.userList}>
              {(assignedEmails || []).map((email, index) => (
                <li
                  key={index}
                  className={styles.userItem}
                  onClick={() => {
                    if (!selectedAssignees.includes(email)) {
                      setSelectedAssignees([...selectedAssignees, email]);
                    }
                  }}
                >
                  <div className={styles.userAvatar}>
                    {email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.userEmail}>{email}</div>
                  <button
                    className={styles.assignButton}
                    onClick={() => handleAssignUser(email)}
                  >
                    Assign
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.checklistTitle}>
            Checklist ({checkedCount}/{checklist.length}){" "}
            <span className={styles.asterisk}>*</span>
          </label>
          <ul className={styles.checklist}>
            {checklist.map((item, index) => (
              <li key={index}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheckboxToggle(index)}
                />
                <span>{item.text}</span>
                <MdDelete
                  className={styles.delete}
                  onClick={() => handleDeleteChecklistItem(index)}
                />
              </li>
            ))}
          </ul>
          {isAddingItem && (
            <div className={styles.newChecklistItem}>
              <input
                type="text"
                placeholder="Add new checklist item"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
              />
            </div>
          )}
          <a
            className={styles.addNew}
            onClick={
              isAddingItem
                ? handleAddChecklistItem
                : () => setIsAddingItem(true)
            }
          >
            <span className={styles.plus}>+</span>{" "}
            {isAddingItem ? "Save Item" : "Add New"}
          </a>
        </div>
        <div className={styles.buttons}>
          <button
            className={styles.dueDate}
            onClick={() => setShowCalendar((prev) => !prev)}
          >
            {selectedDate
              ? selectedDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
              : "Select Due Date"}
          </button>
          {showCalendar && (
            <div className={styles.calendarOverlay}>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateSelect}
                inline
              />
            </div>
          )}
          <div className={styles.grpButton}>
            <button className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.save} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
