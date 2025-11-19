import React, { useEffect, useMemo, useReducer, useState } from "react";
import DashboardCards from "./DashboardCards";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "../../../Components/SortableItem";
import {
  TotalEmployee,
  LeaveInfo,
  SalaryR,
  EmployeeDept,
  LeaveT,
  TodayELeave,
} from ".";
import Toast from "../../../Components/Toast";

import {
  fetchTotalEmployees,
  fetchDepts,
  fetchLeaveInfo,
  fetchLeaveTypes,
} from "./apiService";
import useAuthStore from "../../../store/useAuthStore";

const apiDataReducer = (state, action) => {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, [action.key]: action.data };
    case "SET_ERROR":
      return { ...state, [action.key]: { error: action.error } };
    default:
      return state;
  }
};

const initialCards = [
  {
    id: "TotalEmployee",
    visible: true,
    visibleHR: true,
    position: 0,
  },
  {
    id: "LeaveInfo",
    visible: true,
    visibleHR: true,
    position: 1,
  },
  {
    id: "EmployeeDept",
    visible: true,
    visibleHR: true,
    position: 2,
  },
  {
    id: "LeaveT",
    visible: true,
    visibleHR: true,
    position: 3,
  },
  {
    id: "TodayELeave",
    visible: true,
    visibleHR: true,
    position: 4,
  },
  {
    id: "SalaryR",
    visible: true,
    visibleHR: true,
    position: 5,
  },
];
const componentMap = {
  TotalEmployee: TotalEmployee,
  LeaveInfo: LeaveInfo,
  EmployeeDept: EmployeeDept,
  LeaveT: LeaveT,
  TodayELeave: TodayELeave,
  SalaryR: SalaryR,
};

