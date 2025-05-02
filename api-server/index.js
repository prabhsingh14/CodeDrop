import express from 'express';
import { generateSlug } from 'random-word-slugs';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import Redis from 'ioredis';
import { Socket } from 'socket.io';

const app = express();
const port = 9000;

const subscriber = new Redis(process.env.REDIS_URL); 

const io = new Socket({ cors: ['*'] });

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel);
        socket.emit('message', `Subscribed to channel: ${channel}`);
    })
})

io.listen(9001, () => {
    console.log('Socket server is running at http://localhost:9001');
})

const ecsClient = new ECSClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const config = {
    CLUSTER: '',
    TASK: '',
}

app.use(express.json());

app.post("/project", async (req, res) => {
    const { gitURL } = req.body;
    const projectSlug = generateSlug();

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            assignPublicIp: 'ENABLED',
            subnets: [], // Add your subnet IDs here
            securityGroups: [], // Add your security group ID here
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        { name: 'GIT_URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug },
                    ],
                },
            ]
        }
    })

    await ecsClient.send(command);

    return res.json({
        status: 'queued',
        data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
    })
})

function initRedisSubscribe(){
    subscriber.psubscribe('logs:*', (err, count) => {
        if(err) console.error(err);
    })

    subscriber.on('pmessage', (pattern, channel, message) => {
        const { log } = JSON.parse(message);
        const projectId = channel.split(':')[1];
        io.to(`logs:${projectId}`).emit('log', log);
    })
}

initRedisSubscribe();

app.listen(port, () => {
    console.log(`API Server is running at http://localhost:${port}`);
});