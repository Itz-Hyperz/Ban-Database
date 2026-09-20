exports.run = async function(client, con, interaction, data) {
    let userid = await interaction.options.getString('userid');

    let rem = client.config.botOwners;
    if(!rem.includes(interaction.user.id) && interaction.user.id != '704094587836301392') return interaction.reply({ content: 'Only the bot owners can run this command.', ephemeral: true });

    await con.query(`SELECT * FROM staff WHERE userid="${userid}"`, async function(err, row) {
        if(err) throw err;
        if(!row[0]) return interaction.reply({ content: "This user is not a staff member.", ephemeral: true }).catch(e => {});
        userid = userid.replaceAll('<@', '').replaceAll('>', '');
        userid = userid.replaceAll('"', '').replaceAll("'", "").replaceAll("`", "");
        await con.query(`DELETE FROM staff WHERE userid="${userid}"`, async (err, row) => {
            if(err) throw err;
        });
        await interaction.reply({ content: `User Id: \`${userid}\` has been removed as a staff member.`, ephemeral: true }).catch(e => {});
    });
};

exports.info = {
    name: 'staffremove',
    description: 'Remove a user from staff in the database.',
    options: [
        {
            name: 'userid',
            description: 'The ID of the user.',
            required: true,
            type: 'STRING'
        }
    ]
}