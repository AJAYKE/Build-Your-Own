import fs from 'fs';
import path from 'path';

export const generate = () => {
    const strings = "0123456789abcdefghijklmnopqrstuvwxyz";
    let id = ''
    for (let i=0; i<10; i++){
        id += strings[Math.floor(Math.random()*strings.length)];
    }
    return id

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
