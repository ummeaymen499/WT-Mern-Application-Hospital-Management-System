# Healthcare Appointment System

A complete web-based Healthcare Appointment System built using the MERN stack (MongoDB, Express.js, React.js, Node.js). This system allows patients to book, manage, and track medical appointments with healthcare providers.

## Features

### For Patients
- User registration and authentication
- Browse doctors by department and specialization
- View doctor profiles with ratings and reviews
- Book appointments with available time slots
- View and manage appointments (cancel, view prescription)
- Leave reviews for completed appointments
- Update profile information

### For Doctors
- View and manage appointments
- Confirm or cancel appointments
- Complete appointments with diagnosis and prescription
- Update availability schedule
- View patient information

### For Administrators
- Manage doctors (add, edit, delete)
- Manage departments (add, edit, delete)
- Manage users (view, edit, activate/deactivate)
- View system statistics

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File uploads

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **React Icons** - Icon library
- **Context API** - State management

## Project Structure

```
healthcare-appointment-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User CRUD operations
│   │   ├── doctorController.js   # Doctor operations
│   │   ├── departmentController.js
│   │   ├── appointmentController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── error.js             # Error handling
│   │   └── upload.js            # File upload configuration
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Department.js
│   │   ├── Appointment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── reviewRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── seeder.js                # Database seeder
│   └── server.js                # Entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.js
│   │   │   │   └── Footer.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Departments.js
│   │   │   ├── Doctors.js
│   │   │   ├── DoctorDetail.js
│   │   │   ├── BookAppointment.js
│   │   │   └── dashboard/
│   │   │       ├── PatientDashboard.js
│   │   │       ├── DoctorDashboard.js
│   │   │       ├── AdminDashboard.js
│   │   │       ├── MyAppointments.js
│   │   │       ├── Profile.js
│   │   │       ├── DoctorAppointments.js
│   │   │       ├── ManageDoctors.js
│   │   │       ├── ManageDepartments.js
│   │   │       └── ManageUsers.js
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthcare_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get logged in user |
| PUT | `/api/auth/updatedetails` | Update user details |
| PUT | `/api/auth/updatepassword` | Update password |
| GET | `/api/auth/logout` | Logout user |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get single user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| PUT | `/api/users/:id/toggle-status` | Toggle user status |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors |
| GET | `/api/doctors/:id` | Get single doctor |
| POST | `/api/doctors` | Create doctor (Admin) |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor (Admin) |
| GET | `/api/doctors/:id/availability` | Get doctor availability |
| PUT | `/api/doctors/:id/availability` | Update availability |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/departments` | Get all departments |
| GET | `/api/departments/:id` | Get single department |
| POST | `/api/departments` | Create department (Admin) |
| PUT | `/api/departments/:id` | Update department (Admin) |
| DELETE | `/api/departments/:id` | Delete department (Admin) |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/:id` | Get single appointment |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |
| PUT | `/api/appointments/:id/cancel` | Cancel appointment |
| PUT | `/api/appointments/:id/status` | Update status (Doctor) |
| GET | `/api/appointments/slots/:doctorId` | Get available slots |
| GET | `/api/appointments/stats` | Get statistics |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get all reviews |
| GET | `/api/reviews/:id` | Get single review |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |
| GET | `/api/doctors/:doctorId/reviews` | Get doctor reviews |

## Demo Accounts

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@healthcare.com | password123 |
| Doctor | dr.smith@healthcare.com | password123 |
| Patient | patient@example.com | password123 |

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGO_URI | MongoDB connection string | - |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 30d |

## Features Implemented

### Backend Features
- [x] RESTful API architecture
- [x] JWT-based authentication
- [x] Role-based authorization (Patient, Doctor, Admin)
- [x] Input validation with express-validator
- [x] Error handling middleware
- [x] Pagination, filtering, and searching
- [x] File upload support
- [x] Database seeding

### Frontend Features
- [x] Responsive design
- [x] Context API state management
- [x] Protected routes
- [x] Form validation
- [x] Toast notifications
- [x] Multi-step booking flow
- [x] Dashboard for each user role
- [x] Search and filter functionality

## Screenshots

### Home Page
The landing page showcases the healthcare services and allows users to browse doctors and departments.

### Doctor Listing
Browse all available doctors with filters for department, specialization, and rating.

### Appointment Booking
Multi-step appointment booking process with date and time slot selection.

### Patient Dashboard
View appointment statistics, recent appointments, and quick actions.

### Doctor Dashboard
Manage appointments, view today's schedule, and update patient records.

### Admin Dashboard
System overview with user, doctor, department, and appointment statistics.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is for educational purposes as part of the Web Technologies course (5th Semester).

## Support

For any issues or questions, please open an issue in the repository.
