const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Department = require('./models/Department');
const Doctor = require('./models/Doctor');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Sample data
const departments = [
  {
    name: 'Cardiology',
    description: 'Specializes in diagnosing and treating heart conditions and cardiovascular diseases.',
    isActive: true
  },
  {
    name: 'Dermatology',
    description: 'Focuses on conditions involving the skin, hair, and nails.',
    isActive: true
  },
  {
    name: 'Orthopedics',
    description: 'Deals with conditions involving the musculoskeletal system including bones, joints, and muscles.',
    isActive: true
  },
  {
    name: 'Pediatrics',
    description: 'Medical care of infants, children, and adolescents.',
    isActive: true
  },
  {
    name: 'Neurology',
    description: 'Deals with disorders of the nervous system including brain and spinal cord.',
    isActive: true
  },
  {
    name: 'General Medicine',
    description: 'Primary care and treatment of common illnesses and general health issues.',
    isActive: true
  }
];

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Doctor.deleteMany();

    console.log('Data cleared...');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@healthcare.com',
      password: 'admin123',
      role: 'admin',
      phone: '0300-1234567',
      gender: 'male'
    });

    console.log('Admin user created');

    // Create departments
    const createdDepartments = await Department.insertMany(departments);
    console.log('Departments created');

    // Create doctor users and profiles
    const doctorUsers = [
      {
        name: 'Dr. Ahmed Khan',
        email: 'dr.ahmed@healthcare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '0300-1111111',
        gender: 'male'
      },
      {
        name: 'Dr. Sara Ali',
        email: 'dr.sara@healthcare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '0300-2222222',
        gender: 'female'
      },
      {
        name: 'Dr. Hassan Malik',
        email: 'dr.hassan@healthcare.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '0300-3333333',
        gender: 'male'
      }
    ];

    const createdDoctorUsers = await User.create(doctorUsers);
    console.log('Doctor users created');

    // Create doctor profiles
    const doctorProfiles = [
      {
        user: createdDoctorUsers[0]._id,
        department: createdDepartments[0]._id, // Cardiology
        specialization: 'Interventional Cardiology',
        qualification: 'MBBS, MD, DM Cardiology',
        experience: 15,
        consultationFee: 2000,
        bio: 'Senior Cardiologist with 15 years of experience in treating complex heart conditions.',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableSlots: [
          { startTime: '09:00', endTime: '09:30' },
          { startTime: '09:30', endTime: '10:00' },
          { startTime: '10:00', endTime: '10:30' },
          { startTime: '10:30', endTime: '11:00' },
          { startTime: '11:00', endTime: '11:30' },
          { startTime: '14:00', endTime: '14:30' },
          { startTime: '14:30', endTime: '15:00' },
          { startTime: '15:00', endTime: '15:30' }
        ],
        rating: 4.8,
        isAvailable: true
      },
      {
        user: createdDoctorUsers[1]._id,
        department: createdDepartments[1]._id, // Dermatology
        specialization: 'Cosmetic Dermatology',
        qualification: 'MBBS, MD Dermatology',
        experience: 10,
        consultationFee: 1500,
        bio: 'Expert in skin care and cosmetic procedures with a focus on patient satisfaction.',
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        availableSlots: [
          { startTime: '10:00', endTime: '10:30' },
          { startTime: '10:30', endTime: '11:00' },
          { startTime: '11:00', endTime: '11:30' },
          { startTime: '11:30', endTime: '12:00' },
          { startTime: '15:00', endTime: '15:30' },
          { startTime: '15:30', endTime: '16:00' }
        ],
        rating: 4.6,
        isAvailable: true
      },
      {
        user: createdDoctorUsers[2]._id,
        department: createdDepartments[5]._id, // General Medicine
        specialization: 'Internal Medicine',
        qualification: 'MBBS, FCPS Medicine',
        experience: 8,
        consultationFee: 1000,
        bio: 'General physician specializing in preventive care and chronic disease management.',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        availableSlots: [
          { startTime: '09:00', endTime: '09:30' },
          { startTime: '09:30', endTime: '10:00' },
          { startTime: '10:00', endTime: '10:30' },
          { startTime: '10:30', endTime: '11:00' },
          { startTime: '11:00', endTime: '11:30' },
          { startTime: '11:30', endTime: '12:00' },
          { startTime: '16:00', endTime: '16:30' },
          { startTime: '16:30', endTime: '17:00' },
          { startTime: '17:00', endTime: '17:30' }
        ],
        rating: 4.5,
        isAvailable: true
      }
    ];

    await Doctor.create(doctorProfiles);
    console.log('Doctor profiles created');

    // Create sample patient
    await User.create({
      name: 'Patient User',
      email: 'patient@healthcare.com',
      password: 'patient123',
      role: 'patient',
      phone: '0300-9999999',
      gender: 'male',
      dateOfBirth: new Date('1990-05-15')
    });

    console.log('Sample patient created');

    console.log('\n=== Data Import Complete ===');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@healthcare.com / admin123');
    console.log('Doctor: dr.ahmed@healthcare.com / doctor123');
    console.log('Patient: patient@healthcare.com / patient123');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Department.deleteMany();
    await Doctor.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
