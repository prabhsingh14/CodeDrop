import { exec } from "child_process";

export const buildProject = (projectDir) =>
    new Promise((resolve, reject) => {
        exec(
            `cd ${projectDir} && npm install && npm run build`,
            (err, stdout, stderr) => {
                if (err) return reject(stderr);
                return resolve(stdout);
            }
        );
    }
);
