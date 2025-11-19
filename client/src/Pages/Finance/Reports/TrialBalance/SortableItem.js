import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ id, label }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    cursor: "grab",
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span style={{ marginRight: "8px" }}>&#9776;</span> {label}
    </li>
  );
};

export default SortableItem;
