import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { Draggable } from "react-beautiful-dnd";
import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Select,
    Button,
    Box,
    FormControl,
    InputLabel
} from "@material-ui/core";
import { MoreVert as MoreVertIcon, Close as CloseIcon } from "@material-ui/icons";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import axios from "axios";
import { Task, User } from "../models/models";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    card: {
        margin: theme.spacing(1),
        position: "relative",
        border: "1px solid #eee",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        minWidth: 300,
    },
    cardContent: {
        padding: theme.spacing(1),
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
    menuButton: {
        position: "absolute",
        top: theme.spacing(0.5),
        right: theme.spacing(0.5),
    },
    editForm: {
        display: "flex",
        flexDirection: "column",
        height: '100%',
        position: 'relative',
    },
    formFields: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: theme.spacing(2),
        maxHeight: 'calc(100% - 100px)', // Adjust based on other content
    },
    actions: {
        marginTop: theme.spacing(2),
        display: "flex",
        justifyContent: "flex-end",
        "& > *": {
            marginLeft: theme.spacing(0.5),
        },
    },
    modalBackdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: theme.spacing(2),
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: theme.spacing(1),
        width: "100%",
        maxWidth: "500px",
        maxHeight: "90vh",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    modalBody: {
        padding: theme.spacing(2),
        overflowY: 'auto',
        maxHeight: 'calc(90vh - 120px)', // Adjust based on header and action heights
    },
    modalCloseButton: {
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
    },
    // Custom scrollbar styles
    customScrollbar: {
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    },
    descriptionField: {
        "& .MuiInputBase-root": {
            whiteSpace: "normal !important",
        },
        "& textarea": {
            lineHeight: '1.5em',
            minHeight: 'auto',
            maxHeight: '150px',
            height: 'auto',
            padding: 0,
            resize: 'vertical',
        },
    },
    textField: {
        marginBottom: theme.spacing(2),
    },
    ownerSelect: {
        marginTop: theme.spacing(2),
    },
}));

interface SingleTodoProps {
    index: number;
    todo: Task;
    owners: Array<string>;
    todos: Array<Task>;
    setTodos: React.Dispatch<React.SetStateAction<Array<Task>>>;
    users: Array<User>;
}

const SingleTodo: React.FC<SingleTodoProps> = memo(
    ({ index, todo, owners, todos, setTodos, users }) => {
        const classes = useStyles();
        const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
        const [editTodo, setEditTask] = useState<string>(todo.todo);
        const [editDescription, setEditDescription] = useState<string>(todo.description || "");
        const [editOwner, setEditOwner] = useState<string>(todo.owner);
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

        const inputRef = useRef<HTMLInputElement>(null);
        useEffect(() => {
            inputRef.current?.focus();
        }, [isEditModalOpen]);

        const getUserNameById = useCallback((id: string | null) => {
            if (!id) return "Unassigned";
            const user = users.find(user => user._id === id)
            return user ? user.name : "Unassigned";

        }, [users]);

        const handleOpenEditModal = () => {
            setIsEditModalOpen(true);
            handleMenuClose();
        };

        const handleCloseEditModal = () => {
            setIsEditModalOpen(false);
        };

        const handleEdit = async (e: React.FormEvent) => {
            e.preventDefault();

            const updatedTask = {
                ...todo,
                todo: editTodo,
                description: editDescription,
                owner: editOwner,
            };

            try {
                const response = await axios.put(
                    `http://localhost:5555/update/${todo._id}`,
                    updatedTask
                );

                const updatedData = response.data;

                setTodos((prevTodos) =>
                    prevTodos.map((t) => (t._id === todo._id ? updatedData : t))
                );

                handleCloseEditModal();
            } catch (error) {
                console.error("Error updating task:", error);
            }
        };

        const handleDelete = async () => {
            try {
                await axios.delete(`http://localhost:5555/delete/${todo._id}`);

                setTodos((prevTodos) => prevTodos.filter((t) => t._id !== todo._id));
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        };

        const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        };

        const handleMenuClose = () => {
            setAnchorEl(null);
        };

        return (
            <Draggable draggableId={todo._id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <Card className={classes.card}>
                            <CardContent className={classes.cardContent}>
                                <Typography variant="h6">{todo.todo}</Typography>
                                {/* Remove description */}
                                <Typography variant="subtitle2" color="textSecondary">
                                    Owner: {getUserNameById(todo.owner)}
                                </Typography>
                                {/* Show deadline */}
                                {todo.deadline && (
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Deadline: {new Date(todo.deadline).toLocaleDateString()}
                                    </Typography>
                                )}

                                <IconButton
                                    className={classes.menuButton}
                                    onClick={handleMenuOpen}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            handleOpenEditModal();
                                        }}
                                    >
                                        <AiFillEdit style={{ marginRight: 8 }} /> Edit
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            handleDelete();
                                            handleMenuClose();
                                        }}
                                    >
                                        <AiFillDelete style={{ marginRight: 8 }} /> Delete
                                    </MenuItem>
                                </Menu>
                            </CardContent>
                            {isEditModalOpen && (
                                <div className={classes.modalBackdrop}>
                                    <div className={`${classes.modalContent} ${classes.customScrollbar}`}>
                                        <div className={classes.modalHeader}>
                                            <Typography variant="h6">Edit Task</Typography>
                                            <IconButton
                                                className={classes.modalCloseButton}
                                                onClick={handleCloseEditModal}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </div>
                                        <div className={`${classes.modalBody} ${classes.customScrollbar}`}>
                                            <form onSubmit={handleEdit} className={classes.editForm}>
                                                <div className={classes.formFields}>
                                                    <TextField
                                                        label="Task"
                                                        value={editTodo}
                                                        onChange={(e) => setEditTask(e.target.value)}
                                                        fullWidth
                                                        inputRef={inputRef}
                                                        className={classes.textField}
                                                    />
                                                    <TextField
                                                        label="Description"
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        fullWidth
                                                        multiline
                                                        rows={5}
                                                        className={classes.descriptionField}
                                                        InputProps={{
                                                            inputComponent: "textarea",
                                                        }}
                                                    />
                                                    <FormControl fullWidth className={classes.ownerSelect}>
                                                        <InputLabel id="owner-label">Owner</InputLabel>
                                                        <Select
                                                            labelId="owner-label"
                                                            label="Owner"
                                                            value={editOwner}
                                                            onChange={(e) => setEditOwner(e.target.value as string)}
                                                        >
                                                            {users.map((user) => (
                                                                <MenuItem key={user._id} value={user._id}>
                                                                    {user.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </div>
                                                <Box className={classes.actions}>
                                                    <Button type="submit" color="primary" variant="contained">
                                                        Save
                                                    </Button>
                                                    <Button
                                                        onClick={handleCloseEditModal}
                                                        color="secondary"
                                                        variant="outlined"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </Draggable>
        );
    }
);

export default SingleTodo;