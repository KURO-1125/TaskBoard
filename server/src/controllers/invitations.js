const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
// Get all pending invitations for the current user
exports.getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({ user: req.user.userId, status: 'pending' })
      .populate('project', 'title description');
    res.json(invitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept an invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ _id: req.params.id, user: req.user.userId, status: 'pending' });
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    // Add user to project members
    const project = await Project.findById(invitation.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.members.some(member => member.user === req.user.userId)) {
      project.members.push({ user: req.user.userId, role: invitation.role });
      await project.save();
    }
    invitation.status = 'accepted';
    await Activity.create({
      user: req.user.userId,
      project: project._id.toString(),
      type: 'joined_project',
      description: `Joined project "${project.title}"`
    });
    await invitation.save();
    res.json({ message: 'Invitation accepted' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Decline an invitation
exports.declineInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findOne({ _id: req.params.id, user: req.user.userId, status: 'pending' });
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    invitation.status = 'declined';
    await invitation.save();
    await Activity.create({
      user: req.user.userId,
      project: projectId,
      type: 'task_deleted',
      description: `Deleted task "${task.title}"`
    });
    res.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 