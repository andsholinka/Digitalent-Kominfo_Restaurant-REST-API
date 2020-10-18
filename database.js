import mongoose from 'mongoose';

const homeworksSchema = mongoose.Schema(
    {
        course: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,            
        },
        due_date: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Homework = mongoose.model('Homework', homeworksSchema);

export default Homework;