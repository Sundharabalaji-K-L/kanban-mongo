import React, { useState, useCallback } from "react";
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Select, 
  MenuItem 
} from "@material-ui/core";
import axios from "axios";
import { Task } from "../models/models";

interface InputFieldProps {
  setTodos: React.Dispatch<React.SetStateAction<Task[]>>;
  owners: Array<string>;
  updateOwners: (tasks: Task[]) => void;
  handleClose: () => void;
  
}

const InputField: React.FC<InputFieldProps> = React.memo(({
  setTodos,
  owners,
  updateOwners,
  handleClose
}) => {
  const [taskDetails, setTaskDetails] = useState({
    todo: '',
    description: '',
    owner: ''
  });

  const handleInputChange = useCallback((field: keyof typeof taskDetails) => 
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setTaskDetails(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    }, 
  []);

  const resetForm = useCallback(() => {
    setTaskDetails({
      todo: '',
      description: '',
      owner: ''
    });
  }, []);

  const handleAdd = useCallback(async () => {
    const { todo, description, owner } = taskDetails;

    if (todo && owner) {
      const taskData: Omit<Task, '_id'> = { 
        todo, 
        description, 
        owner, 
        status: "todo" 
      };

      try {
        const response = await axios.post<Task>("http://localhost:5555/create", taskData);
        const createdTask = response.data;

        // Update tasks and owners
        setTodos(prevTodos => [...prevTodos, createdTask]);
        updateOwners([createdTask]);

        // Reset form and close dialog
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
          <TextField
            label="Task"
            value={taskDetails.todo}
            onChange={handleInputChange('todo')}
            fullWidth
            style={{ marginBottom: 16 }}
            required
          />
          <TextField
            label="Description"
            value={taskDetails.description}
            onChange={handleInputChange('description')}
            fullWidth
            style={{ marginBottom: 16 }}
          />
          <Select
            value={taskDetails.owner}
            onChange={handleInputChange('owner')}
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
});

export default InputField;