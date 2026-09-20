module.exports = async function(client, con, interaction, data) {
    let embed = interaction.message.embeds[0];
    let channel = await client.channels.cache.get(client.config.reportLogs)

    let buttons = new client.discord.MessageActionRow()
    .addComponents(
        new client.discord.MessageButton()
            .setCustomId('acceptReport')
            .setLabel(`Accept`)
            .setStyle('SUCCESS')
    )
    .addComponents(
        new client.discord.MessageButton()
            .setCustomId('denyReport')
            .setLabel(`Deny`)
            .setStyle('DANGER')
    )

    await channel.send({ embeds: [embed], components: [buttons] }).catch(e => {});
    return interaction.update({ content: "**Report Receieved!**", embeds: [], components: [], ephemeral: true }).catch(e => {});
};