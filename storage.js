const multer = require('multer')
const config = require('./config.js')
module.exports = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.destination_folder + '')
    },
    filename: (req, file, cb) => {
        let extArray = file.mimetype.split('/')
        let extension = extArray[extArray.length - 1]
        cb(null, Date.now() + '.' + extension) //Appending .jpg
    }
})