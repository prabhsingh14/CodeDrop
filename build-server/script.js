import { exec } from 'child_process'; //exec is a function that allows you to run shell commands
import path from 'path';
import fs from 'fs'; 

async function init(){
    console.log("Executing script.js")

    const outDirPath = path.join(__dirname, 'output'); 
    const execPath = exec(`cd ${outDirPath} && npm run build`); 

    execPath.stdout.on('data', (data) => {
        console.log(data.toString()); // Log the output of the command to the console
    })

    execPath.stderr.on('data', (data) => {
        console.error(data.toString()); // Log any errors to the console
    })

    execPath.on('close', async function(){
        console.log(`Build completed`); // Log the exit code of the command

        const distPath = path.join(__dirname, 'output', 'dist'); // Path to the dist directory
        const distFiles = fs.readdirSync(distPath, { recursive: true }); // Read the contents of the dist directory

        for (const file of distFiles) {
            if(fs.lstatSync(file).isDirectory()) continue; // Skip directories
        }
    })
}