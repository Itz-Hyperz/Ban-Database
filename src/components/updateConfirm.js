module.exports = async function (client, con, interaction, data) {
  if (!interaction.member.permissions.has('BanMembers'))
    return interaction
      .reply({
        content: 'You do not have permissions to ban members in this guild.',
        ephemeral: true,
      })
      .catch((e) => {});

  let buttons = new client.discord.MessageActionRow()
    .addComponents(
      new client.discord.MessageButton()
        .setLabel('Status:')
        .setStyle('SECONDARY')
        .setCustomId('disabled1')
        .setDisabled(true)
    )
    .addComponents(
      new client.discord.MessageButton()
        .setLabel('Confirmed')
        .setStyle('SUCCESS')
        .setCustomId('disabled2')
        .setDisabled(true)
    );

  await con.query(
    `SELECT * FROM bannedusers WHERE active=true`,
    async (err, row) => {
      if (err) throw err;
      await row.forEach(async (ban) => {
        await interaction.guild.members
          .ban(ban.userid, {
            reason: `${ban.reason} | ${ban.proof} | ${client.user.tag}`,
          })
          .catch((e) => {
            if (client.config.debugmode) {
              console.log(
                `Guild Id: ${interaction.guild.id} failed to ban ${ban.userid}.\n`,
                e.stack
              );
            }
          });
      });
    }
  );

  await interaction.update({ components: [buttons] }).catch((e) => {});
};
