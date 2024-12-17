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
import { MoreVert as MoreVertIcon } from "@material-ui/icons";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import axios from "axios";
import { Task } from "../models/models";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(1),
    position: "relative",
    border: "1px solid #eee",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  cardContent: {
    padding: theme.spacing(1),
  },
  menuButton: {
    position: "absolute",
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    "& > *": {
      marginBottom: theme.spacing(1),
    },
  },
  actions: {
    marginTop: theme.spacing(1),
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
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    maxWidth: "90%",
    maxHeight: "80vh",
    overflowY: "auto",
    width: "1039px",
  },
  modalTitle: {
    marginBottom: theme.spacing(2),
  },
  saveButton: {
    backgroundColor: "#000",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#000",
    },
  },
  descriptionField: {
    "& .MuiInputBase-root": {
      whiteSpace: "normal !important",
      maxHeight: "200px",
      overflowY: "auto",
    },
    "& textarea": {
      lineHeight: "1.5em",
    },
  },
}));

interface SingleTodoProps {
  index: number;
  todo: Task;
  owners: Array<string>;
  todos: Array<Task>;
  setTodos: React.Dispatch<React.SetStateAction<Array<Task>>>;
}

const SingleTodo: React.FC<SingleTodoProps> = memo(
  ({ index, todo, owners, todos, setTodos }) => {
    const classes = useStyles();
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editTodo, setEditTask] = useState<string>(todo.todo);
    const [editDescription, setEditDescription] = useState<string>(
      todo.description || ""
    );
    const [editOwner, setEditOwner] = useState<string>(todo.owner);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      inputRef.current?.focus();
    }, [isEditModalOpen]);

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
                <Typography variant="subtitle2">
                  Description: {todo.description}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Owner: {todo.owner}
                </Typography>

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
            </Card>
            {isEditModalOpen && (
              <div className={classes.modalBackdrop}>
                <div className={classes.modalContent}>
                  <Typography variant="h6" className={classes.modalTitle}>
                    Edit Task
                  </Typography>
                  <form onSubmit={handleEdit} className={classes.editForm}>
                    <TextField
                      label="Task"
                      value={editTodo}
                      onChange={(e) => setEditTask(e.target.value)}
                      fullWidth
                      inputRef={inputRef}
                    />
                    <TextField
                      label="Description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      className={classes.descriptionField}
                      InputProps={{
                        inputComponent: "textarea",
                      }}
                    />
                    <FormControl fullWidth>
                      <InputLabel id="owner-label">Owner</InputLabel>
                      <Select
                        labelId="owner-label"
                        label="Owner"
                        value={editOwner}
                        onChange={(e) => setEditOwner(e.target.value as string)}
                       
                      >
                        {owners.map((owner) => (
                          <MenuItem key={owner} value={owner}>
                            {owner}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box className={classes.actions}>
                      <Button type="submit" className={classes.saveButton}>
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
            )}
          </div>
        )}
      </Draggable>
    );
  }
);

export default SingleTodo;