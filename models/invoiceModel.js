const mongoose = require('mongoose');

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
    Pname: {
        type: [String], // An array of strings for one or more data points
        required: true,
    },
    Pamount: {
        type: [Number], // An array of numbers corresponding to the name array
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now, // Automatically sets to today's date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online'], // Drop-down options for payment method
        required: true,
    },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;