function HrDashboard() {
  const [cards, setCards] = useState(initialCards);
  const [editMode, setEditMode] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [showToastS, setShowToastS] = useState(false);
  const [showToastR, setShowToastR] = useState(false);
  const [apiData, dispatch] = useReducer(apiDataReducer, {});
  const [totalEmployee, setTotalEmployee] = useState("");
  const [totalDept, setTotalDept] = useState("");
  const [onLeave, setOnLeave] = useState("");

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesRes, deptRes, leaveInfoRes, leaveTypesRes, salaryRes] =
          await Promise.all([
            fetchTotalEmployees(token),
            fetchDepts(token),
            fetchLeaveInfo(token),
            fetchLeaveTypes(token),
            // fetchSalaryReport(),
            // fetchEmployeesPerDept(),

            // fetchLeaveTakenToday(),
          ]);

        dispatch({
          type: "SET_DATA",
          key: "TotalEmployee",
          data: employeesRes.employees,
        });
        dispatch({
          type: "SET_DATA",
          key: "EmployeeDept",
          data: [deptRes.departments, employeesRes.employees],
        });
        dispatch({
          type: "SET_DATA",
          key: "LeaveInfo",
          data: leaveInfoRes.leaves,
        });
        dispatch({
          type: "SET_DATA",
          key: "LeaveT",
          data: [leaveInfoRes.leaves, leaveTypesRes.leaveTypes],
        });
        dispatch({
          type: "SET_DATA",
          key: "TodayELeave",
          data: leaveInfoRes.leaves,
        });
        // dispatch({ type: "SET_DATA", key: "SalaryReportCard", data: salaryRes });

        setTotalEmployee(employeesRes.employees.length);
        setTotalDept(deptRes.departments.length);
        setOnLeave(leaveInfoRes.leaves);
      } catch (error) {
        console.error("API Error:", error);
        dispatch({ type: "SET_ERROR", key: "Error", error: error.message });
      }
    };

    fetchData();
  }, [token]);

  const sortedVisibleCards = useMemo(
    () =>
      cards
        .filter((card) => card.visible)
        .sort((a, b) => a.position - b.position),
    [cards]
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const oldIndex = cards.findIndex((card) => card.id === active.id);
    const newIndex = cards.findIndex((card) => card.id === over.id);

    if (oldIndex !== newIndex) {
      const updatedCards = arrayMove(cards, oldIndex, newIndex);

      setCards(
        updatedCards.map((card, index) => ({
          ...card,
          position: index, // Update position based on the new order
        }))
      );
    }
  };

  const toggleVisibility = (id) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, visible: !card.visible } : card
      )
    );
  };

  const toggleVisibilityHR = (id) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? { ...card, visibleACC: !card.visibleACC } // Toggle between true and false
          : card
      )
    );
  };

  const saveLayout = () => {
    const layout = cards.map((card) => ({
      id: card.id,
      position: card.position,
      visible: card.visible,
      visibleACC: card.visibleACC,
    }));

    const jsonLayout = JSON.stringify(layout);
    localStorage.setItem("dashboardLayoutHR", jsonLayout);
    setShowToastS(true);
    setTimeout(() => {
      setShowToastS(false);
    }, 2000);
  };

  const loadLayout = () => {
    try {
      const savedLayout = localStorage.getItem("dashboardLayoutHR");
      if (savedLayout) {
        const layout = JSON.parse(savedLayout);
        setCards(
          layout.map((item) => ({
            ...item,
            component: initialCards.find((card) => card.id === item.id)
              ?.component || <div>Component not found</div>,
          }))
        );
      } else {
        setCards(initialCards); // Fallback to initialCards if nothing saved
      }
    } catch (error) {
      console.error("Failed to load layout:", error);
      setCards(initialCards);
    }
  };

  const resetLayout = () => {
    setCards(initialCards);
    localStorage.setItem("dashboardLayoutHR", JSON.stringify(initialCards));
    setShowToastR(true);
    setTimeout(() => {
      setShowToastR(false);
    }, 2000);
  };

  const handleCancel = () => {
    setEditMode(false);
    loadLayout(); // Load the layout saved in localStorage (if any) when "Cancel" is clicked.
  };

  useEffect(() => {
    loadLayout(); // Load saved layout on mount
  }, []);

  return (
    <>
      <div className="flex gap-4 justify-end">
        {editMode && (
          <div className="flex flex-wrap justify-end gap-x-2  md:-mt-[52px]">
            <div className="mb-2 md:mb-4">
              <button
                onClick={saveLayout}
                className="p-2 border border-primary text-primary hover:bg-[#F5F5F5] rounded"
              >
                <p className="text-sm">Save</p>
              </button>
            </div>

            {/* Reset Layout Button */}
            <div className="mb-4">
              <button
                onClick={resetLayout}
                className="p-2  border border-primary text-primary hover:bg-[#F5F5F5] rounded w-full sm:w-auto"
              >
                <p className="text-sm">Reset Layout</p>
              </button>
            </div>
            {/* Cancel Button */}
            <div className="mb-4">
              <button
                onClick={handleCancel}
                className="p-2 border border-primary text-primary hover:bg-[#F5F5F5] rounded w-full sm:w-auto"
              >
                <p className="text-sm">Cancel</p>
              </button>
            </div>
          </div>
        )}
        <div className="mb-4 md:-mt-[52px]">
          {!editMode && (
            <button
              onClick={() => setEditMode((prev) => !prev)}
              className="p-2 rounded w-full sm:w-auto border border-primary text-primary hover:bg-[#F5F5F5] "
            >
              <p className="text-sm">Edit Dashboard</p>
            </button>
          )}
        </div>
      </div>
      {/* Visibility Controls */}
      {editMode && (
        <div className="text-primary">
          <div>
            <p>Visibility Controls</p>
          </div>
          <div className="mb-4 grid grid-cols-2 sm:flex sm:flex-row gap-4">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={card.visible}
                  onChange={() => toggleVisibility(card.id)}
                  className="h-5 w-5"
                />
                <label className="text-sm">
                  {card.id.replace(/([A-Z])/g, " $1")}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <DashboardCards
        totalEmployee={totalEmployee}
        totalDept={totalDept}
        onLeave={onLeave}
      />

      {/* {activePage === "Default Dashboard" && "Welcome to the Default Dashboard"}
      {activePage === "HR Dashboard" && "This is the HR Dashboard"}
      {activePage === "ACC Dashboard" && "This is the ACC Dashboard"} */}
      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedVisibleCards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Column */}
            <div className="flex-1">
              <div className="flex flex-col gap-4">
                {sortedVisibleCards
                  .filter((_, index) => index % 2 === 0) // Left column filtering
                  .map((card) => {
                    const Component = componentMap[card.id];
                    return Component ? (
                      <SortableItem
                        key={card.id}
                        id={card.id}
                        visible={card.visible}
                        visibleACC={card.visibleACC}
                        editMode={editMode}
                        onToggleVisibility={toggleVisibility}
                        onToggleVisibilityACC={toggleVisibilityHR}
                      >
                        <Component data={apiData[card.id]} />
                      </SortableItem>
                    ) : null;
                  })}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1">
              <div className="flex flex-col gap-4">
                {sortedVisibleCards
                  .filter((_, index) => index % 2 !== 0) // Right column filtering
                  .map((card) => {
                    const Component = componentMap[card.id];
                    return Component ? (
                      <SortableItem
                        key={card.id}
                        id={card.id}
                        visible={card.visible}
                        visibleACC={card.visibleACC}
                        editMode={editMode}
                        onToggleVisibility={toggleVisibility}
                        onToggleVisibilityACC={toggleVisibilityHR}
                      >
                        <Component data={apiData[card.id]} />
                      </SortableItem>
                    ) : null;
                  })}
              </div>
            </div>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && componentMap[activeId]
            ? React.createElement(componentMap[activeId])
            : null}
        </DragOverlay>
      </DndContext>
      <>
        {showToastS && (
          <Toast
            type="success"
            title="Layout saved!"
            message="Layout saved!"
            duration={2000}
            onClose={() => setShowToastS(false)}
          />
        )}
        {showToastR && (
          <Toast
            type="success"
            title="Layout reset!"
            message="Layout reset to initial state"
            duration={2000}
            onClose={() => setShowToastS(false)}
          />
        )}
      </>
    </>
  );
}

export default HrDashboard;
