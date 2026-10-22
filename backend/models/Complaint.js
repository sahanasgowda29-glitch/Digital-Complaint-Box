const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    text: { type: String, required: true },       // complaint message
    location: { type: String, required: true },   // user location / area
    reporterName: { type: String },               // who submitted
    photoPath: { type: String },                  // stored image path (/uploads/...)
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
