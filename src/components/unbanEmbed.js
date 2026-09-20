module.exports = async function(client, con, interaction, data) {
    let banid = await client.utils.getBanId(interaction.message)

    if (!interaction.member.permissions.has('BAN_MEMBERS')) return interaction.reply({ content: "You do not have permissions to ban members in this guild.", ephemeral: true }).catch(e => {});

    await con.query(`SELECT * FROM bannedusers WHERE banid=${banid}`, async (err, row) => {
        let ban = row[0];
        if(!row[0]) return interaction.reply({ content: "That user has no ban history in the database.", ephemeral: true }).catch(e => {});
        let user = await client.users.fetch(ban.userid);
        await interaction.guild.members.unban(ban.userid).catch(e => {
            if(client.config.debugmode) {
                console.log(`Guild Id: ${interaction.guild.id} failed to unban ${ban.userid}.\n`, e.stack);
            }
        });
        let options = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('banDisabled')
                .setLabel(`Banned here: No`)
                .setStyle('SECONDARY')
                .setDisabled(true)
        )
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('banEmbed')
                .setLabel(`Ban ${user.tag}`)
                .setStyle('DANGER')
        )
        await interaction.update({ components: [options] }).catch(e => {});
    });
};