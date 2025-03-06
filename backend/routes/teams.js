const Team = require('../models/Team');
const verifyToken = require('../utils/verifyToken');

const router = require('express').Router();

router.get('/', verifyToken(['Authority']), async (req, res) => {
    try {
        const teams = await Team.find()
            .select('-__v') // Exclude the `__v` field
            .populate({
                path: 'members',
                select: 'fullname email role' // Include specific fields from the User schema
            })

        return res.send(teams);
    } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
    }
});


router.post('/create', verifyToken(['Authority']), async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({
            status: 'error',
            message: 'You\'ve requested to create a new team but the request body seems to be empty. Kindly pass the team to be created using request body in application/json format',
            reasonPhrase: 'EmptyRequestBodyError'
        });
    }

    const teamData = {
        name: req.body.name,
    }
    
    try {
        await Team.create(teamData);
        return res.status(200).send({ status: "success", message: "The Team data created successfully!" });
    } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
    }
});

router.delete('/delete/:id', verifyToken(['Authority']), async (req, res) => {
    await Team.deleteOne({ _id: req.params.id });
    return res.send({ message: 'Team successfully deleted!' });
});


module.exports = router;