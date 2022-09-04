import joi from 'joi'

const validateUser = function (name,res){
    const user = {name:name}
    const userSchema = joi.object({
        name: joi.string().required().min(2)
    })
    const validation = userSchema.validate(user, {abortEarly:false})
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
        type: joi.string().valid('message', 'private_message').required()
    })
    const validation = messageSchema.validate(message, {abortEarly:false})
    if(validation.error){
        console.log(validation.error.details)
        const errors = validation.error.details.map(details => details.message)
        console.log(errors)
        res.status(422).send(errors)
        return true
    }
    return false
}

export { validateUser, validateMassage }