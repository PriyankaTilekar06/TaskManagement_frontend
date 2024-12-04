import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import groupImage from "../assets/Group.png";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    login(email, password);
    navigate("/board");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.circle}>
          <img src={groupImage} className={styles.img} alt="Group" />
        </div>
        <h2>Welcome aboard my friend</h2>
        <p>Just a couple of clicks and we start</p>
      </div>
      <div className={styles.right}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className={styles.inputContainer}>
            <MdOutlineEmail className={styles.icon} />
            <input
              type="email"
              placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Email"
              className={styles.inputField}
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <RiLockPasswordLine className={styles.icon} />
            <input
              type="password"
              placeholder="&nbsp;&nbsp;&nbsp;&nbsp; Password"
              className={styles.inputField}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Log in</button>
          <p>Have no account yet?</p>
          <button
            type="button"
            onClick={handleRegister}
            className={styles.register}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
