const express = require("express");
const { Worker } = require('worker_threads')

const app = express();
const port = process.env.PORT || 3000;

app.get("/non-blocking/", (req, res) => {
    res.status(200).send(`This page is non-blocking`);

});

app.get("/blocking", async (req, res) => {
    console.time('block')
    const worker = new Worker('./worker.js');
    worker.on('message', (data) => {
        console.timeEnd('block')
        res.send(`result is ${data}`);
    })

    worker.on('error', (msg) => {
        res.status(400).send(`an error ocurred: ${msg}`)
    })

});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});