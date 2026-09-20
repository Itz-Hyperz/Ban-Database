module.exports = async function(client, con, interaction, data) {
    let reportId = Number(interaction.message.embeds[0].footer.text.replaceAll('Report ID: ', ''))
    await con.query(`SELECT * FROM reports WHERE reportid=${reportId}`, async (err, row) => {
        if(err) throw err;
        let report = row[0];
        let user = await client.users.fetch(report.reportedby);

        let embed = new client.discord.MessageEmbed()
        .setColor(client.config.themeColor)
        .setTitle(`Report Denied!`)
        .setDescription(`${interaction.user.tag} has denied your report. There was either not enough evidence, or the report was not upheld. Feel free to create a new report, and better specify the evidence.`)
        .setThumbnail(client.user.avatarURL({ dynamic: true }))
        .setTimestamp()
        try {
            await user.send({ embeds: [embed] }).catch(e => {});
        } catch(e) {}
        
        let buttons = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('reportDisabled')
                .setLabel(`Status:`)
                .setStyle('SECONDARY')
                .setDisabled(true)
        )
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('reportDisabled2')
                .setLabel(`Denied`)
                .setStyle('DANGER')
                .setDisabled(true)
        )

        await interaction.update({ components: [buttons] }).catch(e => {});
    });
};