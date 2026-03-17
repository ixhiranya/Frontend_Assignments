import React from "react";
import "./UserProfileCard.css";

function UserProfileCard({ name, role, status }) {
  return (
    <div className={`card ${status === "active" ? "active" : "inactive"}`}>
      <h2>{name}</h2>
      <p>{role}</p>
      <span className="status">{status}</span>
    </div>
  );
}

export default UserProfileCard;