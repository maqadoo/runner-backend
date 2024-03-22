const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    language: {
        type: String,
        require: true
    },
    snipName: {
        type: String,
        require: true,
    },
    timestamp: {
        type: Date,
        required: true,
      },
    code: {
        type: String,
        require: true,
    }
});

module.exports = mongoose.model('Submission', submissionSchema);