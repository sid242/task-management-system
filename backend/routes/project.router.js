const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  verifyUser,
  verifyProjectMember,
  verifyProjectOwner,
} = require('../middleware/userMiddleware');
const {
  createProject,
  renameProject,
  addMember,
  getProjects,
  deleteProject,
  removeMember,
} = require('../controllers/projectControllers');

router.post(
  '/create-project',
  [
    body(
      'projectName',
      'Minimum 3 characters required in project name'
    ).isLength({ min: 3 }),
  ],
  verifyUser,
  createProject
);

router.get('/', verifyUser, getProjects);

router.patch(
  '/rename-project/:id',
  [
    body(
      'projectName',
      'Minimum 3 characters required in project name'
    ).isLength({ min: 3 }),
  ],
  verifyUser,
  verifyProjectOwner,
  renameProject
);

router.patch('/add-member/:id', verifyUser, verifyProjectOwner, addMember);
router.patch(
  '/remove-member/:id',
  verifyUser,
  verifyProjectOwner,
  removeMember
);

router.delete('/:id', verifyUser, verifyProjectOwner, deleteProject);

module.exports = router;
