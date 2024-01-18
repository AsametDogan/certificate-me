
import multer from 'multer';



export const profileImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file) {
      return cb(new Error('Dosya bulunamadı'), "null");
    }
    cb(null, "./media/profile/")
  },
  filename: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Geçersiz dosya türü'), "null");
    }
    cb(null, Date.now() + "-pp-" + file.originalname)
  },
}
)

export const certificateImgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file) {
      return cb(new Error('Dosya bulunamadı'), "null");
    }
    cb(null, "./media/certificate/")
  },
  filename: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Geçersiz dosya türü'), "null");
    }
    cb(null, Date.now() + "-badge-" + file.originalname)
  },
}
)

export const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file) {
      return cb(new Error('Dosya bulunamadı'), "null");
    }
    cb(null, "/home/media/image/")
  },
  filename: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Geçersiz dosya türü'), "null");
    }
    cb(null, Date.now() + "-badge-" + file.originalname)
  },
}

)


