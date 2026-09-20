module.exports = async function(client, con, interaction, data) {
    let banid = await client.utils.getBanId(interaction.message)

    if (!interaction.member.permissions.has('BAN_MEMBERS')) return interaction.reply({ content: "You do not have permissions to ban members in this guild.", ephemeral: true }).catch(e => {});

    await con.query(`SELECT * FROM bannedusers WHERE banid=${banid}`, async (err, row) => {
        let ban = row[0];
        let user = await client.users.fetch(ban.userid);
        await interaction.guild.members.ban(ban.userid, {
            reason: `${ban.reason} | ${ban.proof} | ${client.user.tag}`
        }).catch(e => {
            if(client.config.debugmode) {
                console.log(`Guild Id: ${interaction.guild.id} failed to ban ${ban.userid}.\n`, e.stack);
            }
        });
        let options = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('banDisabled')
                .setLabel(`Banned here: Yes`)
                .setStyle('SECONDARY')
                .setDisabled(true)
        )
        .addComponents(
            new client.discord.MessageButton()
                .setCustomId('unbanEmbed')
                .setLabel(`Unban ${user.tag}`)
                .setStyle('DANGER')
        )
        await interaction.update({ components: [options] }).catch(e => {});
    });
};