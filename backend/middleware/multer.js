const multer = require('multer')

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-')
        const ext = MIME_TYPE_MAP[file.mimetype]
        // cb(null, name + '-' + Date.now() + '.' + ext)
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

module.exports = upload