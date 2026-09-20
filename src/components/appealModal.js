module.exports = async function(client, con, interaction, data) {
    let appealer = interaction.user;
    let reason = await interaction.fields.getTextInputValue('reason');

    reason = reason.replaceAll(`'`, ``).replaceAll('"', '').replaceAll("'", "");

    await con.query(`INSERT INTO appeals (userid, reason) VALUES ("${appealer.id}", "${reason}")`, async (err, row) => {
        if(err) throw err;
        let reportConfirmEmbed = new client.discord.MessageEmbed()
        .setColor(client.config.themeColor)
        .setTitle("Confirm Appeal")
        .setThumbnail(client.user.avatarURL({ dynamic: true }))
        .addFields(
            { name: "__Defendant Info__", value: `**User Tag:** ||${appealer.tag}||\n**User ID:** [\`${appealer.id}\`](https://discord.com/users/${appealer.id})`, inline: true },
            { name: "Reason For Appeal", value: `\`\`\`${reason}\`\`\``, inline: false },
        )
        .setFooter({ text: `Appeal ID: ${row.insertId}`, iconURL: client.user.avatarURL({ dynamic: true }) });

        let buttons = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('appealConfirm')
                .setLabel(`Confirm`)
                .setStyle('SUCCESS')
        )
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('appealDeny')
                .setLabel(`Deny`)
                .setStyle('DANGER')
        )

        await interaction.reply({ content: "Does this all look right?", embeds: [reportConfirmEmbed], components: [buttons], ephemeral: true }).catch(e => {});
    });
    
};