import React from "react";
import styles from "./Analytics.module.css";
import Sidebar from "../../components/sidebar/Sidebar";
import { GoDotFill } from "react-icons/go";
import PropTypes from "prop-types";

export default function Analytics({
  tasks = { backlog: [], todo: [], inProgress: [], done: [] },
}) {
  if (!tasks) {
    return <div>Loading...</div>;
  }

  const backlogCount = tasks.backlog?.length || 0;
  const todoCount = tasks.todo?.length || 0;
  const inProgressCount = tasks.inProgress?.length || 0;
  const doneCount = tasks.done?.length || 0;

  const allTasks = [
    ...(tasks.backlog || []),
    ...(tasks.todo || []),
    ...(tasks.inProgress || []),
    ...(tasks.done || []),
  ];

  const lowPriorityCount = allTasks.filter(
    (task) => task.priority === "LOW PRIORITY"
  ).length;
  const moderatePriorityCount = allTasks.filter(
    (task) => task.priority === "MODERATE PRIORITY"
  ).length;
  const highPriorityCount = allTasks.filter(
    (task) => task.priority === "HIGH PRIORITY"
  ).length;
  const dueDateCount = allTasks.filter((task) => task.dueDate).length;

  return (
    <div>
      <Sidebar />
      <div className={styles.content}>
        <h1>Analytics</h1>
        <div className={styles.cards}>
          <div className={styles.card}>
            <ul>
              <li>
                <GoDotFill className={styles.dot} aria-label="Backlog Tasks" />
                Backlog Tasks <span>{backlogCount}</span>
              </li>
              <li>
                <GoDotFill className={styles.dot} aria-label="To-do Tasks" />
                To-do Tasks <span>{todoCount}</span>
              </li>
              <li>
                <GoDotFill
                  className={styles.dot}
                  aria-label="In-Progress Tasks"
                />
                In-Progress Tasks <span>{inProgressCount}</span>
              </li>
              <li>
                <GoDotFill
                  className={styles.dot}
                  aria-label="Completed Tasks"
                />
                Completed Tasks <span>{doneCount}</span>
              </li>
            </ul>
          </div>
          <div className={styles.card}>
            <ul>
              <li>
                <GoDotFill className={styles.dot} aria-label="Low Priority" />
                Low Priority <span>{lowPriorityCount}</span>
              </li>
              <li>
                <GoDotFill
                  className={styles.dot}
                  aria-label="Moderate Priority"
                />
                Moderate Priority <span>{moderatePriorityCount}</span>
              </li>
              <li>
                <GoDotFill className={styles.dot} aria-label="High Priority" />
                High Priority <span>{highPriorityCount}</span>
              </li>
              <li>
                <GoDotFill className={styles.dot} aria-label="Due Date Tasks" />
                Due Date Tasks <span>{dueDateCount}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

Analytics.propTypes = {
  tasks: PropTypes.shape({
    backlog: PropTypes.array,
    todo: PropTypes.array,
    inProgress: PropTypes.array,
    done: PropTypes.array,
  }),
};
