const mongoose = require('mongoose');
const User = require('./user');

const taskSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true, 
        enum: ["Pending", "In Progress", "Completed"]
    },
    due_date: {
        String: Date,
        required: true
    },
    priority: {
        type: String, 
        enum: ['Low', 'Medium', 'High'],
    },
    created_at: {
        type: Date, 
        default: Date.now
    },
    updated_at:{
        type: Date
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})