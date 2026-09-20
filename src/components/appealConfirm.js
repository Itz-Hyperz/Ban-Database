module.exports = async function(client, con, interaction, data) {
    let embed = interaction.message.embeds[0];
    let channel = await client.channels.cache.get(client.config.appealLogs)

    let buttons = new client.discord.MessageActionRow()
    .addComponents(
        new client.discord.MessageButton()
            .setCustomId('acceptAppeal')
            .setLabel(`Accept`)
            .setStyle('SUCCESS')
    )
    .addComponents(
        new client.discord.MessageButton()
            .setCustomId('denyAppeal')
            .setLabel(`Deny`)
            .setStyle('DANGER')
    )

    await channel.send({ embeds: [embed], components: [buttons] }).catch(e => {});
    return interaction.update({ content: "**Appeal Received!**", embeds: [], components: [], ephemeral: true }).catch(e => {});
};