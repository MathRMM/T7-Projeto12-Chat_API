import express from "express";
import cors from "cors";
import dayjs  from "dayjs";
import {stripHtml} from 'string-strip-html'
import dotenv from "dotenv";
dotenv.config();

import { messages, findParticipants, updateLastStatus, deleteMessage, updateMessage } from "./dataservise.js";
import {
    validateMassage,
    validateUser
} from "./validations.js";

const app = express();
app.use(cors());
app.use(express.json());

//Variaveis Universais
let listParticipants = [];

//Partipants
app.get("/participants", async (req, res) => {
    const { user } = req.headers
    if (!user) return res.sendStatus(400)

    try {
        const check = await findParticipants({ user: stripHtml(user).result })
        if (!check) {
            res.sendStatus(404);
            return;
        }
        listParticipants = await findParticipants({});
        res.send(listParticipants);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/participants", async (req, res) => {
    const { name } = req.body;
    if (!name) return res.sendStatus(400)

    if (validateUser(name, res)) return;

    try {
        const check = await findParticipants({ user: name });
        if (check) {
            res.sendStatus(409);
            return;
        }
        let userInsert = {
            name: name,
            lastStatus: Date.now(),
        };
        await findParticipants({ post: userInsert });

        let userInsertMassage = {
            from: name,
            time: dayjs(Date.now()).locale('br').format("HH:mm:ss"),
            to: "Todos",
            text: "entra na sala...",
            type: "status",
        }
        await messages(userInsertMassage)
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

//Messages
app.get("/messages", async (req, res) => {
    const { limit } = req.query
    const { user } = req.headers
    if (!user) return res.sendStatus(400)


    try {
        const check = await findParticipants({ user: user })
        if (!check) {
            res.sendStatus(404);
            return;
        }
        let listMessages = await messages();
        let filteredList = listMessages.filter((message) => {
            if (message.type !== 'private_message' ||
                message.to === user ||
                message.from === user) {
                return message
            }
        });

        if (limit) {
            let listWithLimit = filteredList.slice(limit * -1)
            res.status(200).send(listWithLimit)
            return
        }
        res.status(200).send(filteredList);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/messages", async (req, res) => {
    const { user } = req.headers
    const { to, text, type } = req.body
    if (!user || !to || !text || !type) return res.sendStatus(400)

    const message = {
        to: stripHtml(to).result,
        text: stripHtml(text).result,
        type: type
    }

    if (validateMassage(message, res)) return

    try {
        const check = await findParticipants({ user: user })
        if (!check) {
            res.sendStatus(404);
            return;
        }
        await messages({
            from: user,
            ...message,
            time: dayjs().locale('br').format("HH:mm:ss")
        })
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.delete("/messages/:id", async (req, res) => {
    const { user } = req.headers
    const { id } = req.params
    if(!user || !id) return res.sendStatus(400)

    try {
        const check = await findParticipants({user:user})
        if(!check) return res.sendStatus(401)
        await deleteMessage(id)
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

app.put("/messages/:id", async (req, res) => {
    const { user } = req.headers
    const {id} = req.params
    const { to, text, type } = req.body
    if (!user || !to || !text || !type || !id) return res.sendStatus(400)

    const message = {
        to: to,
        text: text,
        type: type
    }

    if (validateMassage(message, res)) return

    try {
        const check = await findParticipants({user:user})
        if(!check) return res.sendStatus(404)
        const a = await updateMessage(id, message)
        res.sendStatus(200)
    } catch (error) {
        
    }
})

//Stauts
app.post("/status", async (req, res) => {
    const { user } = req.headers
    if (!user) return res.sendStatus(400)

    try {
        const participant = await findParticipants({ user: user })
        if (!participant) {
            return res.sendStatus(404)
        }
        await updateLastStatus(participant._id, {
            _id: participant._id,
            name: participant.name,
            lastStatus: dayjs(Date.now()).locale('br')
        })
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

setInterval(async () => {
    const participantsStatus = await findParticipants({})
    participantsStatus.map(async (value) => {
        if (value.lastStatus < Date.now() - 10000) {
            await findParticipants({ remove: value._id })
            await messages({
                from: value.name,
                time: dayjs(Date.now()).locale('br').format("HH:mm:ss"),
                to: "Todos",
                text: "saiu na sala...",
                type: "status",
            })
        }
    })
}, 15000)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listen on port ${PORT}`));