const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
  },
});

module.exports = model('User', UserSchema);
