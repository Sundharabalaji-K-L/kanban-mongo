import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
    'todo': {
        type: String,
        required: true
    },
    'description': {
        type: String
    },
    'owner': {
        type: String,
        required: true
    },
    'status': {
        type: String,
        required: true
    }

},
{
    timestamps: true
}
)


export const Task = mongoose.model('tasks', bookSchema);
