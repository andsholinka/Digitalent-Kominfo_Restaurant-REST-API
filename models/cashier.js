import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
    {
        jtransaksi: {
            type: String,
            required: true,            
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('Cashier', userSchema);

export default User;