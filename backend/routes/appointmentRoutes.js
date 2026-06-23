const express = require('express');
const {
  createAppointment, getAppointments, getAppointment,
  updateAppointmentStatus, getCalendarAppointments, cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAppointments);
router.get('/calendar', getCalendarAppointments);
router.get('/:id', getAppointment);
router.post('/', authorize('buyer', 'owner'), createAppointment);
router.put('/:id/status', authorize('admin', 'agent', 'owner'), updateAppointmentStatus);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
