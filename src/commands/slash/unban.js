exports.run = async function(client, con, interaction, data) {
    let userid = await interaction.options.getString('userid');

    let user = await client.users.fetch(userid);
    if(!user) return interaction.reply({ content: "User Id does not exist...", ephemeral: true }).catch(e => {});

    await con.query(`SELECT * FROM staff WHERE userid="${interaction.user.id}"`, async function(err, row) {
        if(err) throw err;
        if(!row[0]) return interaction.reply({ content: "You are not staff on this database.", ephemeral: true }).catch(e => {});
        let unban = await client.utils.removeBan(client, con, userid, interaction.user.id);
        if(!unban) return interaction.reply({ content: "Failed to unban user.", ephemeral: true }).catch(e => {});
        await interaction.reply({ content: "User has been unbanned.", ephemeral: true }).catch(e => {});
    });

};

exports.info = {
    name: 'unban',
    description: 'Unban a user in the database.',
    options: [
        {
            name: 'userid',
            description: 'The ID of the user to unban.',
            required: true,
            type: 'STRING'
        }
    ]
}