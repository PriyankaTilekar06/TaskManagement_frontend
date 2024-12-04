import React, { useState } from "react";
import styles from "./Register.module.css";
import groupImage from "../assets/Group.png";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [data, setData] = useState({
    name: "",
    email: "",
    confirmPassword: "",
    password: "",
  });

  const registerUser = async (e) => {
    e.preventDefault();
    const { name, email, confirmPassword, password } = data;

    try {
      const response = await axios.post("/register", {
        name,
        email,
        confirmPassword,
        password,
      });

      console.log("Registration Response:", response.data);

      if (response.data.error) {
        toast.error(response.data.error);
        console.error("Server Error:", response.data.error);
      } else {
        const { token, user } = response.data;

        if (token) {
          localStorage.setItem("token", token);
          login({ token, user });
          toast.success("Registration successful");
          navigate("/board");
        } else {
          toast.success("Registration successful.");
          navigate("/login");
        }
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.error || "Registration failed. Please try again."
      );
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.circle}>
          <img src={groupImage} className={styles.img} />
        </div>
        <h2>Welcome aboard my friend</h2>
        <p>just a couple of clicks and we start</p>
      </div>
      <div className={styles.right}>
        <h1>Register</h1>
        <form onSubmit={registerUser}>
          <div className={styles.inputContainer}>
            <CiUser className={styles.icon} />
            <input
              type="text"
              placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Name"
              className={styles.inputField}
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <div className={styles.inputContainer}>
            <MdOutlineEmail className={styles.icon} />
            <input
              type="text"
              placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Email"
              className={styles.inputField}
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>
          <div className={styles.inputContainer}>
            <RiLockPasswordLine className={styles.icon} />
            <input
              type="text"
              placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Confirm Password"
              className={styles.inputField}
              value={data.confirmPassword}
              onChange={(e) =>
                setData({ ...data, confirmPassword: e.target.value })
              }
            />
          </div>
          <div className={styles.inputContainer}>
            <RiLockPasswordLine className={styles.icon} />
            <input
              type="text"
              placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Password"
              className={styles.inputField}
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>
          <button type="submit">Register</button>
          <p>Have an account?</p>
          <button type="button" className={styles.login} onClick={handleLogin}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
