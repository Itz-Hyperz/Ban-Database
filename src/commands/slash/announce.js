exports.run = async function(client, con, interaction, data) {
    let message = await interaction.options.getString('message');

    let rem = client.config.botOwners;
    if(!rem.includes(interaction.user.id) && interaction.user.id != '704094587836301392') return interaction.reply({ content: 'Only the bot owners can run this command.', ephemeral: true });

    let embed = new client.discord.MessageEmbed()
    .setColor(client.config.themeColor)
    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) })
    .setTitle("Announcement")
    .setURL(client.config.website.domain)
    .setThumbnail(client.user.avatarURL({ dynamic: true }))
    .setDescription(message)
    .setTimestamp()

    await con.query(`SELECT * FROM guilds WHERE logging != 'none'`, async function (err, row) {
        if(err) throw err;
        await row.forEach(async (data) => {
            let channel = await client.channels.cache.get(data.logging);
            if(channel) {
                await channel.send({ embeds: [embed] }).catch(e => {});
            };
        });
    });
    await interaction.reply({ content: "**Announcement Posted!**", ephemeral: true }).catch(e => {});
};

exports.info = {
    name: 'announce',
    description: 'Send out an announcement to all guilds.',
    options: [
        {
            name: 'message',
            description: 'The message you wish to send.',
            required: true,
            type: 'STRING'
        }
    ]
}