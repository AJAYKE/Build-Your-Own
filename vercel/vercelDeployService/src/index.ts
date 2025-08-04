import {createClient, commandOptions} from "redis";
import { buildProject, downloadS3Folder, getAllFiles, uploadDist } from "./utils";
import path from "path";

const subscriber = createClient();
subscriber.connect();

const main = async () => {
    while (true) {
        try {
            const response = await subscriber.brPop(commandOptions({ isolated: true }), "build-queue", 0);
            //@ts-ignore
            const id = response.element;
            console.log(`Downloading files for project ID: ${id}`);
            await downloadS3Folder(`output/${id}`);
            console.log(`Building project for ID: ${id}`);
            await buildProject(id);
            await uploadDist(id);
            console.log(response);
        } catch (error) {
            console.error("Error occurred in main loop:", error);
        }
    }
};

main();
