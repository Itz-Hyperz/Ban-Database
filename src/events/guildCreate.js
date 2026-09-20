module.exports = async function(client, con, guild) {
    await client.utils.guildAdd(client, con, guild.id);

    let randomChannel = guild.systemChannel || guild.channels.cache.filter((x) => x.type === 'GUILD_TEXT').random(1)[0];
    if(randomChannel) {
        let welcomeEmbed = new client.discord.MessageEmbed()
        .setColor(client.config.themeColor || '#FFFFFF')
        .setTitle('Thanks for the Invitation!')
        .setURL(client.config.website.domain)
        .setThumbnail(client.user.avatarURL({ dynamic: true }))
        .setDescription(`Hello there, I'm **${client.user.username}**, a bot that protects you and this community from the toxicity here on Discord! We are the next generation of security on Discord. Need protection? We've got you covered!\n\nAre you interested in a bot like me? Are you sick and tired of leakers, raiders, and people who violate your community rules? Click [this link](https://github.com/itz-hyperz/Ban-Database) to get started!`)
        await randomChannel.send({ embeds: [welcomeEmbed] }).catch(e => {});
    };

    if(client.config.guildLogs == "") return;
    let embed = new client.discord.MessageEmbed()
    .setColor('#041014')
    .setTitle('📥 Guild Joined!')
    .setDescription(`**○ Name:** ${guild.name}\n**○ Id:** \`${guild.id}\``)
    .setTimestamp()
    .setFooter({ text: '❤️ Ban DB - Hyperz#0001' })
    let channel = await client.channels.cache.get(client.config.guildLogs)
    if(channel != undefined) {
        await channel.send({ embeds: [embed] }).catch(function(e) { if(client?.config?.debugmode) console.log(e) });
    };
}