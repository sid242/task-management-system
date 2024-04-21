const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const User = require('../models/User');

const verifyUser = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')?.[1];
  if (!token) {
    res.status(401).send({ error: 'Please authenticate using a valid token' });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate using a valid token' });
  }
};

const verifyProjectOwner = async (req, res, next) => {
  try {
    const projectId =
      req.params.id ||
      req.body.id ||
      req.params.projectId ||
      req.body.projectId;

    const userId = req.user.id;

    const project = await Project.findById(projectId).populate('owner'); // Populate owner details

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: 'Project not found' });
    }

    // Check if user is the project owner
    if (!project.owner._id.equals(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You are not the owner of this project',
      });
    }

    // Allowed to proceed if user is the owner
    next();
  } catch (error) {
    console.error('verifyProjectOwner', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const verifyProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const userId = req.user.id; // Assuming user ID is retrieved from middleware
    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: 'Project not found' });
    }

    const isMember = project?.members?.some(
      (member) => member._id.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You are not a member of this project',
      });
    }

    next(); // Proceed if user is a member
  } catch (error) {
    console.error('verifyProjectMember', error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { verifyUser, verifyProjectOwner, verifyProjectMember };
