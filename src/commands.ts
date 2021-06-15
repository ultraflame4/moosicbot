import * as Discord from "discord.js"

import {BotGuildContextManager, replySuccess, replyError} from "./core"
import {ButtonInteraction} from "discord.js";

type CommandCallback = (args:string[],msg:Discord.Message)=>void

export class Commands{
    static commandsMap: { [name:string]: CommandCallback } = {}
    static cmdNotFoundErr: (args:string[],msg:Discord.Message)=>void|null = null

    static addCommand(name:string,callback:CommandCallback){
        this.commandsMap[name]=callback
        console.log(`Commands Handler :  Registered ${name} command.`)
    }

    static setErrorHandler(callback:CommandCallback){
        this.cmdNotFoundErr = callback
    }

    static commandExists(name){
        return name in this.commandsMap
    }


    static evalAndExecute(command:string,args:string[],msg:Discord.Message) {
        if (!this.commandExists(command)){
            this.cmdNotFoundErr(args,msg)
        }
        else {
            this.commandsMap[command](args,msg)
        }
    }
}

Commands.setErrorHandler((args, msg) => {
    replyError("404 Command Not Found","This command does not exist",msg);
})

Commands.addCommand("ping",((args, msg) => {
    msg.reply("Pong!")
}))


Commands.addCommand("menu",(args, msg) => {

    let botGuildCtx=BotGuildContextManager.getContext(msg.guild.id)

    let embed = new Discord.MessageEmbed()
        .setColor("#964B00")
        .addField("Currently Playing","none")
        .addField("Time Left:",botGuildCtx.formatPlaybar())


    let skip_back = new Discord.MessageButton({
        label: "",
        style: "SECONDARY",
        customID:"skip-back-button",
        emoji:"<<"})


    let play_pause = new Discord.MessageButton({
            label: "",
            style: "SECONDARY",
            customID:"play-pause-button",
            emoji:"▷"
        })

    let skip_front = new Discord.MessageButton({
        label: "",
        style: "SECONDARY",
        customID:"skip-forward-button",
        emoji:">>"
    })

    let row = new Discord.MessageActionRow().addComponents([
        skip_back,play_pause,skip_front
    ]);

    msg.channel.send({
        embeds: [embed],
        components: [row]
    }).then(message=>{

        const collector = message.createMessageComponentInteractionCollector((i)=>i.isButton(),{idle:300000})

        collector.on("collect",(interaction:ButtonInteraction)=>{
            switch (interaction.customID){
                case "skip-back-button":
                    break

                case "play-pause-button":
                    botGuildCtx.togglePlaying()
                    embed.fields[1].value = botGuildCtx.formatPlaybar()
                    break

                case "skip-forward-button":
                    break

                default:
                    break
            }
            interaction.update({
                embeds:[embed],
                components: [row]
            })
        })

    })
})

Commands.addCommand("setChannel",(args, msg) => {
    let channelName = args[0]
    let target_channel = msg.guild.channels.cache.find(channel => channel.name===channelName && channel.type==="voice")

    if (target_channel===undefined){
        replyError("505 VoiceChannel not found",`MoosicBot cannot find VoiceChannel of ${channelName} in your server`,msg)
        return
    }

    BotGuildContextManager.getContext(msg.guild.id).setChannel(target_channel)
    replySuccess("Successfully set VoiceChannel",`MoosicBot has successfully set the VoiceChannel to join to ${channelName}`,msg)
})

Commands.addCommand("join",(args, msg)=>{
    let guildCtx = BotGuildContextManager.getContext(msg.guild.id)
    if (guildCtx.voiceChannelId===null){
        replyError("403 VoiceChannel not set","A voice channel was not set for MoosicBot to join. Set one with setChannel [name]",msg)
        return
    }
    else{
        return;
    }
})