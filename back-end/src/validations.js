import joi from 'joi'


const checkParticipants = function (listParticipants, name){
    const check = listParticipants.find(value=> value.name === name.name)
    return check
}

const validateUser = function (name,res){
    const userSchema = joi.object({
        name: joi.string().required().min(2)
    })
    const validation = userSchema.validate(name)
    if(validation.error){
        console.log(validation.error.details)
        const errors = validation.error.details.map(details => details.message)
        res.status(422).send(errors)
        return true
    }
    return false
}

const validateMassage = function (message,res){
    const messageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().required()
    })
    const validation = messageSchema.validate(message)
    if(validation.error){
        console.log(validation.error.details)
        const errors = validation.error.details.map(details => details.message)
        console.log(errors)
        res.status(422).send(errors)
        return true
    }
    return false
}

export {checkParticipants, validateUser, validateMassage}