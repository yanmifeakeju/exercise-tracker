const { Schema, model } = require('mongoose');

const ExcerciseSchema = new Schema({
  description: {
    type: String,
    required: [true, 'Please provide a description of the excercise completed'],
  },
  duration: {
    type: Number,
    required: [
      true,
      'Please provide the duration of the excercise completed in mintues',
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'Users',
    required: [true, 'Please provide user id'],
  },
});

module.exports = model('Excercise', ExcerciseSchema);
