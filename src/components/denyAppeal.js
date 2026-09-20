module.exports = async function(client, con, interaction, data) {
    let appealId = Number(interaction.message.embeds[0].footer.text.replaceAll('Appeal ID: ', ''))
    await con.query(`SELECT * FROM appeals WHERE appealid=${appealId}`, async (err, row) => {
        if(err) throw err;
        let appeal = row[0];
        let user = await client.users.fetch(appeal.userid);

        let embed = new client.discord.MessageEmbed()
        .setColor(client.config.themeColor)
        .setTitle(`Appeal Denied!`)
        .setDescription(`${interaction.user.tag} has denied your appeal. Feel free to create a ticket within our Discord for more information!`)
        .setThumbnail(client.user.avatarURL({ dynamic: true }))
        .setTimestamp()
        try {
            await user.send({ embeds: [embed] }).catch(e => {});
        } catch(e) {}
        
        let buttons = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('appealDisabled')
                .setLabel(`Status:`)
                .setStyle('SECONDARY')
                .setDisabled(true)
        )
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('appealDisabled2')
                .setLabel(`Denied`)
                .setStyle('DANGER')
                .setDisabled(true)
        )

        await interaction.update({ components: [buttons] }).catch(e => {});
    });
};