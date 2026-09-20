module.exports = async function(client, con, interaction, data) {
    let reporter = interaction.user;
    let userid = await interaction.fields.getTextInputValue('userid');
    let reason = await interaction.fields.getTextInputValue('reason');
    let proof = await interaction.fields.getTextInputValue('proof');

    userid = userid.replaceAll(`'`, ``).replaceAll('"', '').replaceAll("'", "");
    reason = reason.replaceAll(`'`, ``).replaceAll('"', '').replaceAll("'", "");
    proof = proof.replaceAll(`'`, ``).replaceAll('"', '').replaceAll("'", "");
    
    let user = await client.users.fetch(userid);
    if(!user) return interaction.reply({content: 'The user you\'ve reported could not be found!', ephemeral: true}).catch(e => {});

    await con.query(`INSERT INTO reports (userid, reason, proof, reportedby) VALUES ("${userid}", "${reason}", "${proof}", "${interaction.user.id}")`, async (err, row) => {
        if(err) throw err;
        let reportConfirmEmbed = new client.discord.MessageEmbed()
        .setColor(client.config.themeColor)
        .setTitle("Confirm Report")
        .setThumbnail(client.user.avatarURL({ dynamic: true }))
        .addFields(
            { name: "__Reporter Info__", value: `**User Tag:** ||${reporter.tag}||\n**User ID:** [\`${reporter.id}\`](https://discord.com/users/${reporter.id})`, inline: true },
            { name: "__Defendant Info__", value: `**User Tag:** ||${user.tag}||\n**User ID:** [\`${user.id}\`](https://discord.com/users/${user.id})`, inline: true },
            { name: "Reason for Report", value: `\`\`\`${reason}\`\`\``, inline: false },
            { name: "Provided Evidence", value: `${proof.replaceAll(" ", " \n")}`, inline: false },
        )
        .setFooter({ text: `Report ID: ${row.insertId}`, iconURL: client.user.avatarURL({ dynamic: true }) });

        let buttons = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('reportConfirm')
                .setLabel(`Confirm`)
                .setStyle('SUCCESS')
        )
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('reportDeny')
                .setLabel(`Deny`)
                .setStyle('DANGER')
        )

        await interaction.reply({ content: "Does this all look right?", embeds: [reportConfirmEmbed], components: [buttons], ephemeral: true }).catch(e => {});
    });
    
};