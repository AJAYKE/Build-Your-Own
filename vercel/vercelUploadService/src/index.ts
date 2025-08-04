import express from 'express';
import simpleGit from 'simple-git';
import cors from "cors";
import path from "path";
import { generate, getAllFiles } from './utils';
import { uploadtoS3 } from './aws';
import { createClient } from "redis";
const publisher = createClient();


publisher.connect();

// uploadtoS3("package.json","/Users/ajsmac/Desktop/BuildYourOwn/vercel/dist/output/bv9y79it0w/package.json")
const app = express();
app.use(cors());
app.use(express.json())

// const token = "3FExYdSVghZq8eCTAna6yLNcqId2R6mLLjy4rDKw"
// const accessKeyId = ""
// const secretAccessKey = ""
// const s3endpoint = ""


app.get('/test',(req, res) => {
    return res.json("working")
})

app.post('/deployThisRepo', async(req,res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    const cloneFolder = path.join(__dirname,`output/${id}`);
    await simpleGit().clone(repoUrl, cloneFolder);
    let listOfFiles = getAllFiles(cloneFolder);
    listOfFiles.forEach(async file => await uploadtoS3(file.slice(__dirname.length + 1), file))
    
    setTimeout(() => {publisher.lPush("build-queue", id)},5000);
        
    res.json({'id': id, 'listOfFiles':listOfFiles})
})

app.listen(3000)