exports.run = async function(client, con, interaction, data) {

    if (!interaction.member.permissions.has('BanMembers')) return interaction.reply({ content: "You do not have permissions to ban members in this guild.", ephemeral: true }).catch(e => {});

    let embed = new client.discord.MessageEmbed()
    .setColor(client.config.themeColor || '#FFFFFF')
    .setDescription(`Are you sure you want to update this guilds bans?`)

    let buttons = new client.discord.MessageActionRow()
    .addComponents(
        new client.discord.MessageButton()
            .setLabel('Confirm')
            .setStyle('SUCCESS')
            .setCustomId('updateConfirm')
    )
    .addComponents(
        new client.discord.MessageButton()
            .setLabel('Deny')
            .setStyle('DANGER')
            .setCustomId('updateDeny')
    )

    await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });
};

exports.info = {
    name: 'updatebans',
    description: 'Add all database bans to this guilds banned users list.'
}