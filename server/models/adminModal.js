const mongoose = require('mongoose')

const admin = new mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
    },
    {collection: 'admindata'}
)

const model = mongoose.model('adminData', admin)

module.exports = model