const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// @GET /api/users/profile
router.get('/profile', (req, res) => {
  res.json({ success: true, data: req.user });
});

// @PUT /api/users/profile
router.put('/profile', async (req, res) => {
  const { name, phone, address } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
