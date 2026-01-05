const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please select appointment date']
  },
  timeSlot: {
    startTime: {
      type: String,
      required: [true, 'Please select time slot']
    },
    endTime: {
      type: String,
      required: [true, 'Please select time slot end']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    default: 'consultation'
  },
  symptoms: {
    type: String,
    maxlength: [500, 'Symptoms description cannot be more than 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  prescription: {
    type: String,
    maxlength: [2000, 'Prescription cannot be more than 2000 characters']
  },
  diagnosis: {
    type: String,
    maxlength: [1000, 'Diagnosis cannot be more than 1000 characters']
  },
  fee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Reason cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Populate patient and doctor info
appointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'patient',
    select: 'name email phone gender dateOfBirth'
  }).populate({
    path: 'doctor',
    select: 'user department specialization consultationFee'
  });
  next();
});

// Index for better query performance
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
