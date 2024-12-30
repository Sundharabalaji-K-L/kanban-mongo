import mongoose from "mongoose";

// Define the schema for Task
const taskSchema = mongoose.Schema(
    {
        todo: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        owner: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        deadline: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Create and export the Task model
export const Task = mongoose.model("Task", taskSchema);
