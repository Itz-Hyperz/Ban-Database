exports.run = async function(client, con, interaction, data) {
    let userid = await interaction.options.getString('userid');
    userid = userid.replaceAll('"', '').replaceAll("'", "").replaceAll("`", "");

    await con.query(`SELECT * FROM bannedusers WHERE active=true AND userid="${userid}"`, async function(err, row) {
        if(err) throw err;
        if(!row[0]) return interaction.reply({ content: "That user is not actively banned in our database.", ephemeral: true }).catch(e => {});
        let banned = await client.users.fetch(userid);
        if(!banned) return interaction.reply({ content: "That user does not exist anymore.", ephemeral: true }).catch(e => {});
        let staff = await client.users.fetch(row[0].bannedby)
        let embed = new client.discord.MessageEmbed()
        .setColor(client.config.themeColor)
        .setTitle("Ban Found!")
        .setURL(row[0].proof)
        .setThumbnail(client.user.avatarURL({ dynamic: true }))
        .addFields(
            { name: "__Banned User__", value: `**ID:** ${banned.id}\n**Tag:** [||\`${banned.tag}\`||](https://discord.com/users/${banned.id})`, inline: true },
            { name: "__Staff Member__", value: `**ID:** ${staff.id}\n**Tag:** [${staff.tag}](https://discord.com/users/${staff.id})`, inline: true },
            { name: "Reason", value: `${row[0].reason}`, inline: false },
        )
        .setFooter({ text: `Ban ID: ${row[0].banid}`, iconURL: client.user.avatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => {});
    });
};

exports.info = {
    name: 'search',
    description: 'Check if a user is banned in the database',
    options: [
        {
            name: 'userid',
            description: 'The user Id to check.',
            required: true,
            type: 'STRING'
        }
    ]
}