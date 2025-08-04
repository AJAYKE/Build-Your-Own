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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const utils_1 = require("./utils");
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    while (true) {
        try {
            const response = yield subscriber.brPop((0, redis_1.commandOptions)({ isolated: true }), "build-queue", 0);
            //@ts-ignore
            const id = response.element;
            console.log(`Downloading files for project ID: ${id}`);
            yield (0, utils_1.downloadS3Folder)(`output/${id}`);
            console.log(`Building project for ID: ${id}`);
            yield (0, utils_1.buildProject)(id);
            yield (0, utils_1.uploadDist)(id);
            console.log(response);
        }
        catch (error) {
            console.error("Error occurred in main loop:", error);
        }
    }
});
main();
