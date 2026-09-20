const { Client, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');
const mysql = require('mysql');
const chalk = require('chalk');
const express = require("express");
const figlet = require('figlet');
const axios = require('axios');
const config = require('../config.js');
const pjson = require('../package.json');
require('hyperz-verbatim').setExtension('.hyperz');

let useSQL = true; // DO NOT CHANGE THIS UNLESS YOU KNOW WHAT YOU ARE DOING
let con;

class HDClient extends Client {
    constructor(options = {}) {
        super(options);

        this.config = require(`../config.js`);
        this.utils = require(`./utils/utils.js`);
        this.discord = require('discord.js');

        this.pages = [
            // user
            "`ping` - Check the bots latency.\n`help` - View the bots commands.\n`invite` - Get the bots invite link.\n`search` - Check if a user is banned.\n`report` - Report a user to the database.\n`appeal` - Appeal a ban from the database.\n`credits` - View the creators of the bot.\n",
            // admin
            "`settings` - Change this guilds settings.",
            // owner
            "`ban` - Ban a user in the database.\n`unban` - Remove a ban from the database.\n`modify` - Alter a ban within the database.\n`announce` - Send out an announcement to all guilds.\n`staffadd` - Add a staff member.\n`staffremove` - Remove a staff member.",
            // credits
            `**Creators:**\n[@Hyperz](https://github.com/itz-hyperz) - *Head project developer.*\n[@Jordan2139](https://discord.com/users/802459473612505099) - *Project developer.*\n[@Sandwich](https://discord.com/users/561341615759949834) - *Design ideas.*`
        ];
    };
};

const client = new HDClient({
    intents: ['GUILDS', 'GUILD_MESSAGES', "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_INTEGRATIONS", "GUILD_WEBHOOKS", "GUILD_INVITES", "GUILD_VOICE_STATES", "GUILD_PRESENCES", "GUILD_MESSAGE_TYPING", "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING"],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'ROLE', "GUILD_MEMBER", "USER", "GUILD_INVITES", "MANAGE_GUILD"],
    allowedMentions: { parse: ['users', 'roles', 'everyone'], repliedUser: true }
});

client.refreshButton = new client.discord.MessageActionRow().addComponents(
    new client.discord.MessageButton()
    .setLabel('Refresh')
    .setStyle('SUCCESS')
    .setCustomId('refresh')
);
global.__basedir = __dirname;

setTimeout(function() {
    const version = Number(process.version.split('.')[0].replace('v', ''));
    if (version < 16) return console.log(chalk.blue('\n\nPlease upgrade to Node v16 or higher\nPlease upgrade to Node v16 or higher\nPlease upgrade to Node v16 or higher\n\n'));
}, 8000);

const init = async function() {
    let font = await client.utils.maths(["Graffiti", "Standard", "Varsity", "Stop", "Speed", "Slant", "Pagga", "Larry 3D"])
    figlet.text('Ban Database', { font: font, width: 700 }, function(err, data) {
        if(err) throw err;
        let str = `${data}\n-------------------------------------------`
        console.log(chalk.bold(chalk.blueBright(str)));
    });
    try {
        client.login(client.config.token).catch(function(e) { console.log(e) });
        if (useSQL) {
            try {
                const stuff = client.config.database
                con = mysql.createConnection(stuff)
                setTimeout(function() {
                    console.log(`${chalk.yellowBright('[SQL Manager]')} MySQL Successfully Connected!`)
                }, 4000);
                con.on('enqueue', function () {
                    if(client.config.debugmode) {
                        console.log(`${chalk.yellowBright('[SQL Manager]')} Waiting for available connection slot`);
                    }
                });
                con.on('release', function (connection) {
                    if(client.config.debugmode) {
                        console.log(`${chalk.yellowBright('[SQL Manager]')} Connection %d released`, connection.threadId);
                    }
                });
                // License system here ig
            } catch (e) {
                client.utils.error(client, e)
                return process.exit(1);
            }
        }

        const app = express()
        app.listen(client.config.port)

        // Ready File Handling Slash Commands

        // Event handler
        const events = readdirSync(join(__dirname, `./`, `events`));
        events.forEach(function(e) {
            const name = e.split('.')[0];
            const event = require(`./events/${e}`);
            client.on(name, event.bind(null, client, con));
            delete require.cache[require.resolve(`./events/${e}`)];
        });

        setTimeout(async function() {
            let currver = require('../package.json').version
            let request = await axios({
                method: 'get',
                url: `https://raw.githubusercontent.com/Itz-Hyperz/version-pub-api/main/versions.json`,
                headers: {Accept: 'application/json, text/plain, */*','User-Agent': '*' }
            });
            let latestver = request.data.ban_database
            if(latestver != currver) {
                console.log(`${chalk.blueBright(`[Version Manager]`)} ${chalk.red(`You are not on the latest version. Current Version: ${chalk.yellow(currver)} | Latest Version: ${chalk.blueBright(latestver)}`)}`)
            } else {
                console.log(`${chalk.blueBright(`[Version Manager]`)} You are on the latest version - ${chalk.white(currver)}`)
            }

            setTimeout(function() {
                // Extension Handler
                const extensions = readdirSync(join(__dirname, `./`, `extensions`));
                for(let ext of extensions) {
                    const extName = ext.split('.')[0];
                    console.log(`${chalk.magentaBright('[Extension Manager]')} ${extName} - Loaded`);
                    require(`./extensions/${ext}`)(client, con, app);
                };
            }, 3000)
        }, 150)
    } catch(e) {
        console.log(e)
    }
}

process.on('unhandledRejection', function(err) { 
    let ignore = [
        "].type: This field is required",
        "Unknown Message",
        "Cannot find module '../components/"
    ];
    let stillLog = true;
    ignore.forEach(function(e) {
        if(err.toString().includes(e)) {
            stillLog = false;
        }
    })
    if(!stillLog) return;
    console.log(chalk.red(`\nFATAL ERROR: \n\n`, err.stack))
});

exports.init = init;