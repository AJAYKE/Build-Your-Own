const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')
const { Kafka } = require('kafkajs')  

const s3Client = new S3Client({
    region: '',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
})

const PROJECT_ID = process.env.PROJECT_ID
const DEPLOYEMENT_ID = process.env.DEPLOYEMENT_ID

const kafka = new Kafka({
    clientId: '',
    brokers: [''],
    ssl:{
        ca:[fs.readFileSync(path.join(__dirname,"kafka.pe,"),'utf-8')]
    },
    sasl:{
        username:'',
        password:"",
        mechanism:''
    }
  })

const producer = kafka.producer()

async function publishLog(log){
    await producer.send({topic:'container-logs', messages:[{key:'log', value: JSON.stringify({PROJECT_ID,  DEPLOYEMENT_ID, log})}]})
}


async function init() {
    console.log('Executing script.js')
    await producer.connect()

    await publishLog('Build Started')

    const outDirPath = path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', async function (data) {
        await publishLog(data.toString())
    })

    p.stdout.on('error', async function (data) {
        await publishLog(`Error: ${data.toString()}`)
    })

    p.on('close', async function () {
        await publishLog('Build Complete')
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })
        
        await publishLog("Starting to upload")
        
        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file)
            if (fs.lstatSync(filePath).isDirectory()) continue;

            await publishLog(`uploading: ${filePath}`)

            const command = new PutObjectCommand({
                Bucket: 'my-vercel-bucket',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })

            await s3Client.send(command)
            await publishLog(`Uploaded: ${filePath}`)
        }
        await publishLog('Done...')
    })
}

init()