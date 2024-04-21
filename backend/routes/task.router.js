const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  verifyProjectMember,
  verifyUser,
} = require('../middleware/userMiddleware');
const {
  createTask,
  deleteTask,
  updateStatus,
  assignTaskToUser,
  getTasks,
} = require('../controllers/taskControllers');
const { TASK_STATUS } = require('../constant');

router.post(
  '/create-task',
  [
    body('title', 'Task title is required').notEmpty(),
    body('projectId', 'ProjectId is required').isMongoId(),
  ],
  verifyUser,
  verifyProjectMember,
  createTask
);

router.delete('/:id', verifyUser, verifyProjectMember, deleteTask);

router.patch(
  '/update-status',
  [
    body('taskId', 'Task id is required').notEmpty(),
    body('projectId', 'Project id is required').notEmpty(),
    body('status')
      .exists({ checkNull: true }) // Check for existence and null values
      .withMessage('Status is required')
      .isIn(TASK_STATUS) // Ensure status is included in the valid array
      .withMessage(
        'Invalid status. Please choose from: ' + TASK_STATUS.join(', ')
      ), // Add this middleware here
  ],
  verifyUser,
  verifyProjectMember,
  updateStatus
);

router.patch(
  '/assign-task',
  [
    body('taskId', 'Task id is required').notEmpty(),
    body('projectId', 'Project id is required').notEmpty(),
    body('userId', 'User id is required').notEmpty(),
  ],
  verifyUser,
  verifyProjectMember,
  assignTaskToUser
);

router.get(
  '/:projectId', // Route with documented query parameters
  /**
   * Filter tasks based on optional query parameters.
   * @param {string} req.query.status - Filter by task status (optional).
   * @param {string} req.query.assignee - Filter by assignee ID (optional).
   * @param {string} req.query.title - Filter by task title (case-insensitive search, optional).
   */
  verifyUser,
  verifyProjectMember,
  getTasks
);

module.exports = router;
