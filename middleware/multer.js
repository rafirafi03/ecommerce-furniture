const multer = require('multer');

const storage=multer.diskStorage({
    destination:"public/multerimages",
    filename:(req,file,callback)=>{
        const filename=file.originalname;
        callback(null,filename)
    }
})

const uploadproduct = multer({ storage:storage}).array("images",4)
   
module.exports = {
    uploadproduct
}
