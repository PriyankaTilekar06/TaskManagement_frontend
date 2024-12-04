import React, { useState } from "react";
import AddPeoplePopup from "./addPeoplePopup/AddPeoplePopup";

function AddingMail() {
  const [members, setMembers] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const addMember = (newMember) => {
    console.log("member added");
    setMembers((prevMembers) => [...prevMembers, newMember]);
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div>
      <button onClick={togglePopup}>Add Member</button>
      {isPopupOpen && (
        <AddPeoplePopup onClose={togglePopup} addMember={addMember} />
      )}
      <ul>
        {members.map((member, index) => (
          <li key={index}>
            {member.email} ({member.initials})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddingMail;
