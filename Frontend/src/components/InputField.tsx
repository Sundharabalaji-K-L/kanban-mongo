import React, { useState, useCallback } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
} from "@material-ui/core";
import axios from "axios";
import { Task } from "../models/models";

interface InputFieldProps {
    setTodos: React.Dispatch<React.SetStateAction<Task[]>>;
    owners: Array<string>;
    updateOwners: (tasks: Task[]) => void;
    handleClose: () => void;
}

const InputField: React.FC<InputFieldProps> = React.memo(
    ({ setTodos, owners, updateOwners, handleClose }) => {
        // State to manage form fields including task details and deadline
        const [taskDetails, setTaskDetails] = useState({
            todo: "",
            description: "",
            owner: "",
            deadline: "", // Added field for deadline
        });

        // Handle changes in form fields
        const handleInputChange = useCallback(
            (field: keyof typeof taskDetails) =>
                (e: React.ChangeEvent<{ value: unknown }>) => {
                    setTaskDetails((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                    }));
                },
            []
        );

        // Reset the form fields after submission
        const resetForm = useCallback(() => {
            setTaskDetails({
                todo: "",
                description: "",
                owner: "",
                deadline: "", // Reset deadline field
            });
        }, []);

        // Handle adding a new task
        const handleAdd = useCallback(async () => {
            const { todo, description, owner, deadline } = taskDetails;

            // Ensure that both task name (todo) and owner are provided
            if (todo && owner) {
                const taskData: Omit<Task, "_id"> = {
                    todo,
                    description,
                    owner,
                    status: "todo", // Default status
                    deadline, // Add the deadline
                };

                try {
                    // Send the new task data to the server
                    const response = await axios.post<Task>(
                        "http://localhost:5555/create",
                        taskData
                    );
                    const createdTask = response.data;

                    // Update tasks and owners
                    setTodos((prevTodos) => [...prevTodos, createdTask]);
                    updateOwners([createdTask]);

                    // Reset form and close the dialog
                    resetForm();
                    handleClose();
                } catch (error) {
                    console.error("Error creating task:", error);
                }
            }
        }, [taskDetails, setTodos, updateOwners, resetForm, handleClose]);

        return (
            <Dialog open={true} onClose={handleClose}>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogContent>
                    {/* Task Name */}
                    <TextField
                        label="Task"
                        value={taskDetails.todo}
                        onChange={handleInputChange("todo")}
                        fullWidth
                        style={{ marginBottom: 16 }}
                        required
                    />
                    {/* Description */}
                    <TextField
                        label="Description"
                        value={taskDetails.description}
                        onChange={handleInputChange("description")}
                        fullWidth
                        style={{ marginBottom: 16 }}
                    />
                    {/* Owner Select */}
                    <Select
                        value={taskDetails.owner}
                        onChange={handleInputChange("owner")}
                        displayEmpty
                        fullWidth
                        style={{ marginBottom: 16 }}
                        required
                    >
                        <MenuItem value="" disabled>
                            Select Owner
                        </MenuItem>
                        {owners.map((owner) => (
                            <MenuItem key={owner} value={owner}>
                                {owner}
                            </MenuItem>
                        ))}
                    </Select>
                    {/* Deadline Date Picker */}
                    <TextField
                        label="Deadline"
                        type="date"
                        value={taskDetails.deadline}
                        onChange={handleInputChange("deadline")}
                        fullWidth
                        style={{ marginBottom: 16 }}
                        InputLabelProps={{
                            shrink: true, // Ensures the label is above the input field for date
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        color="primary"
                        disabled={!taskDetails.todo || !taskDetails.owner}
                    >
                        Add Task
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
);

export default InputField;
