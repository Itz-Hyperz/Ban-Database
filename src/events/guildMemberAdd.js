module.exports = async(client, con, guildMember) => {
    await con.query(`SELECT * FROM guilds WHERE guildid='${guildMember.guild.id}'`, async (err, row) => {
        if(err) throw err;
        if(!row[0]) await client.utils.guildAdd(client, con, guildMember.guild.id);
        let data = row[0];
        await con.query(`SELECT * FROM bannedusers WHERE userid="${guildMember.user.id}" AND active=true`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) return;
            let user = guildMember.user;
            let staff = await client.users.fetch(row[0].bannedby);
            let title;
            if(data.autobans) {
                title = "Ban Enforced!";
                let embed = new client.discord.MessageEmbed()
                .setColor(client.config.themeColor)
                .setTitle("You were banned!")
                .setURL(row[0].proof)
                .setThumbnail(client.user.avatarURL({ dynamic: true }))
                .addFields(
                    { name: "__Banned User__", value: `**ID:** ${user.id}\n**Tag:** [||\`${user.tag}\`||](https://discord.com/users/${user.id})`, inline: true },
                    { name: "__Staff Member__", value: `**ID:** ${staff.id}\n**Tag:** [${staff.tag}](https://discord.com/users/${staff.id})`, inline: true },
                    { name: "Reason", value: `${row[0].reason}`, inline: false },
                )
                .setFooter({ text: `Ban ID: ${row[0].banid} | ${guildMember.guild.name}`, iconURL: client.user.avatarURL({ dynamic: true }) });
                await user?.send({ embeds: [embed] }).then(async () => {
                    await enforce(client, guild, { userid: user.id, reason: row[0].reason, proof: row[0].proof });
                }).catch(async e => {
                    await enforce(client, guild, { userid: user.id, reason: row[0].reason, proof: row[0].proof });
                });
            } else {
                title = "Banned User Joined!";
            };
            let log = await client.channels.fetch(data.logging);
            if(!log) return;
            let logEmbed = new client.discord.MessageEmbed()
            .setColor(client.config.themeColor)
            .setTitle(title)
            .setURL(row[0].proof)
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .addFields(
                { name: "__Banned User__", value: `**ID:** ${user.id}\n**Tag:** [||\`${user.tag}\`||](https://discord.com/users/${user.id})`, inline: true },
                { name: "__Staff Member__", value: `**ID:** ${staff.id}\n**Tag:** [${staff.tag}](https://discord.com/users/${staff.id})`, inline: true },
                { name: "Reason", value: `${row[0].reason}`, inline: false },
            )
            .setFooter({ text: `Ban ID: ${row[0].banid} | ${guildMember.guild.name}`, iconURL: client.user.avatarURL({ dynamic: true }) });
            await log.send({ embeds: [logEmbed] }).catch(function(e) { if(client?.config?.debugmode) console.log(e) });
        });
    });
};

async function enforce(client, guild, data) {
    await guild.members.ban(data.userid, {
        reason: `${data.reason} | ${data.proof} | ${client.user.tag}`
    }).catch(e => {
        if(client.config.debugmode) {
            console.log(`Guild Id: ${guild.id} failed to ban ${data.userid}.\n`, e.stack);
        }
    });
};