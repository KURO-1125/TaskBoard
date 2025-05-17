const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('project', 'title');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};