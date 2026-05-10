import Activity from '../models/Activity.js';
import asyncHandler from 'express-async-handler';

// @desc    Get recent activities
// @route   GET /api/activities
// @access  Private
export const getActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({})
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);
    
  res.json(activities);
});
