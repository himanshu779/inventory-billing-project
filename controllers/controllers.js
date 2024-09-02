const adminData = require('../models/userRegistration');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Data = require('../models/inventory');
const moment = require('moment-timezone');
const Invoice = require('../models/invoiceModel');

module.exports.register = async (req,res) => {
try {
    const { email, password } = req.body;
    let existingUser = await adminData.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
    else if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    else {
        const newUser = new adminData({
            email: req.body.email,
            password: req.body.password
        });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();
        return res.status(200).json({ message: 'User registered successfully'});
    } 
} catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' });
}}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await adminData.findOne({ email });
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, 'secret-key', { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.getallData = async (req,res) => {
    try {
        const user = await adminData.find();
        return res.status(200).json({message:'Data Fetch successfully',user});
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.createData = async (req, res) => {
    try {
        const { code, startDate, endDate, size } = req.body;
        const format = 'DD/MM/YYYY';
        const timezone = 'Asia/Kolkata';

        const parsedStartDate = moment.tz(startDate, format, true, timezone);
        const parsedEndDate = moment.tz(endDate, format, true, timezone);

        if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
            return res.status(400).json({ message: "Invalid date format. Please use 'DD/MM/YYYY' format." });
        }

        const newData = new Data({
            code,
            size,
            startDate: parsedStartDate.toDate(),
            endDate: parsedEndDate.toDate()
        });

        await newData.save();
        res.status(201).json({ message: "Data added successfully" });;

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.updateInventory = async (req, res) => {
        const { id } = req.params;
        const { code, startDate, endDate } = req.body;
    
        // Validate input
        if (!id || !code || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: "All fields are required: id, code, startDate, endDate." });
        }
    
        // Parse and format dates
        const parsedStartDate = moment(startDate, 'DD/MM/YYYY', true).tz("Asia/Kolkata");
        const parsedEndDate = moment(endDate, 'DD/MM/YYYY', true).tz("Asia/Kolkata");
    
        // Check if parsing was successful
        if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
            return res.status(400).json({ success: false, message: "Invalid date format. Please use 'DD/MM/YYYY'." });
        }
    
        // Convert to JavaScript Date objects
        const startDateAsDate = parsedStartDate.toDate();
        const endDateAsDate = parsedEndDate.toDate();
    
        try {
            const updatedData = await Data.findByIdAndUpdate(
                id,
                { code, startDate: startDateAsDate, endDate: endDateAsDate },
                { new: true, runValidators: true }  // runValidators ensures validation is applied during update
            );
    
            if (!updatedData) {
                return res.status(404).json({ success: false, message: "Data not found with the provided ID." });
            }
    
            res.status(200).json({
                success: true,
                message: "Data updated successfully.",
                data: updatedData
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error occurred while updating data.", error: error.message });
        }
    };

// Delete
module.exports.deleteData = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedData = await Data.findByIdAndDelete(id);

        if (!deletedData) {
            return res.status(404).json({ success: false, message: "Data not found with the provided ID." });
        }

        res.status(200).json({ success: true, message: "Data was deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error occurred while deleting data.", error: error.message });
    }
};

// View with Pagination
module.exports.getRantedInventory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        // Convert query params to integers (in case they are passed as strings)
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Fetch data with pagination
        const data = await Data.find()
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .exec();

        // Get the total count of documents
        const count = await Data.countDocuments();

        // Return a structured response
        res.status(200).json({
            success: true,
            data,
            totalRecords: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            nextPage: pageNum < Math.ceil(count / limitNum) ? pageNum + 1 : null,
            prevPage: pageNum > 1 ? pageNum - 1 : null,
            limit: limitNum
        });
    } catch (error) {
        // Handle any errors that occur during the request
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the data.',
            error: error.message
        });
    }
};

//dashboard

module.exports.dashboard = async (req, res) => {
    try {
       // Get today's date in ISO format
       const todayStart = moment().startOf('day').toDate();
       const todayEnd = moment().endOf('day').toDate();

       // Query for documents where startDate is today
       const data = await Data.find({
            $or: [
                { startDate: { $gte: todayStart, $lte: todayEnd } },
                { endDate: { $gte: todayStart, $lte: todayEnd } }
                ]
        }).exec();  

       // Prepare the response data
       const responseData = data.map(item => ({
           id: item._id,
           code: item.code,
           startDate: moment(item.startDate).format('DD/MM/YYYY'), // Format startDate
           endDate: moment(item.endDate).format('DD/MM/YYYY')    // Format endDate
       }));

       // Return the data
       res.status(200).json({
           success: true,
           message: "Data with today's startDate retrieved successfully.",
           data: responseData
       });
      } catch (error) {
        console.error("Error retrieving data:", error); // Log error for debugging
        res.status(500).json({
            success: false,
            message: "Server error occurred while retrieving data.",
            error: error.message
        });
    }
}


// Function to create a new invoice
exports.createInvoice = async (req, res) => {
    try {
        const { Pname, Pamount, customerName, mobileNumber, paymentMethod } = req.body;

        if (!Array.isArray(Pname) || Pname.length === 0) {
            return res.status(400).send('Name must be an array with at least one item.');
        }

        if (!Array.isArray(Pamount) || Pamount.length !== Pname.length) {
            return res.status(400).send('Amount must be an array with the same length as name.');
        }

        const total = Pamount.reduce((acc, curr) => acc + curr, 0); // Calculate the total amount

        const invoice = await Invoice.create({
            Pname,
            Pamount,
            total,
            customerName,
            mobileNumber,
            paymentMethod,
        });

        res.status(201).send(invoice);
    } catch (error) {
        res.status(500).send('Server Error');
    }
};