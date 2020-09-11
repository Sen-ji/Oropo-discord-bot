const Discord = require('discord.js')
const bot = new Discord.Client()
const fs = require("fs")
const cat = require('./sav.json')
cat.guilds = {}
var general;
var prefix = "/"

const {
    TokenOropo
} = require("./config")


var helpEmbed

bot.on('ready', function () {
    serveur = bot.channels.cache.get("682421626846969907").guild
    general = bot.channels.cache.get("687461489711382594")
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
    cat.guilds[guild.id] = {};
    cat.guilds[guild.id].prefix ="/";
    cat.guilds[guild.id].general = guild.channels.cache.first().id;
    guild.channels.cache.get(cat.guilds[guild.id].general).send("le channel par default du bot est celui ci, pour changer, merci d'écrire /default dans le channel approprié")

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
        }
    }
})
bot.on('voiceStateUpdate', (oldState, newState) => {
    let channelJoin = newState.channel
    let channelLeave = oldState.channel
    if (channelJoin !== null) {
        var vide = 0;
        for (var channel in cat) {
            if (cat[channel].id != undefined && cat[channel].id.indexOf(channelJoin.id) != -1) {
                channelSubber = cat[channel].id[0]
                for (var i = 0; i < cat[channel].id.length - 1; i++) {
                    if (channelJoin.guild.channels.cache.get(cat[channel].id[i]).members.first(1)[0] == undefined) {
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
        for (var channel in cat) {
            if (cat[channel].id != undefined && cat[channel].id.indexOf(channelLeave.id) != -1) {
                if (cat[channel].id.length >= 2 && channelLeave.guild.channels.cache.get(channelLeave.id).members.first(1)[0] == undefined) {
                    channelLeave.guild.channels.cache.get(channelLeave.id).delete()
                    cat[channel].id.splice(cat[channel].id.indexOf(channelLeave.id), 1)
                    fs.writeFileSync("sav.json", JSON.stringify(cat))
                    if (cat[channel].id.length == 1 && channelJoin != null && channelJoin.name == channelLeave.name)
                        makeSubChannel(channelLeave.name, channelLeave.parentID, channel)
                }
            }
        }
    }
})
function addchannel(author,serveur) {
    serveur.channels.cache.forEach(element => {
        if (element.type == "voice" && element.members.get(author) != null) {
            var exist = 0
            for (var channel in cat) {
                if (cat[channel].id != undefined && cat[channel].id.indexOf(element.id) != -1)
                    exist = 1
            }
            if (exist == 0) {
                cat[element.id] = {
                }
                cat[element.id].id = [element.id]
                cat[element.id].name = element.name
                cat[element.id].userLimit = element.userLimit
                makeSubChannel(element.name, element.parentID, element.id)
                general.send("channel add")
            }
        }
    });
}
function delchannel(author,serveur) {
    serveur.channels.cache.forEach(element => {
        if (element.type == "voice" && element.members.get(author) != null) {
            for (var channel in cat) {
                if (cat[channel] != null && cat[channel].id.indexOf(element.id) != -1 && cat[channel].id.length > 1) {
                    for (var i = 1; i < cat[channel].id.length; i++) {
                        serveur.channels.cache.get(cat[channel].id[i]).delete()
                    }
                    delete cat[channel]
                    fs.writeFileSync("sav.json", JSON.stringify(cat))
                    general.send("channel retiré")
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
                for (var i = 0; i < cat[groupeSubber].id.length - 1; i++) {
                    if (serveur.channels.cache.get(cat[groupeSubber].id[i]).position < position) {
                        position = serveur.channels.cache.get(cat[groupeSubber].id[i]).position
                    }
                }
                setTimeout(function () {
                    channel.setPosition(position)
                }, 500);
                channel.setUserLimit(cat[groupeSubber].userLimit)
                fs.writeFileSync("sav.json", JSON.stringify(cat))
            }, 500);
            cat[groupeSubber].id.push(channel.id)
        })
        .catch(console.error);
}
function help(message) {
    message.channel.send(helpEmbed)
}


bot.login(TokenOropo);