"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFiles = exports.generate = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generate = () => {
    const strings = "0123456789abcdefghijklmnopqrstuvwxyz";
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += strings[Math.floor(Math.random() * strings.length)];
    }
    return id;
};
exports.generate = generate;
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
