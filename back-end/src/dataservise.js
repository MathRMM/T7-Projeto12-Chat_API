import { MongoClient, ObjectId } from 'mongodb';
import dotenv from "dotenv";
dotenv.config({path: './../.env'});

const mongoClient = new MongoClient(process.env.MONGO_URI)
let db
mongoClient.connect().then(()=>{
    db = mongoClient.db(process.env.DATA_BASE)
})

const participants = async (post)=>{
    if(post){
        let request = await db.collection('participants').insertOne(post)
        return request
    }else{
        let response = await db.collection('participants').find().toArray()
        return response
    }
}

const messages = async (post)=>{
    if(post){
        let request = await db.collection('messages').insertOne(post)
        return request
    }else{
        let response = await db.collection('messages').find().toArray()
        return response
    }
}


export {participants, messages}