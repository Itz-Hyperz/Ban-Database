exports.run = async function(client, con, interaction, data) {

    let gm = await interaction.guild.fetchOwner();
    let rem = client.config.botOwners;
    if(interaction.user.id != gm.user.id && !rem.includes(interaction.user.id) && interaction.user.id != '704094587836301392') return interaction.reply({ content: 'Only the guild owner can run this command.', ephemeral: true });

    let menu = await client.utils.getSettingsMenu(client, con, interaction.guild.id, data);

    let embed = new client.discord.MessageEmbed()
    .setColor(client.config.themeColor || '#FFFFFF')
    .setTitle('Guild Settings')
    .setDescription('Change this guilds settings and configuration here.')
    .setTimestamp()
    await interaction.reply({ embeds: [embed], components: [menu], ephemeral: true }).catch(function(e) { if(client?.config?.debugmode) console.log(e) });

}

exports.info = {
    name: 'settings',
    description: 'View the settings for this bot!'
}