import express from 'express';
import { Task } from '../models/taskModel.js';
import { User } from '../models/userModel.js';

const taskRouter = express.Router();

// Get all tasks
taskRouter.get('/', async (request, response) => {
    try {
        const tasks = await Task.find({});
        return response.status(200).json({
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});

// Create a new task
taskRouter.post('/create', async (request, response) => {
    try {
        const { todo, description, owner, deadline } = request.body;

        // Check for missing required fields
        if (!todo || !description || !owner) {
            return response.status(404).send({ message: 'Required all fields' });
        }

        // Prepare task data with optional deadline field
        const newTask = {
            todo,
            description,
            owner,
            status: 'todo',
            deadline: deadline ? new Date(deadline) : null // Ensure deadline is a Date if provided
        };

        const task = await Task.create(newTask);
        return response.status(201).send(task);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});

// Update an existing task
taskRouter.put('/update/:id', async (request, response) => {
    try {
        const { todo, description, owner, deadline } = request.body;

        // Check for missing required fields
        if (!todo || !description || !owner) {
            return response.status(404).send({ message: 'Required all fields' });
        }

        const { id } = request.params;

        // Prepare updated task data with optional deadline field
        const updatedTask = {
            todo,
            description,
            owner,
            status: request.body.status || 'todo', // Default to 'todo' if no status is provided
            deadline: deadline ? new Date(deadline) : null // Ensure deadline is a Date if provided
        };

        const result = await Task.findByIdAndUpdate(id, updatedTask, { new: true });

        if (!result) {
            return response.status(404).send({ message: 'Task not found' });
        }

        return response.status(200).send({ message: 'Task has been updated', task: result });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

// Delete a task
taskRouter.delete('/delete/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Task.findByIdAndDelete(id);

        if (!result) {
            return response.status(404).send({ message: 'Task not found' });
        }
        return response.status(200).send({ message: 'Task has been deleted' });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

// Get all users
taskRouter.get('/users', async (request, response) => {
    try {
        const users = await User.find({}).sort({ name: 1 });
        return response.status(200).json({
            count: users.length,
            data: users
        });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

// Create a new user
taskRouter.post('/user/create', async (request, response) => {
    try {
        if (!request.body.name) {
            return response.status(404).send('Required name field');
        }

        const newUser = {
            name: request.body.name
        };

        const name = await User.create(newUser);
        return response.status(201).send(name);
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

// Delete a user
taskRouter.delete('/user/delete/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const result = await User.findByIdAndDelete(id);

        if (!result) {
            return response.status(404).send({ message: 'User not found' });
        }
        return response.status(200).send({ message: 'User has been deleted' });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

// Update a user
taskRouter.put('/user/update/:id', async (request, response) => {
    try {
        if (!request.body.name) {
            response.status(404).send({ message: 'Required all fields' });
        }

        const { id } = request.params;
        const result = await User.findByIdAndUpdate(id, request.body);

        if (!result) {
            return response.status(404).send({ message: 'User not found' });
        }

        return response.status(200).send({ message: 'User has been updated' });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

export default taskRouter;
