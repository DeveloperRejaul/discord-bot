import { Logger } from "tslog";
import {createStream} from "rotating-file-stream";

const stream = createStream("discord-bot.log", {
  size: "10M", // rotate every 10 MegaBytes written
  interval: "1d", // rotate daily
  compress: "gzip" // compress rotated files
});

export const log =new Logger ({
    name:"discord-bot",
    type:"pretty",
    prettyLogTimeZone:"local",
    attachedTransports:[(logObj)=>{
        stream.write(JSON.stringify(logObj) + '\n')
    }]
}) 