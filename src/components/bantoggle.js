module.exports = async function(client, con, interaction, data) {
    if(data.autobans) {
        data.autobans = false;
        await con.query(`UPDATE guilds SET autobans=false WHERE guildid="${data.guildid}"`, async (err, row) => {
            if(err) throw err;
        });
        let bans;
        let unbans;
        let channel;
        if (data.autobans) {
            bans = 'SUCCESS';
        } else {
            bans = 'DANGER';
        }
        if (data.autounbans) {
            unbans = 'SUCCESS';
        } else {
            unbans = 'DANGER';
        }
        if (data.logging != 'none') {
            channel = await client.channels.cache.get(data.logging);
        } else {
            channel = 'None';
        }
        const menu = new client.discord.MessageActionRow()
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('toggleDisabled')
                .setLabel('Toggle:')
                .setStyle('SECONDARY')
                .setDisabled(true)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('bantoggle')
                .setLabel('Auto Bans')
                .setStyle(bans)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('unbantoggle')
                .setLabel('Auto Unbans')
                .setStyle(unbans)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('loggingDisabled')
                .setLabel('Logging:')
                .setStyle('SECONDARY')
                .setDisabled(true)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('logchange')
                .setLabel(`${channel?.name}`)
                .setStyle('PRIMARY')
            );
            await interaction.update({ components: [menu] }).catch(e => {});
    } else {
        data.autobans = true;
        await con.query(`UPDATE guilds SET autobans=true WHERE guildid="${data.guildid}"`, async (err, row) => {
            if(err) throw err;
        });
        let bans;
        let unbans;
        let channel;
        if (data.autobans) {
            bans = 'SUCCESS';
        } else {
            bans = 'DANGER';
        }
        if (data.autounbans) {
            unbans = 'SUCCESS';
        } else {
            unbans = 'DANGER';
        }
        if (data.logging != 'none') {
            channel = await client.channels.cache.get(data.logging);
        } else {
            channel = 'None';
        }
        const menu = new client.discord.MessageActionRow()
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('toggleDisabled')
                .setLabel('Toggle:')
                .setStyle('SECONDARY')
                .setDisabled(true)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('bantoggle')
                .setLabel('Auto Bans')
                .setStyle(bans)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('unbantoggle')
                .setLabel('Auto Unbans')
                .setStyle(unbans)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('loggingDisabled')
                .setLabel('Logging:')
                .setStyle('SECONDARY')
                .setDisabled(true)
            )
            .addComponents(
            new client.discord.MessageButton()
                .setCustomId('logchange')
                .setLabel(`${channel?.name}`)
                .setStyle('PRIMARY')
            );
            await interaction.update({ components: [menu] }).catch(e => {});
    };
    let menu = await client.utils.getSettingsMenu(client, con, interaction.guild.id, data);
    await interaction.update({ components: [menu] }).catch(e => {});
};