module.exports = async function(client, con, interaction, data) {
    let appealId = Number(interaction.message.embeds[0].footer.text.replaceAll('Appeal ID: ', ''))
    await con.query(`SELECT * FROM staff WHERE userid="${interaction.user.id}"`, async (err, row) => {
        if(err) throw err;
        if(!row[0]) return interaction.reply({ content: "You are not a staff member in this database.", ephemeral: true }).catch(e => {});
        await con.query(`SELECT * FROM appeals WHERE appealid=${appealId}`, async (err, row) => {
            if(err) throw err;
            let appeal = row[0];
            let user = await client.users.fetch(appeal.userid);
            
            let embed = new client.discord.MessageEmbed()
            .setColor(client.config.themeColor)
            .setTitle(`Appeal Accepted!`)
            .setDescription(`${interaction.user.tag} has accepted your appeal. It has now entered the processing phase...`)
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setTimestamp()
            try {
                await user.send({ embeds: [embed] }).catch(e => {});
            } catch(e) {}
        
            let unban = await client.utils.removeBan(client, con, appeal.userid, interaction.user.id);

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
                    .setLabel(`Accepted`)
                    .setStyle('SUCCESS')
                    .setDisabled(true)
            )

            await interaction.update({ components: [buttons], ephemeral: true }).catch(e => {});

        });
    });
};