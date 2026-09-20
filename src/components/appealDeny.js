module.exports = async function(client, con, interaction, data) {
    let reportId = Number(interaction.message.embeds[0].footer.text.replaceAll('Appeal ID: ', ''))
    await con.query(`DELETE FROM appeals WHERE appealid=${reportId}`, async (err, row) => {
        if(err) throw err;
        interaction.update({ content: "**Appeal Cancelled!**", embeds: [], components: [] }).catch(e => {});
    });
};