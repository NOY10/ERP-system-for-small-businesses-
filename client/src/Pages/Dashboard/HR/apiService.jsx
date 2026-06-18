import { API_BASE_URL } from "../../../config/api";
//getallEmployees
export const fetchTotalEmployees = async (token) => {
  const response = await fetch(`${API_BASE_URL}/getallEmployees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch total employees");
  return response.json();
};

//getAllDepartments
export const fetchDepts = async (token) => {
  const response = await fetch(`${API_BASE_URL}/getAllDepartments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch total employees");
  return response.json();
};

//getAllLeaves
export const fetchLeaveInfo = async (token) => {
  const response = await fetch(`${API_BASE_URL}/getAllLeaves`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch total employees");
  return response.json();
};

//getAllLeaveTypes
export const fetchLeaveTypes = async (token) => {
  const response = await fetch(`${API_BASE_URL}/getAllLeaveTypes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch total employees");
  return response.json();
};

// export const fetchLeaveInfo = async () => {
//   const response = await fetch("/api/leave-info");
//   if (!response.ok) throw new Error("Failed to fetch leave info");
//   return response.json();
// };

export const fetchSalaryReport = async () => {
  const response = await fetch("/api/salary-report");
  if (!response.ok) throw new Error("Failed to fetch salary report");
  return response.json();
};

export const fetchEmployeesPerDept = async () => {
  const response = await fetch("/api/employees-per-department");
  if (!response.ok) throw new Error("Failed to fetch employees per department");
  return response.json();
};

export const fetchLeaveTakenToday = async () => {
  const response = await fetch("/api/leave-today");
  if (!response.ok) throw new Error("Failed to fetch leave taken today");
  return response.json();
};
