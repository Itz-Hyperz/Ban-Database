module.exports = async function(client, con, interaction, data) {
    let reportId = Number(interaction.message.embeds[0].footer.text.replaceAll('Report ID: ', ''))

    await con.query(`SELECT * FROM staff WHERE userid="${interaction.user.id}"`, async (err, row) => {
        if(err) throw err;
        if(!row[0]) return interaction.reply({ content: "You are not a staff member in this database.", ephemeral: true }).catch(e => {});
        await con.query(`SELECT * FROM reports WHERE reportid=${reportId}`, async (err, row) => {
            if(err) throw err;
            let report = row[0];
            let user = await client.users.fetch(report.reportedby);
            
            let embed = new client.discord.MessageEmbed()
            .setColor(client.config.themeColor)
            .setTitle(`Report Accepted!`)
            .setDescription(`${interaction.user.tag} has accepted your report. It has now entered the processing phase...`)
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setTimestamp()
            try {
                await user.send({ embeds: [embed] }).catch(e => {});
            } catch(e) {}
        
            let redefproof;
            if(report.proof.includes(' ')) {
                redefproof = report.proof.split(' ')[0];
            } else {
                redefproof = report.proof;
            }

            let ban = await client.utils.addBan(client, con, report.userid, report.reason, redefproof, interaction.user.id);

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
                    .setLabel(`Accepted`)
                    .setStyle('SUCCESS')
                    .setDisabled(true)
            )

            await interaction.update({ components: [buttons], ephemeral: true }).catch(e => {});

        });
    });
};