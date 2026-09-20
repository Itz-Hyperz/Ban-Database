const { readdirSync } = require('fs');
const { join } = require('path');
const chalk = require('chalk');
const ms = require('ms');
module.exports = async(client, con, ready) => {
    // Presence Settings
    setInterval(async () => {
        try {
            await con.query(`SELECT * FROM bannedusers WHERE active=true`, async function (err, bans) {
                let presence = client.config.presence;
                await client.user.setPresence({
                activities: [
                    {
                    name: presence.name.replaceAll(/{users}/g, client.users.cache.size).replaceAll(/{guilds}/g, `${client.guilds.cache.size}`).replaceAll(/{bans}/g, bans.length),
                    type: presence.type,
                    },
                ],
                status: presence.status,
                });
            });
        } catch(e) {}
    }, 60000);
    // DB Ping
    setInterval(async () => {
        await con?.ping();
    }, ms('24m'));
    // Check DB for Guilds
    await client.guilds.cache.forEach(async function(guild) {
        await client.utils.guildAdd(client, con, guild.id);
    });
    // Load Slash Commands
    const commands = readdirSync(join(__dirname, `../`, `commands/slash`));
    for (let command of commands) {
        let cmd = require(`../commands/slash/${command}`);
        if (cmd.info.name) {
            client.application?.commands.create(cmd.info).catch(e => {
                console.log(e)
            })
        } else {
            console.log(`No help name or additional info found for slash command: ${command}`);
        }
    };
    console.log(`${chalk.green('[Invite Link]')} ${chalk.white(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)}`)
};