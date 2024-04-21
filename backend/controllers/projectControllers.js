const Project = require('../models/Project');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const createProject = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  const { projectName, members } = req.body;

  let projectMembers = [];
  if (members?.length) {
    projectMembers = [...members, req.user.id];
  } else {
    projectMembers = [req.user.id];
  }

  try {
    let project = await Project.findOne({ projectName });
    if (project) {
      return res
        .status(400)
        .json({ success, error: 'Project name must be unique' });
    }

    project = new Project({
      projectName,
      owner: req.user.id, // Assuming user ID is retrieved from middleware
      members: projectMembers, // Include provided members (optional)
    });

    if (projectMembers?.length) {
      await Promise.all(
        projectMembers?.map(async (memberId) => {
          await User.findByIdAndUpdate(memberId, {
            $push: { project: project }, // Add project ID to user's project array
          });
        })
      );
    }

    await project.save();

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

const getProjects = async (req, res) => {
  try {
    const { id } = req.user;
    const project = await User.findById(id).select('project').populate({
      path: 'project',
      select: '-tasks',
      // select: '-members -tasks',
    });
    res.send(project);
  } catch (error) {
    console.error('getProjects', error.message);
    res.status(500).send('Internal server error');
  }
};

const renameProject = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  const { id } = req.params;
  const { projectName } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ success, error: 'ProjectId is required' });
    }
    let project = await Project.findOne({ projectName });
    if (project) {
      return res
        .status(400)
        .json({ success, error: 'Project name must be unique' });
    }

    await Project.findByIdAndUpdate(id, { projectName }, { new: true });

    res
      .status(201)
      .json({ success: true, message: 'Project name updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

const addMember = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  const { id } = req.params;
  const { userId } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ success, error: 'ProjectId is required' });
    }
    if (!userId) {
      return res.status(400).json({ success, error: 'UserId is missing' });
    }

    const user = await User.findById(userId);

    await Project.findByIdAndUpdate(
      id,
      {
        $push: { members: userId },
      },
      { new: true }
    );

    user.project.push(id); // Push only the task ID
    await user.save();

    res
      .status(201)
      .json({ success: true, message: 'Member added successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

const removeMember = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  const { id } = req.params;
  const { userId } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ success, error: 'ProjectId is required' });
    }
    if (!userId) {
      return res.status(400).json({ success, error: 'UserId is missing' });
    }

    const user = await User.findById(userId);

    await Project.findByIdAndUpdate(
      id,
      {
        $pull: { members: userId },
      },
      { new: true }
    );

    user.project.pull(id); // Push only the task ID
    await user.save();

    res
      .status(201)
      .json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    await Promise.all(
      project.members.map(async (memberId) => {
        await User.findByIdAndUpdate(
          memberId,
          {
            $pull: { project: id }, // Remove project ID to user's project array
          },
          { new: true }
        );
      })
    );

    res
      .status(200)
      .json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.log('deleteProject', error.message);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  createProject,
  renameProject,
  addMember,
  removeMember,
  getProjects,
  deleteProject,
};
