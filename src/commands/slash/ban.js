exports.run = async function(client, con, interaction, data) {
    let userid = await interaction.options.getString('userid');
    let reason = await interaction.options.getString('reason');
    let proof = await interaction.options.getString('proof');

    let user = await client.users.fetch(userid);
    if(!user) return interaction.reply({ content: "User Id does not exist...", ephemeral: true }).catch(e => {});

    if(userid == interaction.user.id) return interaction.reply({ content: "You cannot ban yourself...", ephemeral: true }).catch(e => {});

    await con.query(`SELECT * FROM staff WHERE userid="${interaction.user.id}"`, async function(err, row) {
        if(err) throw err;
        if(!row[0]) return interaction.reply({ content: "You are not staff on this database.", ephemeral: true }).catch(e => {});
        let validProof;
        if(proof.includes('http')) {
            if(proof.includes('jpg') || proof.includes('png') || proof.includes('jpeg') || proof.includes('gif') || proof.includes('webp')) {
                validProof = true;
            } else {
                validProof = false;
            }
        } else {
            validProof = false;
        }
        if(!validProof) return interaction.reply({ content: "Invalid proof provided, must be a `URL` ending with: `png`, `jpg`, `jpeg`, `gif`, `webp`.", ephemeral: true }).catch(e => {});
        let ban = await client.utils.addBan(client, con, userid, reason, proof, interaction.user.id);
        if(!ban) return interaction.reply({ content: "Failed to ban user.", ephemeral: true }).catch(e => {});
        await interaction.reply({ content: "User has been banned.", ephemeral: true }).catch(e => {});
    });

};

exports.info = {
    name: 'ban',
    description: 'Ban a user in the database.',
    options: [
        {
            name: 'userid',
            description: 'The ID of the user to ban.',
            required: true,
            type: 'STRING'
        },
        {
            name: 'reason',
            description: 'The reason to ban this user in the database.',
            required: true,
            type: 'STRING'
        },
        {
            name: 'proof',
            description: 'An image link providing proof of this reason.',
            required: true,
            type: 'STRING'
        }
    ]
}