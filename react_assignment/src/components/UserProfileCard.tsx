import React from "react";
import "./UserProfileCard.css";

type UserProfileCardProps={
    name:string;
    role:string;
    status:"active"|"inactive";
}

const UserProfileCard:React.FC<UserProfileCardProps>=({name,role,status})=>{
    return(
        <div className={`card ${status}`}>
      <h2>{name}</h2>
      <p>{role}</p>
      <span className="status">{status}</span>
    </div>
    );
};
export default UserProfileCard;