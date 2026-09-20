module.exports = async function(client, con, app) {
    require('../dashboard/routing.js')(client, con, app);
};