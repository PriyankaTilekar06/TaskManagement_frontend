import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TaskContext from "../../../context/TaskContext";
import styles from "./TaskDetails.module.css";
import codeSandBox from "../../assets/codesandbox.png";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate.replace(
    /(\d+)/,
    (match) => `${match}${getOrdinalSuffix(match)}`
  );
};

const getOrdinalSuffix = (n) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod = n % 100;
  return suffixes[(mod - 20) % 10] || suffixes[mod] || suffixes[0];
};

export const TaskDetail = () => {
  const { taskId } = useParams();
  const { tasks } = useContext(TaskContext);
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const findTaskById = (id) => {
    const allTasks = [
      ...tasks.backlog,
      ...tasks.todo,
      ...tasks.inProgress,
      ...tasks.done,
    ];
    console.log("All tasks:", allTasks);
    return allTasks.find((task) => task.id === Number(id));
  };

  useEffect(() => {
    console.log("Task ID from URL:", taskId);
    const fetchedTask = findTaskById(taskId);
    if (fetchedTask) {
      setTask(fetchedTask);
    } else {
      console.error("Task not found");
    }
  }, [taskId, tasks]);

  if (!task) return <p>Loading...</p>;

  return (
    <div>
      <div className={styles.taskDetails}>
        <div className={styles.logo}>
          <img src={codeSandBox} className={styles.logo} />
          <h2 className={styles.proManage}> Pro Manage</h2>
        </div>
        <div className={styles.container}>
          <div className={styles.priority}>
            <span className={styles.dot}></span>
            <span>{task.priority}</span>
          </div>

          <div className={styles.header}>
            <h1 className={styles.taskTitle}>{task.title}</h1>
          </div>

          <div className={styles.checklist}>
            <strong>
              Checklist ({task.checklist.filter((c) => c.checked).length}/
              {task.checklist.length})
            </strong>
            {task.checklist.map((item, index) => (
              <div key={index} className={styles.task}>
                <input type="checkbox" checked={item.checked} readOnly />
                {item.text}
              </div>
            ))}
          </div>

          {task.due_Date && (
            <div className={styles.due_Date}>
              <span>Due Date</span>{" "}
              <div className={styles.date}>
                {task.due_Date ? formatDate(task.due_Date) : "No Due Date"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
