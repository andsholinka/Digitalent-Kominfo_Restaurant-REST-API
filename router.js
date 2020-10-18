import express from 'express';
import Homework from './database.js';
const router = express.Router();

//@decs Create new homework
//@route POST /api/homework
router.post('/homework', async (req,res) => {
    try {
        const {course, title, due_date, status} = req.body;

        const homework = new Homework({
            course,
            title,
            due_date,
            status,
        });

        const createHomework = await homework.save();

        res.status(201).json(createHomework);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Database creation failed'});
    }
});

//@decs Get all homework
//@route GET /api/homework
router.get('/homework', async (req,res) => {
    const homework =  await Homework.find({});

    if(homework && homework.length !== 0) {
        res.json(homework)
    } else {
        res.status(404).json({
            message: 'Homework not found'
        });
    }
});

//@decs Get a homework
//@route GET /api/homework/:id
router.get('/homework/:id', async (req,res) => {
    const homework = await Homework.findById(req.params.id);

    if(homework) {
        res.json(homework)
    } else {
        res.status(404).json({
            message: 'Homework not found'
        });
    }
});

//@decs Update a homework
//@route PUT /api/homework/:id
router.put('/homework/:id', async (req,res) => {
    const {course, title, due_date, status} = req.body;

    const homework = await Homework.findById(req.params.id);

    if (homework) {
        homework.course = course;
        homework.title = title;
        homework.due_date = due_date;
        homework.status = status;

        const updateHomewok = await homework.save()

        res.send(updateHomewok);
    } else {
        res.status(404).json({
            message: 'Homework not found'
        })
    }
})

//@decs Delete a homework
//@route DELETE /api/homework/:id
router.delete('/homework/:id', async (req,res) => {
    const homework = await Homework.findById(req.params.id);

    if (homework) {
        await homework.remove();
        res.json({
            message: 'Data removed'
        })
    } else {
        res.status(404).json({
            message: 'Homework not found' 
        })       
    }
})

//@decs Delete all homework
//@route DELETE /api/homework
router.delete('/homework', async (req, res) => {
    const homework = await Homework.deleteMany();

    if (homework) {
        res.json({
        message: 'all homework removed'
        })
    } else {
        res.status(404).json({
        message: 'homework not found'
        })
    }
})

export default router;
