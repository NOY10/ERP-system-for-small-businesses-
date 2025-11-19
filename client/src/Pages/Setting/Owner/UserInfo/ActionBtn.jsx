import { Button } from "@mui/material";
import { FaEdit, FaSave, FaTrash } from "react-icons/fa";
import DialogBox from "../../../../Components/Dialogbox";
import ChangePassword from "../../ChangePassword";
import { useState } from "react";

function ActionBtn({ setIsEditing, handleSave, handleDelete, isEditing }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="mt-6 flex justify-between items-center">
      <div
        onClick={() => setShowDialog(true)}
        className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors"
      >
        Change Password
      </div>
      <DialogBox
        title="Change Password"
        isVisible={showDialog}
        onClose={() => setShowDialog(false)}
      >
        <ChangePassword />
      </DialogBox>

      <div className="mt-6 flex justify-end gap-4">
        {isEditing ? (
          <>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              startIcon={<FaSave />}
            >
              Save
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            variant="contained"
            color="warning"
            startIcon={<FaEdit />}
          >
            Edit
          </Button>
        )}
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          startIcon={<FaTrash />}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}

export default ActionBtn;
