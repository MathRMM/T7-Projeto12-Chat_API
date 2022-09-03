import express from "express";
import cors from "cors";
import dayjs from "dayjs";

import { participants, messages } from "./dataservise.js";
import { 
    checkParticipants, 
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
    try {
        listParticipants = await participants();
        res.send(listParticipants);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/participants", async (req, res) => {
    const name = req.body;

    if (validateUser(name, res)) return;

    try {
        listParticipants = await participants();
        if (checkParticipants(listParticipants, name)) {
            res.sendStatus(409);
            return;
        }
        let userInsert = {
            ...name,
            "lastStatus:": dayjs(Date.now()).format("HH:mm:ss"),
            to: "Todos",
            text: "entra na sala...",
            type: "status",
        };
        await participants(userInsert);
        res.sendStatus(201);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

//Messages
app.get("/messages", async (req, res) => {
    try {
        let listMessages = await messages();
        res.send(listMessages);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/messages", (req, res) => {
    const message = req.body
    const {user} = req.headers
    console.log(message,user)
    if(validateMassage(message, res)) return

    res.sendStatus(200);
});

//Stauts
app.post("/status", (req, res) => {
    res.send(participants);
});

app.listen(5000, () => console.log("listen on port 5000"));
