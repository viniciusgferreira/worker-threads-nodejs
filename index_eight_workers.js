const express = require("express");
const { Worker } = require('worker_threads')
const { exec } = require('child_process');
const util = require('util');
const shell = util.promisify(exec);

let THREAD_COUNT = getNumberOfCores();

console.log(`number of cores: ${THREAD_COUNT}`)
const app = express();
const port = process.env.PORT || 3000;

function createWorker() {
    return new Promise(function (resolve, reject) {
        const worker = new Worker("./eight_workers.js", {
            workerData: { thread_count: THREAD_COUNT },
        });

        worker.on("message", (data) => {
            resolve(data);
        });
        worker.on("error", (msg) => {
            reject(`An error ocurred: ${msg}`);
        });
    });
}

app.get("/non-blocking/", (req, res) => {
    res.status(200).send(`This page is non-blocking`);

});

app.get("/blocking", async (req, res) => {
    const workerPromises = [];
    for (let i = 0; i < THREAD_COUNT; i++) {
        workerPromises.push(createWorker());
    }

    const thread_results = await Promise.all(workerPromises);
    let total = 0;
    for (let i = 0; i < thread_results.length; i++) {
        total += thread_results[i];
    }

    res.status(200).send(`result is ${total}`);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

async function getNumberOfCores() {
    const { stdout, stderr } = await shell('nproc');
    THREAD_COUNT = Number(stdout);
    console.log(typeof THREAD_COUNT)
    console.log(THREAD_COUNT)



}