import * as RL from "serverline"
import * as Discord from "discord.js"

export function init_serverline(client){
    RL.init()
    RL.setPrompt('-> ')
    RL.setCompletion(['stop'])

    RL.on('line',(line:string)=>{
        if (line === "stop")
        {
            stop(client)
        }
    })

    RL.on("STGINT",(rl)=>{
        stop(client)
    })

}


function stop(client){
    console.log("Stopping MoosicBot...")
    RL.close()
    client.destroy()
    console.log("Process stopped.")
    process.exit(0)
}

export function pingUserFormatter(user:Discord.User) {
    return `<@!${user.id}>`
}

export function replyError(code:string,text:string,msg:Discord.Message) {
    let embed = new Discord.MessageEmbed()
        .setColor("#b50404")
        .setTitle("Error "+code)
        .setDescription(text)
    msg.reply({embeds:[embed]})
}

export function replySuccess(title:string, text:string, msg:Discord.Message){
    let embed = new Discord.MessageEmbed()
        .setColor("#8eab00")
        .setTitle(title)
        .setDescription(text)
    msg.reply({embeds:[embed]})
}

export class BotGuildContextManager{
    static contexts: {[guildId:string]:BotGuildContextInstance} = {}

    static getContext(guildId:string){
        console.log("Guild COntexts",this.contexts)

        if (!(guildId in this.contexts)){
            this.contexts[guildId] = new BotGuildContextInstance()
            return this.contexts[guildId]
        }
        return this.contexts[guildId]

    }
}

export class BotGuildContextInstance{
    isplaying = false
    curentTime=[]
    playlist=[]
    voiceChannelId=null // id of channel to play in

    constructor() {
    }

    formatPlaybar(){
        let icon;

        if (this.isplaying){icon = " ▷ "} else{icon = "l l"}

        return icon+" "+"[--------------------------------]"
    }

    togglePlaying(){
        this.isplaying = !this.isplaying
    }

    setChannel(channeldId){
        this.voiceChannelId=channeldId
    }
}