import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    'name': {
        type: String,
        required: true
    }
},
{
    timestamps: true
}
)


export const User = mongoose.model('users', userSchema);
