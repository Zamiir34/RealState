const express = require('express');
const {
  createAgentProfile, getAgents, getAgent, getMyAgentProfile,
  updateAgent, approveAgent, getAgentStats,
} = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAgents);
router.get('/profile/me', protect, authorize('agent'), getMyAgentProfile);
router.get('/stats/me', protect, authorize('agent'), getAgentStats);
router.get('/:id', getAgent);

router.post('/profile', protect, authorize('agent', 'buyer'), createAgentProfile);
router.put('/profile', protect, authorize('agent', 'admin'), updateAgent);
router.put('/:id/approve', protect, authorize('admin'), approveAgent);

module.exports = router;
