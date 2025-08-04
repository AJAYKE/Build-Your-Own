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
exports.uploadtoS3 = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const s3 = new aws_sdk_1.S3({
    accessKeyId: "5c9bc9e50aaaf87b6865a9713e677b23",
    secretAccessKey: "c48f90ef283e5bfaee5e155871e21e7c330ad70723414094d32f06b85318ec46",
    endpoint: "https://9cc11f097f8f34d3068ff468db11d7a0.r2.cloudflarestorage.com"
});
const uploadtoS3 = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield fs_1.default.readFileSync(localFilePath);
    const response = yield s3.upload({
        Body: content,
        Bucket: "vercel-bucket",
        Key: fileName,
    }).promise();
});
exports.uploadtoS3 = uploadtoS3;
