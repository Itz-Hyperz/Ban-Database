module.exports = async function(client, con, interaction, data) {
    await interaction.reply({ content: "Please provide a channel to set the logging to.", ephemeral: true }).catch(function(e) { if(client?.config?.debugmode) console.log(e) });
    const filter = (m) => m.author.id == interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 150000 });
    let input;
    collector.on('collect', async (m) => {
        if(m.content.toLowerCase() == 'cancel') {
            await m?.delete().catch(function(e) { if(client?.config?.debugmode) console.log(e) });
            collector.stop();
            return interaction.reply({ content: "Cancelled.", ephemeral: true }).catch(e => {
                interaction.editReply({ content: "Cancelled.", ephemeral: true }).catch(function(e) { if(client?.config?.debugmode) console.log(e) });
            });
        };
        if(m.content.toLowerCase() == 'false') {
            input = 'none';
        } else {
            if(m.mentions.channels.first()) {
                input = m.mentions.channels.first().id;
            } else {
                input = m.content;
            };
        };
        await con.query(`UPDATE guilds SET logging="${input}" WHERE guildid="${interaction.guild.id}"`, async (err, row) => {
            if(err) throw err;
            await m.delete().catch(function(e) { if(client?.config?.debugmode) console.log(e) });
            interaction.editReply({ content: `**Logging Channel Updated!**`, ephemeral: true })
            collector.stop();
            return;
        });
    });
};