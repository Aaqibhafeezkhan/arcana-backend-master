const User = require('../../models/User');

const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    user.profilePicture = req.file.path;
    await user.save();

    res.status(200).json({ message: 'Profile picture updated', imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = uploadProfilePicture;
