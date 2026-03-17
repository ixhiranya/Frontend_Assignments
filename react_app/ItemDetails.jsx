import React from "react";

function ItemDetails({ item, onDelete }) {
  if (!item) return <p>Select an item</p>;

  return (
    <div>
      <h3>Details</h3>
      <p>Name: {item.name}</p>

      {item.subject && <p>Subject: {item.subject}</p>}
      {item.grade && <p>Grade: {item.grade}</p>}

      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
}

export default ItemDetails;