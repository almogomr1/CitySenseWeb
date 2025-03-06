const express = require('express');
const Issue = require('../models/Issue');
const router = express.Router();

// Endpoint to fetch analytics data
router.get('/authority', async (req, res) => {
    try {
        const { startDate, endDate, location, category } = req.query;

        const matchFilters = {};
        if (startDate || endDate) {
            matchFilters.createdAt = {};
            if (startDate) matchFilters.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilters.createdAt.$lte = new Date(endDate);
        }
        if (location) matchFilters.address = { $regex: location, $options: 'i' };
        if (category) matchFilters.category = category;

        const totalIssues = await Issue.countDocuments(matchFilters);
        const resolvedIssuesThisMonth = await Issue.countDocuments({
            ...matchFilters,
            status: 'Resolved',
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
        });

        const avgResolutionTime = await Issue.aggregate([
            { $match: { ...matchFilters, status: 'Resolved' } },
            {
                $project: {
                    resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] },
                },
            },
            { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } },
        ]);

        const issuesByCategory = await Issue.aggregate([
            { $match: matchFilters },
            { $group: { _id: '$category', count: { $sum: 1 } } },
        ]);

        const response = {
            totalIssues,
            resolvedIssuesThisMonth,
            avgResolutionTime: avgResolutionTime[0]?.avgTime || 0,
            issuesByCategory,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics data.' });
    }
});

module.exports = router;