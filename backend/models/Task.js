const mongoose = require('mongoose');
const { TASK_STATUS } = require('../constant');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    }, // Added for assignee
    due_date: { type: Date },
    status: {
      type: String,
      enum: TASK_STATUS,
      required: true,
      default: 'TODO',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project', // Reference the Project model
      required: true, // Ensure project ID is always present
    },
  },

  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
