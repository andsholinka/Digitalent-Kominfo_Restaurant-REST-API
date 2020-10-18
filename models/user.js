import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,            
        },
        nbelakang: {
            type: String,
            required: true,            
        },
        jabatan: {
            type: Number,
            required: true,         
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

export default User;