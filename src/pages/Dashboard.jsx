import { useContext, useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { FaPlus } from "react-icons/fa6";
import { VscCollapseAll } from "react-icons/vsc";
import { GoPeople } from "react-icons/go";
import { RiArrowDropDownLine } from "react-icons/ri";
import Sidebar from "../components/sidebar/Sidebar";
import TaskPopup from "./taskPopup/TaskPopup";
import { BsThreeDots } from "react-icons/bs";
import DeletePopup from "./deletePopup/DeletePopup";
import AddPeoplePopup from "./addPeoplePopup/AddPeoplePopup";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext, useAuth } from "../../context/AuthContext";
import TaskContext, { useTaskContext } from "../../context/TaskContext";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const [isAddPeoplePopupVisible, setIsAddPeoplePopupVisible] = useState(false);
  const { tasks, setTasks, moveTask, toggleChecklistItem } =
    useContext(TaskContext);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState({
    backlog: null,
    todo: null,
    inProgress: null,
    done: null,
  });
  const [checklistVisibility, setChecklistVisibility] = useState({
    backlog: [],
    todo: [],
    inProgress: [],
    done: [],
  });

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
  }, []); //

  const [memberInitials, setMemberInitials] = useState("Add People");
  const { assignedAvatars } = useContext(TaskContext);

  const handleAddMember = (initials) => {
    setMemberInitials(initials);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await axios.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User Profile:", response.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (error.response && error.response.status === 401) {
          logout();
          navigate("/login");
        }
      }
    };

    fetchUserProfile();
  }, [logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    console.log(isAuthenticated);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setChecklistVisibility(new Array(tasks.backlog).fill(false));
  }, [tasks]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const addTask = () => {
    if (isAuthenticated && user) {
      const newTask = {
        id: Date.now(),
        content: "New Task",
      };
      setTasks((prevTasks) => ({
        ...prevTasks,
        todo: [...prevTasks.todo, newTask],
      }));
    } else {
      alert("You need to be logged in to add tasks.");
    }
  };

  useEffect(() => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const today = new Date().toLocaleDateString("en-GB", options);
    setCurrentDate(today);
  }, []);

  const closePopup = () => {
    setIsPopupVisible(false);
    setTaskToEdit(null);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedFilter(newFilter);
  };

  const handleMoveTask = (task, fromCategory, toCategory) => {
    moveTask(task, fromCategory, toCategory);
  };

  const toggleDropdown = (column, index) => {
    console.log(`Toggling dropdown for ${column} at index ${index}`);
    setActiveDropdown((prev) => ({
      ...prev,
      [column]: prev[column] === index ? null : index,
    }));
  };

  const handleOptionClick = (option, task, category) => {
    if (option === "Edit") {
      setTaskToEdit({ task, category });
      setIsPopupVisible(true);
    } else if (option === "Share") {
      handleShareClick(task.id);
    } else if (option === "Delete") {
      setTaskToDelete({ task, category });
      setIsDeletePopupVisible(true);
    }
  };

  const handleShareClick = (taskId) => {
    const shareLink = `${window.location.origin}/task/${taskId}`;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success("Copy this Link: " + shareLink);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy link");
      });
  };

  const updateTask = (updatedTask, category) => {
    setTasks((prevTasks) => {
      const updatedCategory = prevTasks[category].map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      return { ...prevTasks, [category]: updatedCategory };
    });
    setTaskToEdit(null);
    setIsPopupVisible(false);
  };

  useEffect(() => {
    setChecklistVisibility({
      backlog: new Array(tasks.backlog).fill(false),
      todo: new Array(tasks.todo).fill(false),
      inProgress: new Array(tasks.inProgress).fill(false),
      done: new Array(tasks.done).fill(false),
    });
  }, [tasks]);

  const toggleChecklist = (category, taskIndex) => {
    setChecklistVisibility((prevVisibility) => {
      const updatedVisibility = {
        ...prevVisibility,
        [category]: [...prevVisibility[category]],
      };
      updatedVisibility[category][taskIndex] =
        !updatedVisibility[category][taskIndex];
      Object.keys(updatedVisibility).forEach((key) => {
        if (key !== category) {
          updatedVisibility[key] = updatedVisibility[key].map(() => false);
        }
      });
      return updatedVisibility;
    });
  };

  const collapseAllChecklists = (category) => {
    setChecklistVisibility((prevVisibility) => ({
      ...prevVisibility,
      [category]: new Array(tasks[category].length).fill(false),
    }));
  };

  const handleDeleteTask = () => {
    setTasks((prevTasks) => ({
      ...prevTasks,
      [taskToDelete.category]: prevTasks[taskToDelete.category].filter(
        (t) => t !== taskToDelete.task
      ),
    }));
    setTaskToDelete(null);
    setIsDeletePopupVisible(false);
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
    setIsDeletePopupVisible(false);
  };

  const toggleAddPeoplePopup = () => {
    setIsAddPeoplePopupVisible((prev) => !prev);
  };

  const closeAddPeoplePopup = () => {
    setIsAddPeoplePopupVisible(false);
  };

  const formatDate = (date) => {
    const options = { month: "short", day: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString("en-US", options);
    const day = new Date(date).getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";
    return `${formattedDate.replace(/\d+/, day + suffix)}`;
  };

  const handleAddTaskClick = () => {
    setIsPopupVisible(true);
    setEditingTask(null);
  };

  const filterTasks = (tasks) => {
    const now = new Date();
    return tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      if (filter === "Today") {
        return (
          dueDate.getFullYear() === now.getFullYear() &&
          dueDate.getMonth() === now.getMonth() &&
          dueDate.getDate() === now.getDate()
        );
      } else if (filter === "This Week") {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(
          now.setDate(now.getDate() - now.getDay() + 6)
        );
        return dueDate >= startOfWeek && dueDate <= endOfWeek;
      } else if (filter === "This Month") {
        return (
          dueDate.getFullYear() === now.getFullYear() &&
          dueDate.getMonth() === now.getMonth()
        );
      }
      return true;
    });
  };

  const isPastDue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <div>
      <Sidebar />
      {isAuthenticated ? (
        <div
          className={`${styles.mainContent} ${
            isPopupVisible || isDeletePopupVisible ? styles.blurBackground : ""
          }`}
        >
          <div className={styles.header}>
            <h1>Welcome, {user ? user.name : "Guest"}!</h1>
            <div className={styles.date}>
              <div className={styles.currentDate}>{currentDate}</div>
            </div>
          </div>
          <div className={styles.boardHeader}>
            <h2>
              Board{" "}
              <span className={styles.addPeople} onClick={toggleAddPeoplePopup}>
                {" "}
                <GoPeople />
                {memberInitials}
              </span>
            </h2>
            <div className={styles.dropdown}>
              <div
                className={styles.dropbtn}
                onClick={() => toggleDropdown("this Week")}
              >
                {selectedFilter}
                <RiArrowDropDownLine className={styles.dropIcon} />
              </div>
              <div className={styles.dropdownContent}>
                <a onClick={() => handleFilterChange("Today")}>Today</a>
                <a onClick={() => handleFilterChange("This Week")}>This Week</a>
                <a onClick={() => handleFilterChange("This Month")}>
                  This Month
                </a>
              </div>
            </div>
          </div>

          <div className={styles.board}>
            <div className={styles.column}>
              <div className={styles.backlog}>
                <h2>Backlog</h2>
                <VscCollapseAll
                  className={styles.collapse}
                  onClick={() => collapseAllChecklists("backlog")}
                />
              </div>
              {Array.isArray(tasks.backlog) && tasks.backlog.length > 0 ? (
                filterTasks(tasks.backlog).map((task, taskIndex) => {
                  const truncateTitle = (title) => {
                    const words = title.split(" ");
                    return words.length > 7
                      ? words.slice(0, 7).join(" ") + "..."
                      : title;
                  };
                  return (
                    <div key={taskIndex} className={styles.container}>
                      <div className={styles.header}>
                        <div className={styles.priority}>
                          <span
                            className={styles.dot}
                            style={{
                              backgroundColor:
                                task.priority === "HIGH PRIORITY"
                                  ? "#FF2473"
                                  : task.priority === "MODERATE PRIORITY"
                                  ? "#18B0FF"
                                  : "#63C05B",
                            }}
                          ></span>
                          <span className={styles.label}>{task.priority}</span>
                        </div>
                        <div
                          style={{
                            backgroundColor: assignedAvatars[task.id]
                              ? "pink"
                              : "transparent",
                            borderRadius: "50px",
                            fontSize: "7px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "15px",
                            height: "15px",
                          }}
                        >
                          {assignedAvatars[task.id]}
                        </div>
                        <div
                          className={styles.menu}
                          onClick={() => toggleDropdown("backlog", taskIndex)}
                        >
                          <BsThreeDots />
                          {activeDropdown.backlog === taskIndex && (
                            <div className={styles.dropdownMenu}>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Edit", task, "backlog")
                                }
                              >
                                Edit
                              </div>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Share", task, "backlog")
                                }
                              >
                                Share
                              </div>
                              <div
                                className={styles.dropdownDelete}
                                onClick={() =>
                                  handleOptionClick("Delete", task, "backlog")
                                }
                              >
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.title}>
                        <span className={styles.truncateTitle}>
                          {truncateTitle(task.title)}
                        </span>
                        <span className={styles.tooltip}>{task.title}</span>
                      </div>
                      <div className={styles.checklistContainer}>
                        <div className={styles.checklist}>
                          Checklist (
                          {task.checklist.filter((c) => c.checked).length}/
                          {task.checklist.length})
                          <button
                            className={`${styles.dropdownbtn} ${
                              checklistVisibility.backlog[taskIndex]
                                ? styles.rotated
                                : ""
                            }`}
                            onClick={() =>
                              toggleChecklist("backlog", taskIndex)
                            }
                          >
                            <RiArrowDropDownLine />
                          </button>
                        </div>
                        {checklistVisibility.backlog[taskIndex] && (
                          <div className={styles.checklistItems}>
                            {task.checklist.map((item, itemIndex) => (
                              <div key={itemIndex} className={styles.task}>
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() =>
                                    toggleChecklistItem(
                                      taskIndex,
                                      itemIndex,
                                      "backlog"
                                    )
                                  }
                                />
                                <span className={styles.taskText}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.footer}>
                        <div
                          className={styles.date}
                          style={{
                            backgroundColor:
                              task.dueDate && !isNaN(new Date(task.dueDate))
                                ? isPastDue(task.dueDate)
                                  ? "red"
                                  : task.priority === "HIGH PRIORITY"
                                  ? "red"
                                  : "grey"
                                : "transparent",
                            color: task.dueDate ? "white" : "transparent",
                          }}
                        >
                          {task.dueDate
                            ? formatDate(task.dueDate)
                            : "No Due Date"}
                        </div>
                        <div className={styles.status}>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "backlog", "todo")
                            }
                          >
                            TODO
                          </div>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "backlog", "inProgress")
                            }
                          >
                            PROGRESS
                          </div>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "backlog", "done")
                            }
                          >
                            DONE
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p></p>
              )}
            </div>

            <div className={styles.column}>
              <div className={styles.todo}>
                <h2>Todo</h2>
                <FaPlus
                  className={styles.add_task}
                  onClick={handleAddTaskClick}
                />
                <VscCollapseAll
                  className={styles.collapse}
                  onClick={() => collapseAllChecklists("todo")}
                />
              </div>
              {Array.isArray(tasks.todo) && tasks.todo.length > 0 ? (
                filterTasks(tasks.todo).map((task, taskIndex) => {
                  const truncateTitle = (title) => {
                    const words = title.split(" ");
                    return words.length > 7
                      ? words.slice(0, 7).join(" ") + "..."
                      : title;
                  };
                  return (
                    <div key={taskIndex} className={styles.container}>
                      <div className={styles.header}>
                        <div className={styles.priority}>
                          <span
                            className={styles.dot}
                            style={{
                              backgroundColor:
                                task.priority === "HIGH PRIORITY"
                                  ? "#FF2473"
                                  : task.priority === "MODERATE PRIORITY"
                                  ? "#18B0FF"
                                  : "#63C05B",
                            }}
                          ></span>
                          <span className={styles.label}>{task.priority}</span>
                        </div>
                        <div
                          style={{
                            backgroundColor: assignedAvatars[task.id]
                              ? "pink"
                              : "transparent",
                            borderRadius: "50px",
                            fontSize: "7px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "15px",
                            height: "15px",
                          }}
                        >
                          {assignedAvatars[task.id] || ""}
                        </div>
                        <div
                          className={styles.menu}
                          onClick={() => toggleDropdown("todo", taskIndex)}
                        >
                          <BsThreeDots />
                          {activeDropdown.todo === taskIndex && (
                            <div className={styles.dropdownMenu}>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Edit", task, "todo")
                                }
                              >
                                Edit
                              </div>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Share", task, "todo")
                                }
                              >
                                Share
                              </div>
                              <div
                                className={styles.dropdownDelete}
                                onClick={() =>
                                  handleOptionClick("Delete", task, "todo")
                                }
                              >
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.title}>
                        <span className={styles.truncateTitle}>
                          {truncateTitle(task.title)}
                        </span>
                        <span className={styles.tooltip}>{task.title}</span>
                      </div>
                      <div className={styles.checklistContainer}>
                        <div className={styles.checklist}>
                          Checklist (
                          {task.checklist.filter((c) => c.checked).length}/
                          {task.checklist.length})
                          <button
                            className={`${styles.dropdownbtn} ${
                              checklistVisibility.todo[taskIndex]
                                ? styles.rotated
                                : ""
                            }`}
                            onClick={() => toggleChecklist("todo", taskIndex)}
                          >
                            <RiArrowDropDownLine />
                          </button>
                        </div>
                        {checklistVisibility.todo[taskIndex] && (
                          <div className={styles.checklistItems}>
                            {task.checklist.map((item, itemIndex) => (
                              <div key={itemIndex} className={styles.task}>
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() =>
                                    toggleChecklistItem(
                                      taskIndex,
                                      itemIndex,
                                      "todo"
                                    )
                                  }
                                />
                                <span className={styles.taskText}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.footer}>
                        <div
                          className={styles.date}
                          style={{
                            backgroundColor:
                              task.dueDate && !isNaN(new Date(task.dueDate))
                                ? isPastDue(task.dueDate)
                                  ? "red"
                                  : task.priority === "HIGH PRIORITY"
                                  ? "red"
                                  : "grey"
                                : "transparent",
                            color: task.dueDate ? "white" : "transparent",
                          }}
                        >
                          {task.dueDate
                            ? formatDate(task.dueDate)
                            : "No Due Date"}
                        </div>
                        <div className={styles.status}>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "todo", "backlog")
                            }
                          >
                            BACKLOG
                          </div>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "todo", "inProgress")
                            }
                          >
                            PROGRESS
                          </div>
                          <div
                            onClick={() => handleMoveTask(task, "todo", "done")}
                          >
                            DONE
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p></p>
              )}
            </div>

            <div className={styles.column}>
              <div className={styles.inProgress}>
                <h2>In progress</h2>
                <VscCollapseAll
                  className={styles.collapse}
                  onClick={() => collapseAllChecklists("inProgress")}
                />
              </div>
              {Array.isArray(tasks.inProgress) &&
              tasks.inProgress.length > 0 ? (
                filterTasks(tasks.inProgress).map((task, taskIndex) => {
                  const truncateTitle = (title) => {
                    const words = title.split(" ");
                    return words.length > 7
                      ? words.slice(0, 7).join(" ") + "..."
                      : title;
                  };
                  return (
                    <div key={taskIndex} className={styles.container}>
                      <div className={styles.header}>
                        <div className={styles.priority}>
                          <span
                            className={styles.dot}
                            style={{
                              backgroundColor:
                                task.priority === "HIGH PRIORITY"
                                  ? "#FF2473"
                                  : task.priority === "MODERATE PRIORITY"
                                  ? "#18B0FF"
                                  : "#63C05B",
                            }}
                          ></span>
                          <span className={styles.label}>{task.priority}</span>
                        </div>
                        <div
                          style={{
                            backgroundColor: assignedAvatars[task.id]
                              ? "pink"
                              : "transparent",
                            borderRadius: "50px",
                            fontSize: "7px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "15px",
                            height: "15px",
                          }}
                        >
                          {assignedAvatars[task.id] || ""}
                        </div>
                        <div
                          className={styles.menu}
                          onClick={() =>
                            toggleDropdown("inProgress", taskIndex)
                          }
                        >
                          <BsThreeDots />
                          {activeDropdown.inProgress === taskIndex && (
                            <div className={styles.dropdownMenu}>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Edit", task, "inProgress")
                                }
                              >
                                Edit
                              </div>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Share", task, "inProgress")
                                }
                              >
                                Share
                              </div>
                              <div
                                className={styles.dropdownDelete}
                                onClick={() =>
                                  handleOptionClick(
                                    "Delete",
                                    task,
                                    "inProgress"
                                  )
                                }
                              >
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.title}>
                        <span className={styles.truncateTitle}>
                          {truncateTitle(task.title)}
                        </span>
                        <span className={styles.tooltip}>{task.title}</span>
                      </div>
                      <div className={styles.checklistContainer}>
                        <div className={styles.checklist}>
                          Checklist (
                          {task.checklist.filter((c) => c.checked).length}/
                          {task.checklist.length})
                          <button
                            className={`${styles.dropdownbtn} ${
                              checklistVisibility.inProgress[taskIndex]
                                ? styles.rotated
                                : ""
                            }`}
                            onClick={() =>
                              toggleChecklist("inProgress", taskIndex)
                            }
                          >
                            <RiArrowDropDownLine />
                          </button>
                        </div>
                        {checklistVisibility.inProgress[taskIndex] && (
                          <div className={styles.checklistItems}>
                            {task.checklist.map((item, itemIndex) => (
                              <div key={itemIndex} className={styles.task}>
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() =>
                                    toggleChecklistItem(
                                      taskIndex,
                                      itemIndex,
                                      "inProgress"
                                    )
                                  }
                                />
                                <span className={styles.taskText}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.footer}>
                        <div
                          className={styles.date}
                          style={{
                            backgroundColor:
                              task.dueDate && !isNaN(new Date(task.dueDate))
                                ? isPastDue(task.dueDate)
                                  ? "red"
                                  : task.priority === "HIGH PRIORITY"
                                  ? "red"
                                  : "grey"
                                : "transparent",
                            color: task.dueDate ? "white" : "transparent",
                          }}
                        >
                          {task.dueDate
                            ? formatDate(task.dueDate)
                            : "No Due Date"}
                        </div>
                        <div className={styles.status}>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "inProgress", "backlog")
                            }
                          >
                            BACKLOG
                          </div>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "inProgress", "todo")
                            }
                          >
                            TO-DO
                          </div>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "inProgress", "done")
                            }
                          >
                            DONE
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p></p>
              )}
            </div>

            <div className={styles.column}>
              <div className={styles.done}>
                <h2>Done</h2>
                <VscCollapseAll
                  className={styles.collapse}
                  onClick={() => collapseAllChecklists("done")}
                />
              </div>
              {Array.isArray(tasks.done) && tasks.done.length > 0 ? (
                filterTasks(tasks.done).map((task, taskIndex) => {
                  const truncateTitle = (title) => {
                    const words = title.split(" ");
                    return words.length > 7
                      ? words.slice(0, 7).join(" ") + "..."
                      : title;
                  };
                  return (
                    <div key={taskIndex} className={styles.container}>
                      <div className={styles.header}>
                        <div className={styles.priority}>
                          <span
                            className={styles.dot}
                            style={{
                              backgroundColor:
                                task.priority === "HIGH PRIORITY"
                                  ? "#FF2473"
                                  : task.priority === "MODERATE PRIORITY"
                                  ? "#18B0FF"
                                  : "#63C05B",
                            }}
                          ></span>
                          <span className={styles.label}>{task.priority}</span>
                        </div>
                        <div
                          style={{
                            backgroundColor: assignedAvatars[task.id]
                              ? "pink"
                              : "transparent",
                            borderRadius: "50px",
                            fontSize: "7px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "15px",
                            height: "15px",
                          }}
                        >
                          {assignedAvatars[task.id] || ""}
                        </div>
                        <div
                          className={styles.menu}
                          onClick={() => toggleDropdown("done", taskIndex)}
                        >
                          <BsThreeDots />
                          {activeDropdown.done === taskIndex && (
                            <div className={styles.dropdownMenu}>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Edit", task, "done")
                                }
                              >
                                Edit
                              </div>
                              <div
                                className={styles.dropdownOption}
                                onClick={() =>
                                  handleOptionClick("Share", task, "done")
                                }
                              >
                                Share
                              </div>
                              <div
                                className={styles.dropdownDelete}
                                onClick={() =>
                                  handleOptionClick("Delete", task, "done")
                                }
                              >
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.title}>
                        <span className={styles.truncateTitle}>
                          {truncateTitle(task.title)}
                        </span>
                        <span className={styles.tooltip}>{task.title}</span>
                      </div>

                      <div className={styles.checklistContainer}>
                        <div className={styles.checklist}>
                          Checklist (
                          {task.checklist.filter((c) => c.checked).length}/
                          {task.checklist.length})
                          <button
                            className={`${styles.dropdownbtn} ${
                              checklistVisibility.done[taskIndex]
                                ? styles.rotated
                                : ""
                            }`}
                            onClick={() => toggleChecklist("done", taskIndex)}
                          >
                            <RiArrowDropDownLine />
                          </button>
                        </div>
                        {checklistVisibility.done[taskIndex] && (
                          <div className={styles.checklistItems}>
                            {task.checklist.map((item, itemIndex) => (
                              <div key={itemIndex} className={styles.task}>
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={() =>
                                    toggleChecklistItem(
                                      taskIndex,
                                      itemIndex,
                                      "done"
                                    )
                                  }
                                />
                                <span className={styles.taskText}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.footer}>
                        <div
                          className={styles.date}
                          style={{
                            backgroundColor:
                              task.dueDate && !isNaN(new Date(task.dueDate))
                                ? task.priority === "HIGH PRIORITY"
                                  ? "#63C05B"
                                  : task.priority === "MODERATE PRIORITY"
                                  ? "#63C05B"
                                  : task.priority === "LOW PRIORITY"
                                  ? "#63C05B"
                                  : "transparent"
                                : "transparent",
                            color: task.dueDate ? "white" : "transparent",
                          }}
                        >
                          {task.dueDate ? formatDate(task.dueDate) : ""}
                        </div>

                        <div className={styles.status}>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "done", "inProgress")
                            }
                          >
                            PROGRESS
                          </div>
                          <div
                            onClick={() => handleMoveTask(task, "done", "todo")}
                          >
                            TO-DO
                          </div>
                          <div
                            onClick={() =>
                              handleMoveTask(task, "done", "backlog")
                            }
                          >
                            BACKLOG
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p></p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <h1>Please log in</h1>
      )}
      {isPopupVisible && (
        <TaskPopup
          onSave={(task) => {
            taskToEdit
              ? updateTask(task, taskToEdit.category)
              : addTask(task, "todo");
          }}
          onClose={closePopup}
          taskToEdit={taskToEdit}
        />
      )}

      {isAddPeoplePopupVisible && (
        <AddPeoplePopup
          onClose={closeAddPeoplePopup}
          onAddMember={handleAddMember}
        />
      )}

      {isDeletePopupVisible && (
        <DeletePopup
          onDelete={handleDeleteTask}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
