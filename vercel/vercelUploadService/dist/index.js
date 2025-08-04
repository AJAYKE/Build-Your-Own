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
const express_1 = __importDefault(require("express"));
const simple_git_1 = __importDefault(require("simple-git"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const aws_1 = require("./aws");
const redis_1 = require("redis");
const publisher = (0, redis_1.createClient)();
publisher.connect();
// uploadtoS3("package.json","/Users/ajsmac/Desktop/BuildYourOwn/vercel/dist/output/bv9y79it0w/package.json")
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// const token = "3FExYdSVghZq8eCTAna6yLNcqId2R6mLLjy4rDKw"
// const accessKeyId = ""
// const secretAccessKey = ""
// const s3endpoint = ""
app.get('/test', (req, res) => {
    return res.json("working");
});
app.post('/deployThisRepo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    const id = (0, utils_1.generate)();
    const cloneFolder = path_1.default.join(__dirname, `output/${id}`);
    yield (0, simple_git_1.default)().clone(repoUrl, cloneFolder);
    let listOfFiles = (0, utils_1.getAllFiles)(cloneFolder);
    listOfFiles.forEach((file) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, aws_1.uploadtoS3)(file.slice(__dirname.length + 1), file); }));
    setTimeout(() => { publisher.lPush("build-queue", id); }, 5000);
    res.json({ 'id': id, 'listOfFiles': listOfFiles });
}));
app.listen(3000);
