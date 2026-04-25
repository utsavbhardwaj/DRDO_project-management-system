const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, addMembers, removeMember, deleteProject, pingManager } = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, admin, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

router.post('/:id/add-members', protect, admin, addMembers);
router.post('/:id/remove-member', protect, admin, removeMember);
router.post('/:id/ping', protect, admin, pingManager);

module.exports = router;

