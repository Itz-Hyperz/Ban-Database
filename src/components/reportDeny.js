module.exports = async function(client, con, interaction, data) {
    let reportId = Number(interaction.message.embeds[0].footer.text.replaceAll('Report ID: ', ''))
    await con.query(`DELETE FROM reports WHERE reportid=${reportId}`, async (err, row) => {
        if(err) throw err;
        interaction.update({ content: "**Report Cancelled!**", embeds: [], components: [] }).catch(e => {});
    });
};