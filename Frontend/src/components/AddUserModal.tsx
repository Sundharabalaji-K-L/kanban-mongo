import React, { useState, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import axios from "axios";
import { User } from "../models/models";

interface AddUserModalProps {
  handleClose: () => void;
  updateUsers: (user: User) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = React.memo(
  ({ handleClose, updateUsers }) => {
    const [userName, setUserName] = useState("");

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
      },
      []
    );

    const handleAddUser = useCallback(async () => {
      if (userName) {
        try {
          const response = await axios.post<User>(
            "http://localhost:5555/user/create",
            { name: userName }
          );
          const createdUser = response.data;
          updateUsers(createdUser);
          handleClose();
          setUserName("");
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    }, [userName, handleClose, updateUsers]);

    return (
      <Dialog open={true} onClose={handleClose}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            label="User Name"
            value={userName}
            onChange={handleInputChange}
            fullWidth
            style={{ marginBottom: 16 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAddUser}
            color="primary"
            disabled={!userName}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default AddUserModal;