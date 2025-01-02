import React, { useState, useCallback, useRef, useEffect } from "react";
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
    updateUsers: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = React.memo(
    ({ handleClose, updateUsers }) => {
        const [userName, setUserName] = useState("");
        const isMounted = useRef(true);

        const handleInputChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                if(isMounted.current){
                    setUserName(e.target.value);
                }

            },
            []
        );

        const handleAddUser = useCallback(async () => {
            if (userName) {
                try {
                    await axios.post<User>(
                        "http://localhost:5555/user/create",
                        { name: userName }
                    );
                    // Call updateUsers to update the parent's state
                    if(isMounted.current){
                        updateUsers();
                        handleClose();
                    }
                } catch (error) {
                    console.error("Error creating user:", error);
                }
            }
        }, [userName, handleClose, updateUsers]);


        useEffect(() => {
            return () => {
                isMounted.current = false
            }
        }, [])

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