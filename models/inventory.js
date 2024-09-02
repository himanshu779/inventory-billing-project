const mongoose = require ("mongoose");
const DataSchema = new mongoose.Schema({
    code: { type: String, required: true, index:true},
    size: { type: String },
    startDate: { type: Date, required:true},
    endDate: { type: Date, required: true}
});

module.exports = mongoose.model("data", DataSchema);
// model.exports = data;
