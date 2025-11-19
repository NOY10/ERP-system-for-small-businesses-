import React from "react";
import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiMenu4Line } from "react-icons/ri";
import Tooltip from "./Tooltip";
import { IoMdInformationCircleOutline } from "react-icons/io";

export function SortableItem({
  id,
  children,
  editMode,
  visible,
  visibleHR,
  onToggleVisibility,
  onToggleVisibilityHR,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      animateLayoutChanges: (args) => defaultAnimateLayoutChanges(args),
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Card Content */}
      <div>{children}</div>

      {editMode && (
        <div className="flex justify-between  items-center border p-2 bg-white -mt-1">
          {/* Drag Button */}
          <button
            {...listeners}
            {...attributes}
            className="p-2 cursor-grab"
            title="Drag this card"
          >
            <div className="flex">
              <RiMenu4Line className="text-[26px]" />
            </div>
          </button>

          {/* Show/Hide Toggle */}
          <div className="flex items-center">
            {/* For HR */}
            {/* <div className="flex items-center gap-2 h-6 mr-4">
              <input
                type="checkbox"
                checked={visibleHR}
                onChange={() => onToggleVisibilityHR(id)}
                className="h-5 w-5 mt-2.5"
              />
              <label className="text-base">HR</label>
            </div> */}

            {/* For onwer */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={visible}
                onChange={() => onToggleVisibility(id)}
                className="h-5 w-5"
              />
              {/* <label className="text-base">Owner</label> */}
            </div>
            {/* <div className="flex items-center">
              <Tooltip
                tooltip="Unticking the checkbox will hide the panel for this specific user."
                position="bottom"
              >
                <IoMdInformationCircleOutline className="text-gray-500 text-xl cursor-pointer" />
              </Tooltip>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
