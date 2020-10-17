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

    //checa se uma string é apenas número
    function isNumeric(str) {
        var er = /^[0-9]+$/;
        return (er.test(str));
    }
    return { existOrError, notExistsOrError, equalsOrError, isNumeric }
}

