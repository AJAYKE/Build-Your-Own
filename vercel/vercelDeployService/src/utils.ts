import { S3 } from "aws-sdk";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const s3 = new S3({
    accessKeyId:"5c9bc9e50aaaf87b6865a9713e677b23",
    secretAccessKey:"c48f90ef283e5bfaee5e155871e21e7c330ad70723414094d32f06b85318ec46",
    endpoint:"https://9cc11f097f8f34d3068ff468db11d7a0.r2.cloudflarestorage.com"
})

export async function downloadS3Folder(prefix: string) {
    console.log(prefix)
    
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel-bucket",
        Prefix: prefix
    }).promise();
    
    console.log(allFiles);
    
    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            const downloadStream = s3.getObject({ Bucket: "vercel-bucket", Key }).createReadStream();
            outputFile.on('finish', resolve);
            downloadStream.pipe(outputFile);

        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
}

export function buildProject(id: string) {
    return new Promise((resolve) => {
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`)

        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
           resolve("")
        });

    })
}


export const uploadDist = (id:string) => {
    const allFiles = getAllFiles(path.join(__dirname, `output/${id}/dist` ));
    allFiles.forEach(async file => await uploadtoS3(`dist/${id}` + file.slice(__dirname.length + 23), file))
}

export const uploadtoS3 = async(fileName:string, localFilePath:string) => {

    const content = await fs.readFileSync(localFilePath);

    const response = await s3.upload({
        Body: content,
        Bucket:"vercel-bucket",
        Key:fileName,
    }
    ).promise();
}


export const getAllFiles = (folderPath:string) => {
    let allfiles:string[] = []
    
    const filesinfolder = fs.readdirSync(folderPath);
    
    filesinfolder.forEach((file) => {
        const fullPath = path.join(folderPath, file);
        
        fs.statSync(fullPath).isDirectory() ? (
            allfiles = allfiles.concat(getAllFiles(fullPath))
        ) : (
            allfiles.push(fullPath)
        )

    })

    return allfiles;
}

