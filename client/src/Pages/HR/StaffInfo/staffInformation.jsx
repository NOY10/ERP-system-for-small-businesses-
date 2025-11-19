import { useEffect, useState } from "react";
import { FaEllipsisV, FaPencilAlt, FaTrash } from "react-icons/fa";
import { SlidingCubeLoader } from "react-loaders-kit";
import { useNavigate } from "react-router-dom";
import Toast from "../../../Components/Toast";
import useAuthStore from "../../../store/useAuthStore";
import ListEmployee from "./listEmployee";
const pastelColors = [
  "#f07167",
  "#335c67",
  "#7f5539",
  "#f28482",
  "#f5cac3",
  "#6b705c",
  "#cb997e",
  "#9d6b53",
  "#c9cba3",
  "#eae0d5",
  "#b392ac",
  "#735d78",
  "#e27396",
  "#f29559",
  "#acd8aa",
];

const getRandomColor = (() => {
  const colorMap = new Map();
  return (id) => {
    if (!colorMap.has(id)) {
      colorMap.set(
        id,
        pastelColors[Math.floor(Math.random() * pastelColors.length)]
      );
    }
    return colorMap.get(id);
  };
})();

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const EmployeeCard = ({ employee, isSelected, onSelect }) => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [showOptions, setShowOptions] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);

  console.log("employee?.profileImage", employee);
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/deleteEmployee/${employee.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setShowToast(true);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setError("Failed to delete employee");
      }
    } catch (error) {
      setError("Error deleting employee");
    }
  };
  return (
    <div
      className={`p-5 border ${
        isSelected ? "bg-blue-50 border-blue-500" : "border-gray-200"
      }
    bg-white shadow-xs hover:shadow-md transition-all duration-200 h-40 w-96 flex items-center
    cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-blue-500`}
      onClick={() => onSelect(employee.id)}
      tabIndex={0}
    >
      {showToast && (
        <Toast
          type="success"
          title="Employee Deleted Successfully!"
          message="The employee was removed from the system."
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      {error && (
        <Toast type="error" message={error} onClose={() => setError(null)} />
      )}

      <div
        className="w-20 h-20 flex items-center justify-center border-2 border-white rounded-full
      transform hover:scale-150 transition-transform duration-200 z-10 overflow-hidden"
        style={{ backgroundColor: getRandomColor(employee.id) }}
      >
        {employee?.profileImage ? (
          <>
            <img
              src={`${employee?.profileImage}?v=${new Date().getTime()}`}
              alt="Profile"
              className="w-20 h-20 object-cover"
            />
          </>
        ) : (
          <span className="font-bold text-white text-sm uppercase">
            {getInitials(employee.name)}
          </span>
        )}
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-semibold text-gray-900 text-lg">
          {employee.name} <span className="text-gray-500">({employee.id})</span>
        </h3>
        <p className="text-xs text-gray-500">{employee.email}</p>
        <p className="text-sm text-gray-600 mt-1">
          {employee.role}{" "}
          <span className="text-gray-500">({employee.department})</span>
        </p>
      </div>

      {/* Options button in the top-right corner */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
          className="p-2 text-lg"
        >
          <FaEllipsisV className="text-gray-500 hover:text-gray-700" />
        </button>

        {/* Dropdown menu */}
        {showOptions && (
          <div className="absolute right-0 top-full mt-2 bg-white shadow-lg border rounded-md w-40 text-base z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/staff/${employee.id}`);
              }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 w-full"
            >
              <FaPencilAlt className="text-blue-500" /> Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-red-100 w-full text-red-600"
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeeGrid = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isListView, setIsListView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const { token } = useAuthStore();
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:8000/getallEmployees", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const formattedEmployees = data.employees.map((emp) => ({
            id: emp.employeeId,
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            role: emp.role,
            dob: emp.dob,
            cid: emp.cid,
            department: emp.department,
            salary: emp.salary,
            profileImage: emp.profileImage,
            initials: getInitials(emp.name),
          }));

          setEmployees(formattedEmployees);
        } else {
          console.error("Failed to fetch employees:", data.error);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [token]);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.id.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Staff Directory
            </h1>
            <span className="text-gray-500 text-sm">
              ({filteredEmployees.length} employees)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => setIsListView(true)}
                className={`p-2 rounded-md ${
                  isListView ? "bg-white shadow-sm" : "hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsListView(false)}
                className={`p-2 rounded-md ${
                  !isListView ? "bg-white shadow-sm" : "hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={() => navigate("/StaffInfo/addnewStaff")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <SlidingCubeLoader
            loading={true}
            size={50}
            color="rgba(74, 144, 226, 1)"
          />
        </div>
      ) : isListView ? (
        <ListEmployee employees={filteredEmployees} />
      ) : (
        // In the EmployeeGrid component's return statement, update the EmployeeCard rendering:
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              isSelected={selectedEmployee === employee.id}
              onSelect={(id) => {
                setSelectedEmployee(id);
                navigate(`/staff/${id}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeGrid;
