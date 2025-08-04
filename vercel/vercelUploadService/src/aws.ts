import {S3} from "aws-sdk";
import fs from "fs";

const s3 = new S3({
    accessKeyId:"5c9bc9e50aaaf87b6865a9713e677b23",
    secretAccessKey:"c48f90ef283e5bfaee5e155871e21e7c330ad70723414094d32f06b85318ec46",
    endpoint:"https://9cc11f097f8f34d3068ff468db11d7a0.r2.cloudflarestorage.com"
})



export const uploadtoS3 = async(fileName:string, localFilePath:string) => {

    const content = await fs.readFileSync(localFilePath);

    const response = await s3.upload({
        Body: content,
        Bucket:"vercel-bucket",
        Key:fileName,
    }
    ).promise();
}
