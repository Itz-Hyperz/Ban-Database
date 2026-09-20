exports.run = async function(client, con, interaction, data) {
    const modal = new client.discord.Modal()
    .setCustomId('reportModal')
    .setTitle('Report A User');

    const userid = new client.discord.TextInputComponent()
    .setCustomId('userid')
    .setLabel("What is the User Id you are reporting?")
    .setStyle('SHORT');

    const reason = new client.discord.TextInputComponent()
    .setCustomId('reason')
    .setLabel("What is your reason for reporting this user?")
    .setStyle('PARAGRAPH');

    const proof = new client.discord.TextInputComponent()
    .setCustomId('proof')
    .setLabel("Please provide image links as evidence.")
    .setStyle('PARAGRAPH');

    const one = new client.discord.MessageActionRow().addComponents(userid);
    const two = new client.discord.MessageActionRow().addComponents(reason);
    const three = new client.discord.MessageActionRow().addComponents(proof);

    await modal.addComponents(one, two, three);
    await interaction.showModal(modal);
};

exports.info = {
    name: 'report',
    description: 'Report a user to the database.'
}