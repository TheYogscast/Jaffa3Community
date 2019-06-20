'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bet = new Schema({
  channel_id:    { type: String, ref: 'Channel' },
  user_id:       { type: String, ref: 'User' },
  option:        { type: String },
  amount:        { type: Number },
}, { strict: false });

module.exports = { name: 'Bet', schema: bet };
