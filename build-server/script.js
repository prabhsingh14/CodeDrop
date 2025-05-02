import { exec } from 'child_process'; //exec is a function that allows you to run shell commands
import path from 'path';
import fs from 'fs'; 
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import mime from 'mime-types'; 
import Redis from 'ioredis';

const publisher = new Redis(process.env.REDIS_URL); 

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

const PROJECT_ID = process.env.PROJECT_ID; 

function publishLog(log){
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({log}));
}

async function init(){
    console.log("Executing script.js")
    publishLog("Executing script.js"); // Log the start of the script execution

    const outDirPath = path.join(__dirname, 'output'); 
    const execPath = exec(`cd ${outDirPath} && npm run build`); 

    execPath.stdout.on('data', (data) => {
        console.log(data.toString()); // Log the output of the command to the console
        publishLog(data.toString()); // Publish the log to Redis
    })

    execPath.stderr.on('data', (data) => {
        console.error(data.toString()); // Log any errors to the console
        publishLog(data.toString()); // Publish the error log to Redis
    })

    execPath.on('close', async function(){
        console.log(`Build completed`); // Log the exit code of the command
        publishLog(`Build completed`); // Publish the log to Redis

        const distPath = path.join(__dirname, 'output', 'dist'); // Path to the dist directory
        const distFiles = fs.readdirSync(distPath, { recursive: true }); // Read the contents of the dist directory

        for (const file of distFiles) {
            const filePath = path.join(distPath, file);
            if(fs.lstatSync(filePath).isDirectory()) continue; // Skip directories

            const command = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath),
            });

            await s3Client.send(command);
        }
    })
}

init();