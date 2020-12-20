const aws = require('aws-sdk')
const s3 = new aws.S3()

module.exports = app => {
    function existOrError(value, msg) {
        if(!value) throw msg
        if(Array.isArray(value) && value.length === 0) throw msg
        if(typeof value === 'string' && !value.trim()) throw msg
    }
    
    function notExistsOrError(value, msg) {
        try {
            existOrError(value, msg)
        }catch(msg) {
            return 
        }
        throw msg
    }
    
    function equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }

    function notEqualsOrError(valueA, valueB, msg) {
        if(valueA === valueB) throw msg
    }

    function isNumeric(str) {
        var er = /^[0-9]+$/;
        return (er.test(str));
    }

    function stringDateParse(value) {
        const dateNumber = Date.parse(`${value[1]}/${value[0]}/${value[2]}`)
        return dateNumber
    }

    function stringDateFormatCorrect(value) {
        const dateArray = value.split('/')
        const stringDate = `${dateArray[1]}/${dateArray[0]}/${dateArray[2]}`
        return stringDate
    }

    function compDate(value1, value2) {
        const dateArray1 = value1.split('/')
        const dateArray2 = value2.split('/')
        const dateNumber1 = stringDateParse(dateArray1)
        const dateNumber2 = stringDateParse(dateArray2)
        if(dateNumber1 > dateNumber2) {
            return true
        }else {
            return false
        }
    }

    function deleteS3(req) {
        if(req.file) {
            s3.deleteObject({
                Bucket: process.env.AWS_STORAGE_TASK_DOCUMENT,
                Key: req.file.key  
            }).promise()
        }    
    }
    
    return { 
        existOrError, 
        notExistsOrError, 
        equalsOrError, 
        isNumeric, 
        notEqualsOrError,
        stringDateFormatCorrect,
        compDate,
        deleteS3 
    }
}

