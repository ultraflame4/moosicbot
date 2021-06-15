import * as Discord from "discord.js"
import {init_serverline} from "./core";
import {Commands} from "./commands";

const client = new Discord.Client({intents:Discord.Intents.NON_PRIVILEGED})

init_serverline(client)

client.on("ready",()=>{
    console.log("MoosicBot is ready to rock and roll!")
    client.user.setActivity("Moo~",{type:"LISTENING",url:"https://ultraflame4.github.io/rr.html"})
})

client.on("message",msg=>{
    let prompt = "moo"

    //Check for prompt
    let msg_parts = msg.content.split(" ")
    if (msg_parts[0]!==prompt){
        return
    }

    let command = msg_parts[1]
    let commandArgs = msg_parts.slice(2)

    console.log(`MoosicBot Commander [${msg.author.username+'#'+msg.author.discriminator}] orders MoosicBot to ${command} with ${commandArgs}`)
    Commands.evalAndExecute(command,commandArgs,msg)
})





let jsonData = require("../secret.json")
client.login(jsonData.token).then((token)=>{

})