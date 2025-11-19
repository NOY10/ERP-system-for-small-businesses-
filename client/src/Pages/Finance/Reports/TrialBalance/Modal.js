import React from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

const Modal = ({
  columns,
  isModalVisible,
  onDragEnd,
  onApplyChanges,
  onCancel,
}) => {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    isModalVisible && (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 relative">
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h3 className="text-lg font-semibold">Drag to reorder columns</h3>
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <SortableContext
              items={columns.map((col) => col.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="list-none p-0">
                {columns.map((col) => (
                  <SortableItem key={col.id} id={col.id} label={col.label} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onApplyChanges}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Apply
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
