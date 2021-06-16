import * as RL from "serverline"
import * as Discord from "discord.js"
import * as path from "path"
import * as fs from "fs"
import {constants} from "os";
import {
    AudioPlayer,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnection,
} from "@discordjs/voice";
import ytdl = require('ytdl-core');
import {VoiceChannel} from "discord.js";


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
    console.log(`MoosicBot Error ${code} : ${text}`)
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
    static saveFilePath:string = "./guild_contexts_data.json"

    static contexts: {[guildId:string]:BotGuildContextInstance} = {}

    static getContext(guildId:string){
        if (!(guildId in this.contexts)){
            this.contexts[guildId] = new BotGuildContextInstance()
            return this.contexts[guildId]
        }
        return this.contexts[guildId]
    }

    static save(){
        let data = JSON.stringify(this.contexts)
        fs.writeFileSync(this.saveFilePath,data,{encoding:"utf-8"})
    }

    static load():void{
        console.log("BotGuildContextManager: loading savefile.")

        if (fs.existsSync(this.saveFilePath))
        {
            let rawdata = fs.readFileSync(this.saveFilePath,{encoding:"utf-8"})
            let parsed = JSON.parse(rawdata)
            for (let key in parsed) {
                let value = parsed[key]

                this.contexts[key] = BotGuildContextInstance.loadFromJson(value)
            }

        }

    }
}


export class BotGuildContextInstance{
    isplaying = false
    curentTime=[]
    playlist=[]
    voiceChannelId:null|Discord.Snowflake=null // id of channel to play in
    voiceChannelConnection: VoiceConnection|null = null
    audioPlayer: AudioPlayer = createAudioPlayer({})

    constructor() {
    }

    static loadFromJson(data):BotGuildContextInstance{
        let o = new BotGuildContextInstance()
        o.voiceChannelId=data.voiceChannelId
        return o
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

    play(yt_link:string){
        if (this.voiceChannelConnection===null) {
            console.log("Internal Error: There is no voiceChannelConnection [null]")
            return
        }
        if (yt_link === undefined || yt_link === null){
            console.error("Internal error when attempting to play link. Link is undefined or null")
            return;
        }

        console.log("playing youtube video :",yt_link)

        let resource = createAudioResource(ytdl(yt_link))

        this.audioPlayer.play(resource)

    }

    joinChannel(msg,callback:(player:AudioPlayer)=>void|null=null){
        if (this.voiceChannelId===null){
            replyError("403 VoiceChannel not set","A voice channel was not set for MoosicBot to join. Set one with setChannel [name]",msg)
            return
        }
        else{
            msg.guild.channels.fetch(this.voiceChannelId).then((channel:VoiceChannel)=>{
                if (channel===null){
                    replyError("500",`Internal Server Error. VoiceChannel is null [id:${this.voiceChannelId}]`,msg)
                    return;
                }

                if (!channel.joinable){
                    replyError("403 Channel Join Forbidden",`MoosicBot is unable to join the set VoiceChannel (${channel.name})`,msg)
                    return
                }
                let connection = joinVoiceChannel(
                    {
                        channelId:channel.id,
                        guildId:channel.guild.id,
                        adapterCreator:channel.guild.voiceAdapterCreator
                    }
                )

                this.voiceChannelConnection=connection
                connection.subscribe(this.audioPlayer)

                if (callback !== null){
                    callback(this.audioPlayer)
                }

            })
        }
    }
}