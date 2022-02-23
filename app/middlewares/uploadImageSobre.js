const multer = require('multer');

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/images/sobre')
        },
        filename: (req, file, cb) => {
            let filename = file.originalname.split(" ").join("_");
            let splitParenteses = filename.split("(").join("[");
            let newFilename = splitParenteses.split(")").join("]");

            cb(null, Date.now().toString() + "_" + newFilename);  
        }
    }),
    fileFilter: (req, file, cb) => {
        const extensaoImg = ['image/png', 'image/jpg', 'image/jpeg'].find(formatoAceito => formatoAceito == file.mimetype);

        if(extensaoImg){
            return cb(null, true);
        }

        return cb(null, false);
    }
}));