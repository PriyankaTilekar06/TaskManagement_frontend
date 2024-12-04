import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const TaskContext = createContext();

const useTaskContext = () => {
  return useContext(TaskContext);
};

const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState({
    backlog: [],
    todo: [],
    inProgress: [],
    done: [],
  });
  const [assignedAvatars, setAssignedAvatars] = useState({});
  const [dashboardData, setDashboardData] = useState([]);

  useEffect(() => {
    if (user) {
      const storedTasks =
        JSON.parse(localStorage.getItem(`tasks_${user.email}`)) || {};
      const loadedTasks = {
        backlog: storedTasks.backlog || [],
        todo: storedTasks.todo || [],
        inProgress: storedTasks.inProgress || [],
        done: storedTasks.done || [],
      };

      setTasks(loadedTasks);
    } else {
      setTasks({
        backlog: [],
        todo: [],
        inProgress: [],
        done: [],
      });
    }
  }, [user]);

  const updateLocalStorage = (updatedTasks) => {
    if (user) {
      localStorage.setItem(`tasks_${user.email}`, JSON.stringify(updatedTasks));
    }
  };

  const addTask = (task, category) => {
    if (!tasks[category]) {
      console.error(`Invalid category: ${category}`);
      return;
    }

    const updatedTasks = {
      ...tasks,
      [category]: [...tasks[category], task],
    };

    setTasks(updatedTasks);
    updateLocalStorage(updatedTasks);
  };

  const toggleChecklistItem = (taskIndex, itemIndex, category) => {
    if (!tasks[category] || !tasks[category][taskIndex]) {
      console.error(`Task not found in ${category}`);
      return;
    }
    const updatedTasks = { ...tasks };
    const task = updatedTasks[category][taskIndex];
    const checklistItem = task.checklist[itemIndex];
    checklistItem.checked = !checklistItem.checked;

    setTasks(updatedTasks);
    updateLocalStorage(updatedTasks);
  };

  const removeTask = (taskToRemove, category) => {
    if (!tasks[category]) {
      console.error(`Invalid category: ${category}`);
      return;
    }
    const updatedCategory = tasks[category].filter(
      (task) => task.id !== taskToRemove.id
    );
    const updatedTasks = {
      ...tasks,
      [category]: updatedCategory,
    };
    setTasks(updatedTasks);
    if (user) {
      localStorage.setItem(`tasks_${user.email}`, JSON.stringify(updatedTasks));
    }
  };

  const moveTask = (taskToMove, fromCategory, toCategory) => {
    console.log("moveTask called with:", {
      fromCategory,
      toCategory,
      taskToMove,
    });
    console.log("Current tasks state:", tasks);

    if (!tasks[fromCategory]) {
      console.error(`Invalid fromCategory: ${fromCategory}`);
      return;
    }
    if (!tasks[toCategory]) {
      console.error(`Invalid toCategory: ${toCategory}`);
      return;
    }

    if (!tasks[fromCategory].includes(taskToMove)) {
      console.error(`Task not found in ${fromCategory}`);
      return;
    }
    const updatedFromCategory = tasks[fromCategory].filter(
      (task) => task.id !== taskToMove.id
    );
    const updatedToCategory = [...tasks[toCategory], taskToMove];
    const updatedTasks = {
      ...tasks,
      [fromCategory]: updatedFromCategory,
      [toCategory]: updatedToCategory,
    };

    setTasks(updatedTasks);
    updateLocalStorage(updatedTasks);
  };

  const clearTasks = () => {
    setTasks({
      backlog: [],
      todo: [],
      inProgress: [],
      done: [],
    });
    if (user) {
      localStorage.removeItem(`tasks_${user.email}`);
    }
  };

  const getTaskById = (taskId) => {
    for (const category in tasks) {
      const task = tasks[category].find((task) => task.id === taskId);
      if (task) {
        return task;
      }
    }
    return null;
  };

  const [members, setMembers] = useState([]);

  const addMember = (email) => {
    setMembers((prevMembers) => [...prevMembers, email]);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        addTask,
        toggleChecklistItem,
        removeTask,
        clearTasks,
        moveTask,
        getTaskById,
        addMember,
        members,
        assignedAvatars,
        setAssignedAvatars,
        dashboardData,
        setDashboardData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export { TaskProvider, useTaskContext };
export default TaskContext;
