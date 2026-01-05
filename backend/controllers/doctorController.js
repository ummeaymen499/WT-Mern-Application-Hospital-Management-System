const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Filter by department
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Filter by specialization
    if (req.query.specialization) {
      query.specialization = { $regex: req.query.specialization, $options: 'i' };
    }

    // Filter by availability
    if (req.query.available === 'true') {
      query.isAvailable = true;
    }

    // Filter by rating
    if (req.query.minRating) {
      query.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Search by name (requires aggregation)
    let doctors;
    let total;

    if (req.query.search) {
      const searchResults = await Doctor.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        { $unwind: '$userInfo' },
        {
          $match: {
            ...query,
            $or: [
              { 'userInfo.name': { $regex: req.query.search, $options: 'i' } },
              { specialization: { $regex: req.query.search, $options: 'i' } }
            ]
          }
        },
        { $sort: { rating: -1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: startIndex }, { $limit: limit }]
          }
        }
      ]);

      total = searchResults[0].metadata[0]?.total || 0;
      const doctorIds = searchResults[0].data.map(d => d._id);
      doctors = await Doctor.find({ _id: { $in: doctorIds } });
    } else {
      total = await Doctor.countDocuments(query);
      doctors = await Doctor.find(query)
        .skip(startIndex)
        .limit(limit)
        .sort({ rating: -1, createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private/Admin
exports.createDoctor = async (req, res) => {
  try {
    const { user: userData, userId, ...doctorData } = req.body;

    let user;

    // If user data is provided, create a new user or use existing
    if (userData && userData.email) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        // Check if this user already has a doctor profile
        const existingDoctorProfile = await Doctor.findOne({ user: existingUser._id });
        if (existingDoctorProfile) {
          return res.status(400).json({
            success: false,
            message: 'Doctor profile already exists for this email'
          });
        }
        // User exists but no doctor profile - use this user
        user = existingUser;
        user.role = 'doctor';
        await user.save();
      } else {
        // Create new user with doctor role
        user = await User.create({
          name: userData.name,
          email: userData.email,
          password: userData.password || 'doctor123',
          phone: userData.phone,
          role: 'doctor'
        });
      }
    } else if (userId) {
      // Use existing user by ID
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      // Update user role to doctor
      user.role = 'doctor';
      await user.save();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide user data or userId'
      });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: user._id });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists for this user'
      });
    }

    // Map qualifications (array) to qualification (string) for the model
    if (doctorData.qualifications) {
      if (Array.isArray(doctorData.qualifications)) {
        doctorData.qualification = doctorData.qualifications.filter(q => q).join(', ') || 'MBBS';
      } else {
        doctorData.qualification = doctorData.qualifications;
      }
      delete doctorData.qualifications;
    }
    
    // Ensure qualification has a value (required field)
    if (!doctorData.qualification) {
      doctorData.qualification = 'MBBS';
    }

    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      ...doctorData
    });

    // Populate user data for response
    await doctor.populate('user', 'name email phone');
    await doctor.populate('department', 'name');

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Create Doctor Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: error.message
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private/Admin/Doctor
exports.updateDoctor = async (req, res) => {
  try {
    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile'
      });
    }

    doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete doctor profile
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update user role back to patient
    await User.findByIdAndUpdate(doctor.user._id, { role: 'patient' });

    await doctor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doctor profile deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get doctor by user ID
// @route   GET /api/doctors/user/:userId
// @access  Private
exports.getDoctorByUserId = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get doctors by department
// @route   GET /api/doctors/department/:departmentId
// @access  Public
exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const doctors = await Doctor.find({ 
      department: req.params.departmentId,
      isAvailable: true 
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/:id/availability
// @access  Private/Doctor
exports.updateAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && doctor.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { availableDays, availableSlots, isAvailable } = req.body;

    if (availableDays) doctor.availableDays = availableDays;
    if (availableSlots) doctor.availableSlots = availableSlots;
    if (typeof isAvailable === 'boolean') doctor.isAvailable = isAvailable;

    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
