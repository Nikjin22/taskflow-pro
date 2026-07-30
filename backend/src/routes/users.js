const router = require('express').Router();
const { updateProfile, changePassword } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.patch('/profile', updateProfile);
router.post('/change-password', changePassword);

module.exports = router;