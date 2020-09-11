const Discord = require('discord.js')
const bot = new Discord.Client()
const fs = require("fs")
const cat = require('./sav.json')

var prefix = "/"

const {
    TokenOropo
} = require("./config")


var helpEmbed

bot.on('ready', function () {

    helpEmbed = new Discord.MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle('Help  (TODO : LES PERMISSIONS ET LES GUILDS)')
    .setThumbnail(bot.user.avatarURL())
    .addField(prefix+'add', 'Ajoute le channel vocal actuel dans la liste des channels "se dédoublant"', true)
    .addField(prefix+'del', 'Retire le channel vocal actuel dans la liste des channels "se dédoublant"', true)
    .addField(prefix+'prefix', 'bha... change le prefixe', true)
    .addField('-', 'github : [sangi](https://jujulodace.github.io)', false)
    .setFooter("Tout ce qui est présent ici est susceptible de bouger. le Bot est extrêmement récent, et est susceptible de voir des changements dans sa base de données. en soi, il est possible que le préfixe se réinitialise sur '/' ou que les channels ne se multiplient plus (refaire "+prefix+"add) ")
})
bot.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
    cat[guild.id] = {};
    cat[guild.id].prefix ="/";
    cat[guild.id].general = guild.channels.cache.filter(channel => channel.type === "text").first().id;
    cat[guild.id].channels = {};
    fs.writeFileSync("sav.json", JSON.stringify(cat))
    console.log( guild.channels.cache.get(cat[guild.id].general))
    guild.channels.cache.get(cat[guild.id].general).send("le channel par default du bot est celui ci, pour changer, merci d'écrire /default dans le channel approprié")
  
});


bot.on('message', function (message) {
    mes = message.content.split(" ");
    if (mes[0] == prefix + "add") {
        addchannel(message.author.id,message.guild)
    } else if (mes[0] == prefix + "del") {
        delchannel(message.author.id,message.guild)
    } else if (mes[0] == prefix + "prefix") {
        prefix = mes[1]
        message.channel.send("le nouveau prefix est" + mes[1])
    } else if (mes[0] == prefix + "help") {
        help(message)
    }
    
    if (message.channel.name == "terminal" && message.author.id == "191277501035708417") {
        try {
            message.channel.send(eval(message.content))
        }
        catch (error) {
            console.error("error terminal discord" + error)
            message.channel.send("error terminal discord" + error)
        }
    }
})
bot.on('voiceStateUpdate', (oldState, newState) => {
    let channelJoin = newState.channel
    let channelLeave = oldState.channel
    if (channelJoin !== null) {
        var vide = 0;
        for (var channel in cat[oldState.guild.id].channels) {
            console.log(cat[oldState.guild.id].channels[channel][0]+"oui")
            if (cat[oldState.guild.id].channels[channel] != null && cat[oldState.guild.id].channels[channel].id.indexOf(channelJoin.id) != -1) {
                channelSubber = cat[oldState.guild.id].channels[channel].id[0]
                for (var i = 0; i < cat[oldState.guild.id].channels[channel].id.length - 1; i++) {
                    if (channelJoin.guild.channels.cache.get(cat[oldState.guild.id].channels[channel].id[i]).members.first(1)[0] == undefined) {
                        vide++;
                    }
                }
                console.log(vide)
                if (vide == 0) {
                    makeSubChannel(channelJoin.name, channelJoin.parentID, channel,channelJoin.guild)
                }
            }
        }
    }
    if (channelLeave !== null) {
        for (var channel in cat[oldState.guild.id].channels) {
            if (cat[oldState.guild.id].channels[channel] != null && cat[oldState.guild.id].channels[channel].id.indexOf(channelLeave.id) != -1) {
                if (cat[oldState.guild.id].channels[channel].id.length >= 2 && channelLeave.guild.channels.cache.get(channelLeave.id).members.first(1)[0] == undefined) {
                    channelLeave.guild.channels.cache.get(channelLeave.id).delete()
                    cat[oldState.guild.id].channels[channel].id.splice(cat[oldState.guild.id].channels[channel].id.indexOf(channelLeave.id), 1)
                    fs.writeFileSync("sav.json", JSON.stringify(cat))
                    if (cat[oldState.guild.id].channels[channel].id.length == 1 && channelJoin != null && channelJoin.name == channelLeave.name)
                        makeSubChannel(channelLeave.name, channelLeave.parentID, channel,channelLeave.guild)
                }
            }
        }
    }
})
function addchannel(author,serveur) {
    console.log(cat[serveur.id].guilds)
    serveur.channels.cache.forEach(element => {
        if (element.type == "voice" && element.members.get(author) != null) {
            var exist = 0
            for (var channel in cat[serveur.id].channels) {
                if (cat[serveur.id].channels[channel] != null && cat[serveur.id].channels[channel].id.indexOf(element.id) != -1)
                    exist = 1
            }
            if (exist == 0) {
                console.log(cat)
                cat[serveur.id].channels[element.id] = {}
                cat[serveur.id].channels[element.id].id = [element.id]
                cat[serveur.id].channels[element.id].name = element.name
                cat[serveur.id].channels[element.id].userLimit = element.userLimit
                makeSubChannel(element.name, element.parentID, element.id,serveur)
                console.log([serveur.id])
                serveur.channels.cache.get(cat[serveur.id].general).send("channel add")
            }
        }
    });
}
function delchannel(author,serveur) {
    serveur.channels.cache.forEach(element => {
        if (element.type == "voice" && element.members.get(author) != null) {
            for (var channel in cat[guild.id].channels) {
                if (cat[guild.id].channels[channel] != null && cat[guild.id].channels[channel].id.indexOf(element.id) != -1 && cat[guild.id].channels[channel].id.length > 1) {
                    for (var i = 1; i < cat[guild.id].channels[channel].id.length; i++) {
                        serveur.channels.cache.get(cat[guild.id].channels[channel].id[i]).delete()
                    }
                    delete cat[guild.id].channels[channel]
                    fs.writeFileSync("sav.json", JSON.stringify(cat))
                    
                    serveur.channels.get(cat[guild.id].guilds[serveur.id].general).send("channel retiré")
                }
            }
        }
    });
}
function makeSubChannel(name, parent, groupeSubber,serveur) {
    serveur.channels.create(name, { type: "voice" })
        .then(channel => {
            if (parent)
                channel.setParent(serveur.channels.cache.get(parent))
            setTimeout(function () {
                var position = 10000;
                for (var i = 0; i < cat[serveur.id].channels[groupeSubber].id.length - 1; i++) {
                    if (serveur.channels.cache.get(cat[serveur.id].channels[groupeSubber].id[i]).position < position) {
                        position = serveur.channels.cache.get(cat[serveur.id].channels[groupeSubber].id[i]).position
                    }
                }
                setTimeout(function () {
                    channel.setPosition(position)
                }, 500);
                channel.setUserLimit(cat[serveur.id].channels[groupeSubber].userLimit)
                fs.writeFileSync("sav.json", JSON.stringify(cat))
            }, 500);
            cat[serveur.id].channels[groupeSubber].id.push(channel.id)
        })
        .catch(console.error);
}
const help = (message) => message.channel.send(helpEmbed)



bot.login(TokenOropo);