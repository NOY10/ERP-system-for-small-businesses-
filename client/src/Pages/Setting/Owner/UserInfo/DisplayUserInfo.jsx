import { TextField } from "@mui/material";

function DisplayUserInfo({ isEditing, handleChange, staff }) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        "name",
        "email",
        "gender",
        "address",
        "subscription",
        "role",
        "cid",
        "dob",
      ].map((field) => (
        <div key={field} className="border rounded-lg p-4 bg-gray-50 relative">
          <label className="block text-gray-600 font-semibold capitalize">
            {field.replace("_", " ")}
          </label>
          {isEditing ? (
            field === "gender" ? (
              <select
                name="gender"
                value={staff[field] || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : field === "role" ? (
              <p className="text-gray-800">{staff[field]}</p> // Role is uneditable
            ) : field === "dob" ? (
              <TextField
                fullWidth
                name="dob"
                type="date"
                value={
                  staff[field]
                    ? new Date(staff[field]).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
                margin="dense"
              />
            ) : (
              <TextField
                fullWidth
                name={field}
                value={staff[field] || ""}
                onChange={handleChange}
                margin="dense"
              />
            )
          ) : (
            <p className="text-gray-800">
              {field === "dob" && staff[field]
                ? new Date(staff[field]).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : staff[field]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default DisplayUserInfo;
