const express = require("express");
const {generateSlug} = require("random-word-slugs");
const {ECSClient, RunTaskCommand} = require('@aws-sdk/client-ecs');
const Redis = require('ioredis');
const { Server } = require("socket.io");
const {zod} =  require('zod')
const {PrismaClient} = require('@prisma/client')
const {createClient} = require('@clickhouse/client')

const app = express();
const PORT = 9000;

const subscriber = new  Redis('')

const prisma = new PrismaClient({})

const io = new Server({ cors: '*' })

const client = createClient({
    host: '',
    database: '',
    username: '',
    password: ''
})

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)
    })
})

io.listen(9002, () => console.log('Socket Server 9002'))

const ecsClient = new ECSClient({
    region: '',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
})

const config  = {
    CLUSTER:'',
    TASK:''
}
app.use(express.json())

app.post('/project', async(req,res) => {
    const schema = z.object({
        name: z.string(),
        gitURL: z.string()
    })

    const safeParseResult = schema.safeParseResult(req.body)

    if (safeParseResult.error) return res.status(400).json({error: safeParseResult.error})
    
    const {name, gitURL} = safeParseResult.data

    const project = await prisma.project.create({
        data:{
            name, gitURL, subDomain: generateSlug()
        }
    })

    return res.json({status:"success", data:{project}})


})

app.post('/deploy', async (req, res) => {

    const {projectId} = req.body

    const project = await prisma.project.findUnique({where:{id:projectId}})

    if (!project) return res.status(404).json({error:"Project not found"})

    const deployement  = await prisma.deployement.create({
        data: {
            project: {connect:{id:projectId}},
            status: 'QUEUED'
        }
    })
    
    // Spin the container
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: '',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: '',
                subnets: [''],
                securityGroups: ['']
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: '',
                    environment: [
                        { name: 'GIT_REPOSITORY_URL', value: project.gitURL },
                        { name: 'PROJECT_ID', value: projectId },
                        {name:'DEPLOYEMENT_ID', value: deployement.id}
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command);

    return res.json({ status: 'queued', data: { projectSlug, url: `http://${projectSlug}.localhost:8000` } })

})


async function initRedisSubscribe() {
    console.log('Subscribed to logs....')
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message)
    })
}


initRedisSubscribe()

app.listen(PORT, () => console.log(`API SERVER RUNNING ON ${PORT}`))