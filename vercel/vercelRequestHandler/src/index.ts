import express from "express";
import {createClient} from "redis";

const app = express();

const subscriber = createClient();

subscriber.connect();

while(1){
    
}