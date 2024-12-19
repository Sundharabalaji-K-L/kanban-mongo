import React, { useState, useCallback } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Box,
    Typography,
    makeStyles,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import axios from "axios";
import { User } from "../models/models";


interface UsersModalProps {
    handleClose: () => void;
    users: Array<User>;
    updateUsers: (user: User) => void;
    deleteUser: (userId: string) => void;
}


const useStyles = makeStyles((theme) => ({
    modalContent: {
        backgroundColor: "#fff",
        padding: theme.spacing(3),
        borderRadius: theme.spacing(1),
        maxWidth: "80vh",
        minWidth: "80vh",
        maxHeight: "90vh",
        display: 'flex',
        flexDirection: 'column',
    },
    modalTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(2),
        paddingRight: theme.spacing(1),
        position: 'relative', // Make sure the close button stays in the top-right corner
    },
    userList: {
        padding: theme.spacing(1),
        flex: '1',
        overflowY: 'auto',
        "& > * + *": {
            marginTop: theme.spacing(1),
        },
        // Customizing the scrollbar size
        "&::-webkit-scrollbar": {
            width: '8px', // Smaller width for the scrollbar
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: '#888', // Color of the scrollbar thumb
            borderRadius: '4px',
        },
        "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: '#555', // Hover effect on the scrollbar thumb
        },
    },
    userItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #eee',
        padding: theme.spacing(1),
        "& > * + *": {
            marginLeft: theme.spacing(1),
        },
    },
    actions: {
        display: "flex",
    },
    editForm: {
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(2),
    },
    modalBackdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    deleteIcon: {
        color: '#dc3545',
    },
    closeButton: {
        position: 'absolute', // Position close button absolutely in the top-right corner
        top: 0,
        right: 0,
        padding: theme.spacing(1),
        cursor: 'pointer', // Make it clear that it's clickable
    },
}));


const UsersModal: React.FC<UsersModalProps> = React.memo(
    ({ handleClose, users, deleteUser, updateUsers }) => {
        const classes = useStyles();
        const [editUserId, setEditUserId] = useState<string | null>(null);
        const [editUserName, setEditUserName] = useState<string>("");

        const handleEditUserModalOpen = useCallback((user: User) => {
            setEditUserId(user._id);
            setEditUserName(user.name);
        }, [setEditUserName, setEditUserId]);

        const handleEditUserModalClose = useCallback(() => {
            setEditUserId(null);
            setEditUserName("");
        }, [setEditUserName, setEditUserId]);

        const handleEdit = async (e: React.FormEvent, id: string) => {
            e.preventDefault();
            try {
                const response = await axios.put<User>(
                    `http://localhost:5555/user/update/${id}`,
                    { name: editUserName }
                );
                const updatedUser = response.data;
                updateUsers(updatedUser);
                handleEditUserModalClose();
            } catch (error) {
                console.error('Error updating user', error);
            }
        };

        const handleDelete = async (id: string) => {
            try {
                await axios.delete(`http://localhost:5555/user/delete/${id}`);
                deleteUser(id);
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        };

        return (
            <Dialog open={true} onClose={handleClose} fullWidth>
                <div className={classes.modalBackdrop}>
                    <div className={classes.modalContent}>
                        <DialogTitle className={classes.modalTitle}>
                            <Typography variant="h6">Users List</Typography>
                            <IconButton onClick={handleClose} className={classes.closeButton}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent className={classes.userList}>
                            {users.map((user) => (
                                <div key={user._id} className={classes.userItem}>
                                    {editUserId === user._id ? (
                                        <form onSubmit={(e) => handleEdit(e, user._id)} className={classes.editForm}>
                                            <TextField
                                                label="User Name"
                                                value={editUserName}
                                                onChange={(e) => setEditUserName(e.target.value)}
                                                fullWidth
                                                required
                                            />
                                            <Box className={classes.actions}>
                                                <Button type="submit" color="primary">
                                                    Save
                                                </Button>
                                                <Button onClick={handleEditUserModalClose} color="secondary">
                                                    Cancel
                                                </Button>
                                            </Box>
                                        </form>
                                    ) : (
                                        <>
                                            <Typography>{user.name}</Typography>
                                            <Box className={classes.actions}>
                                                <IconButton onClick={() => handleEditUserModalOpen(user)}>
                                                    <AiFillEdit />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(user._id)}>
                                                    <AiFillDelete className={classes.deleteIcon} />
                                                </IconButton>
                                            </Box>
                                        </>
                                    )}
                                </div>
                            ))}
                        </DialogContent>
                    </div>
                </div>
            </Dialog>
        );
    }
);

export default UsersModal;
