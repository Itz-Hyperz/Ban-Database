async function checkAuth(req, res, next) {
    if(req.isAuthenticated()){
        next();
    } else{
        res.redirect("/auth/discord");
    }
};

async function post(client, embed, buttons, type) {
    if(type == 'report') {
        let channel = client.channels.cache.get(client.config.reportLogs)
        await channel.send({ embeds: [embed], components: [buttons] }).catch(e => {});
    } else {
        let channel = client.channels.cache.get(client.config.appealLogs)
        await channel.send({ embeds: [embed], components: [buttons] }).catch(e => {});
    };
} 

module.exports = {
    checkAuth: checkAuth,
    post: post
};