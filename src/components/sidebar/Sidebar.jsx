import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import codeSandBox from "../../assets/codesandbox.png";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { HiOutlineCircleStack } from "react-icons/hi2";
import { CiSettings } from "react-icons/ci";
import { TbLogout } from "react-icons/tb";
import LogoutPopup from "../../pages/logoutPopup/LogoutPopup";

export default function Sidebar() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const navigate = useNavigate();

  const handleAnalyticsClick = () => {
    navigate("/analytics");
  };
  const handleBoardClick = () => {
    navigate("/board");
  };
  const handleSettingClick = () => {
    navigate("/setting");
  };

  const handleLogoutClick = () => {
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div
      className={`${styles.mainContent} ${
        isPopupVisible ? styles.blurBackground : ""
      }`}
    >
      <div className={styles.sidebar}>
        <div className={styles.title}>
          <img src={codeSandBox} className={styles.logo} />
          <h2 className={styles.proManage}> Pro Manage</h2>
        </div>
        <ul>
          <div className={styles.sidebarBoard} onClick={handleBoardClick}>
            <MdOutlineSpaceDashboard className={styles.icon} />
            <li className="active">Board</li>
          </div>
          <div className={styles.analytics} onClick={handleAnalyticsClick}>
            <HiOutlineCircleStack className={styles.icon} />
            <li>Analytics</li>
          </div>
          <div className={styles.setting} onClick={handleSettingClick}>
            <CiSettings className={styles.icon} />
            <li>Settings</li>
          </div>
          <div className={styles.logout} onClick={handleLogoutClick}>
            <TbLogout className={styles.icon} />
            <li>Log out</li>
          </div>
        </ul>
      </div>
      {isPopupVisible && <LogoutPopup onClose={closePopup} />}
    </div>
  );
}
