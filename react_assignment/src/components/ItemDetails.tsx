import React from "react";

type Person = {
  id: number;
  name: string;
  subject?: string;
  grade?: string;
};

type Props = {
  item: Person | null;
  onDelete: (id: number) => void;
};

const ItemDetails: React.FC<Props> = ({ item, onDelete }) => {

  if (!item) return <p>Select an item</p>; // Conditional Rendering

  return (
    <div>
      <h3>Details</h3>

      <p>Name: {item.name}</p>

      {item.subject && <p>Subject: {item.subject}</p>}
      {item.grade && <p>Grade: {item.grade}</p>}

      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
};

export default ItemDetails;