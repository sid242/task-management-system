const Project = require('../models/Project');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { projectId, title, description, assignee } = req.body;

    const project = await Project.findById(projectId);

    const newTask = new Task({
      title,
      description,
      assignee: assignee || null, // Optional assignee
      project: projectId,
    });

    await newTask.save();

    project.tasks.push(newTask._id); // Push only the task ID
    await project.save();

    res.status(201).json({ success: true, task: newTask }); // Send created task data
  } catch (error) {
    console.error('createTask', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId } = req.body;

    const project = await Project.findById(projectId);

    await Task.findByIdAndDelete(id);

    project.tasks.pull(id); // Pull only the task ID
    await project.save();

    res
      .status(200)
      .json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.log('deleteTask', error.message);
    res.status(500).send('Internal server error');
  }
};

const getAllTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Project.findById(projectId).select('tasks').populate({
      path: 'tasks',
    });
    res.status(200).json({ success: true, result: tasks });
  } catch (error) {
    console.error('getAllTask', error.message);
    res.status(500).send('Internal server error');
  }
};

const updateStatus = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  const { taskId, status } = req.body;
  try {
    await Task.findByIdAndUpdate(taskId, { status }, { new: true });

    res
      .status(201)
      .json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('updateStatus', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const assignTaskToUser = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  const { taskId, userId } = req.body;
  try {
    await Task.findByIdAndUpdate(taskId, { assignee: userId }, { new: true });

    res
      .status(201)
      .json({ success: true, message: 'Task assigned successfully' });
  } catch (error) {
    console.error('assignTaskToUser', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, assignee, title } = req.query;

    let query = { project: projectId };

    let conditions = [];

    if (status) {
      conditions.push({ status: status });
    }

    if (assignee) {
      conditions.push({ assignee: assignee });
    }

    if (title) {
      conditions.push({ title: { $regex: new RegExp(title, 'i') } });
    }

    if (conditions.length > 0) {
      query = { ...query, $and: conditions };
    }

    // Filter tasks based on constructed query
    const tasks = await Task.find(query);

    res.status(200).json({ success: true, result: tasks });
  } catch (error) {
    console.error('filterTasks', error.message);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  createTask,
  deleteTask,
  getAllTask,
  updateStatus,
  getTasks,
  assignTaskToUser,
};
