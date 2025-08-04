"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = exports.uploadtoS3 = exports.uploadDist = exports.buildProject = exports.downloadS3Folder = void 0;
const aws_sdk_1 = require("aws-sdk");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const s3 = new aws_sdk_1.S3({
    accessKeyId: "5c9bc9e50aaaf87b6865a9713e677b23",
    secretAccessKey: "c48f90ef283e5bfaee5e155871e21e7c330ad70723414094d32f06b85318ec46",
    endpoint: "https://9cc11f097f8f34d3068ff468db11d7a0.r2.cloudflarestorage.com"
});
function downloadS3Folder(prefix) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log(prefix);
        const allFiles = yield s3.listObjectsV2({
            Bucket: "vercel-bucket",
            Prefix: prefix
        }).promise();
        console.log(allFiles);
        const allPromises = ((_a = allFiles.Contents) === null || _a === void 0 ? void 0 : _a.map((_b) => __awaiter(this, [_b], void 0, function* ({ Key }) {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (!Key) {
                    resolve("");
                    return;
                }
                const finalOutputPath = path_1.default.join(__dirname, Key);
                const outputFile = fs_1.default.createWriteStream(finalOutputPath);
                const dirName = path_1.default.dirname(finalOutputPath);
                if (!fs_1.default.existsSync(dirName)) {
                    fs_1.default.mkdirSync(dirName, { recursive: true });
                }
                const downloadStream = s3.getObject({ Bucket: "vercel-bucket", Key }).createReadStream();
                outputFile.on('finish', resolve);
                downloadStream.pipe(outputFile);
            }));
        }))) || [];
        console.log("awaiting");
        yield Promise.all(allPromises === null || allPromises === void 0 ? void 0 : allPromises.filter(x => x !== undefined));
    });
}
exports.downloadS3Folder = downloadS3Folder;
function buildProject(id) {
    return new Promise((resolve) => {
        var _a, _b;
        const child = (0, child_process_1.exec)(`cd ${path_1.default.join(__dirname, `output/${id}`)} && npm install && npm run build`);
        (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
            console.log('stdout: ' + data);
        });
        (_b = child.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        child.on('close', function (code) {
            resolve("");
        });
    });
}
exports.buildProject = buildProject;
const uploadDist = (id) => {
    const allFiles = (0, exports.getAllFiles)(path_1.default.join(__dirname, `output/${id}/dist`));
    allFiles.forEach((file) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, exports.uploadtoS3)(`dist/${id}` + file.slice(__dirname.length + 23), file); }));
};
exports.uploadDist = uploadDist;
const uploadtoS3 = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield fs_1.default.readFileSync(localFilePath);
    const response = yield s3.upload({
        Body: content,
        Bucket: "vercel-bucket",
        Key: fileName,
    }).promise();
});
exports.uploadtoS3 = uploadtoS3;
const getAllFiles = (folderPath) => {
    let allfiles = [];
    const filesinfolder = fs_1.default.readdirSync(folderPath);
    filesinfolder.forEach((file) => {
        const fullPath = path_1.default.join(folderPath, file);
        fs_1.default.statSync(fullPath).isDirectory() ? (allfiles = allfiles.concat((0, exports.getAllFiles)(fullPath))) : (allfiles.push(fullPath));
    });
    return allfiles;
};
exports.getAllFiles = getAllFiles;
