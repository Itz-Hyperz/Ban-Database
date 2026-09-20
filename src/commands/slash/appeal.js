exports.run = async function(client, con, interaction, data) {

    await con.query(`SELECT * FROM bannedusers WHERE userid="${interaction.user.id}" AND active=true`, async (err, row) => {
        if(err) throw err;
        if(!row[0]) return interaction.reply({ content: "Only banned users can run this command.", ephemeral: true }).catch(e => {});
        const modal = new client.discord.Modal()
        .setCustomId('appealModal')
        .setTitle('Appeal A Ban');

        const reason = new client.discord.TextInputComponent()
        .setCustomId('reason')
        .setLabel("Why do you believe you should be unbanned?")
        .setStyle('PARAGRAPH');

        const one = new client.discord.MessageActionRow().addComponents(reason);

        await modal.addComponents(one);
        await interaction.showModal(modal);
    });

};

exports.info = {
    name: 'appeal',
    description: 'Appeal a ban in the database.'
}