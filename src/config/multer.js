const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')

const storageTypes = {
    // local: multer.diskStorage({
    //     destination: (req, file, cb) => {
    //         cb(null, path.resolve(__dirname, '..', '..','tmp', 'uploads_images'))    
    //     },
    //     filename: (req, file, cb) => {
    //         crypto.randomBytes(16, (err, hash) => {
    //             if(err) cb(err)

    //             file.key = `${hash.toString('hex')}-${file.originalname}`

    //             cb(null, file.key)
    //         })
    //     }
    // }),
    s3Images: multerS3({
        s3: new aws.S3(),
        bucket: process.env.AWS_STORAGE_IMAGE,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err)

                const filename = `${hash.toString('hex')}-${file.originalname}`

                cb(null, filename)
            })
        },
    }),
    s3Documetation: multerS3({
        s3: new aws.S3(),
        bucket: process.env.AWS_STORAGE_DOCUMENTATION,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err)

                const filename = `${hash.toString('hex')}-${file.originalname}`

                cb(null, filename)
            })
        },
    })
    
}

module.exports = app => {
    const uploadImages = {
        dest: path.resolve(__dirname, '..', '..','tmp', 'uploads_images'),
        storage: storageTypes["s3Images"],
        limits: {
            fileSize: 2 * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'image/jpeg',
                'image/pjpeg',
                'image/png'
            ]
    
            if(allowedMimes.includes(file.mimetype)) {
                cb(null, true)
            }else {
                cb(new Error("Tipo de arquivo inválido."))    
            }
        }
    }

    const uploadDocumentation = {
        dest: path.resolve(__dirname, '..', '..','tmp', 'uploads_images'),
        storage: storageTypes["s3Documetation"],
        limits: {
            fileSize: 2 * 1024 * 1024
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'application/pdf'
            ]
    
            if(allowedMimes.includes(file.mimetype)) {
                cb(null, true)
            }else {
                cb(new Error("Tipo de arquivo inválido."))    
            }
        }        
    }
    
    // dest: path.resolve(__dirname, '..', '..','tmp', 'uploads_images'),
    // storage: storageTypes["s3"],
    // limits: {
    //     fileSize: 2 * 1024 * 1024
    // },
    // fileFilter: (req, file, cb) => {
    //     const allowedMimes = [
    //         'image/jpeg',
    //         'image/pjpeg',
    //         'image/png'
    //         // 'application/pdf'
    //     ]

    //     if(allowedMimes.includes(file.mimetype)) {
    //         cb(null, true)
    //     }else {
    //         cb(new Error("Tipo de arquivo inválido."))    
    //     }
    // }
    return {
        uploadImages,
        uploadDocumentation
    }
}