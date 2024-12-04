import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from "../context/userContext";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/analytics/Analytics";
import Setting from "./pages/setting/Setting";
import TaskContext, { TaskProvider } from "../context/TaskContext";
import { useContext } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { TaskDetail } from "./pages/taskDetails/TaskDetails";

axios.defaults.baseURL = "task-management-backend-one-mu.vercel.app";
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <AuthProvider>
        <ErrorBoundary>
          <TaskProvider>
            <Toaster toastOptions={{ duration: 2000 }} />
            <AppRoutes />
          </TaskProvider>
        </ErrorBoundary>
      </AuthProvider>
    </UserContextProvider>
  );
}

function AppRoutes() {
  const { tasks } = useContext(TaskContext);
  const { isAuthenticated } = useAuth;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/board" element={<Dashboard />} />
      <Route path="/analytics" element={<Analytics tasks={tasks} />} />
      <Route path="/setting" element={<Setting />} />
      <Route path="/task/:taskId" element={<TaskDetail />} />
    </Routes>
  );
}

export default App;
