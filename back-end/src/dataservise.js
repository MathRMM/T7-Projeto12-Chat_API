import { MongoClient, ObjectId } from 'mongodb';
import dotenv from "dotenv";
dotenv.config({ path: './../.env' });

const mongoClient = new MongoClient(process.env.MONGO_URI)
let db
mongoClient.connect().then(() => {
    db = mongoClient.db(process.env.DATA_BASE)
})

const findParticipants = async ({ user, post, remove}) => {
    if (!user && !post && !remove) {
        const check = await db.collection('participants').find().toArray()
        return check
    }

    if (user) {
        const check = await db.collection('participants').findOne({name:user})
        return check
    }
    
    if (post) {
        const response = await db.collection('participants').insertOne(post)
        return response
    }

    if (remove){
        const response = await db.collection('participants').deleteOne({_id:remove})
        return response
    }
}

const updateLastStatus = async (userID, newStatus) => {
    const response = await db.collection('participants')
        .updateOne(
            { _id: userID },
            { $set: newStatus })
    return response
}

const messages = async (post) => {
    if (post) {
        let response = await db.collection('messages').insertOne(post)
        return response
    } else {
        let response = await db.collection('messages').find().toArray()
        return response
    }
}


export { messages, findParticipants, updateLastStatus }