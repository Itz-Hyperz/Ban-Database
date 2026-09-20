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
        .setLabel('Cancelled')
        .setStyle('DANGER')
        .setCustomId('disabled2')
        .setDisabled(true)
    );

  await interaction.update({ components: [buttons] }).catch((e) => {});
};
