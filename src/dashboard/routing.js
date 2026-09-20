const passport = require('passport');
const multer = require('multer');
const bodyParser = require('body-parser');
const session  = require('express-session');
const express = require("express");
const DiscordStrategy = require('passport-discord-faxes').Strategy;
const backend = require('./backend.js');

module.exports = async function(client, con, app) {

    // Discord Login Passport
    passport.serializeUser(function(user, done) { done(null, user) });
    passport.deserializeUser(function(obj, done) { done(null, obj) });
    passport.use(new DiscordStrategy({
        clientID: client.config.website.oauthId,
        clientSecret: client.config.website.oauthToken,
        callbackURL: `${(client.config.website.domain.endsWith('/') ? client.config.website.domain.slice(0, -1) : client.config.website.domain)}/auth/discord/callback`,
        scope: ['identify', 'guilds', 'email'],
        prompt: 'consent'
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));

    // Express App Initialization
    var multerStorage = multer.memoryStorage()
    app.use(multer({ storage: multerStorage }).any());
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 31556952000},
    }));
    app.use(express.json());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static('public'));
    app.use('/assets', express.static(__dirname + '/public/assets'))
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'ejs');
    global.logoURL = client.user.avatarURL({ dynamic: true });

    // Main Routing
    app.get('/', async function(req, res) {
        await con.query(`SELECT * FROM bannedusers WHERE active=true`, async (err, row) => {
            if(err) throw err;
            res.render('index.ejs', { config: client.config, guildcount: client.guilds.cache.size.toLocaleString(), bancount: row.length.toLocaleString() || 0, usercount: client.users.cache.size.toLocaleString() });
        });
    });

    app.get('/search', async function(req, res) {
        res.render('search.ejs', { config: client.config, response: false });
    });

    app.get('/report', backend.checkAuth, async function(req, res) {
        res.render('report.ejs', { config: client.config });
    });

    app.get('/appeal', backend.checkAuth, async function(req, res) {
        await con.query(`SELECT * FROM bannedusers WHERE userid="${req.session.passport.user.id}" AND active=true`, async function(err, row) {
            if(err) throw err;
            if(row[0]) {
                res.render('appeal.ejs', { config: client.config });
            } else {
                res.render('403.ejs', { config: client.config, error: "You must be banned in order to create an appeal." });
            };
        });
    });

    app.get('/staff', backend.checkAuth, async function(req, res) {
        await con.query(`SELECT * FROM staff WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) return res.render('403.ejs', { config: client.config, error: "You are not a member of the staff team in this database." });
            await con.query(`SELECT * FROM bannedusers WHERE active=true`, async function(err, row) {
                if(err) throw err;
                let bans = row || [];
                res.render('staff.ejs', { config: client.config, bans: bans });
            });
        });
    });

    app.get('/account', backend.checkAuth, async function(req, res) {
        await con.query(`SELECT * FROM staff WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
            let staff;
            if(row[0]) {
                staff = true;
            } else {
                staff = false;
            };
            await con.query(`SELECT * FROM bannedusers WHERE userid="${req.session.passport.user.id}" AND active=true`, async function(err, row) {
                if(err) throw err;
                let guilds = [];
                await req.session.passport.user.guilds.forEach(async function(guild) {
                    if(guild.owner) {
                        let check = await client.guilds.cache.get(guild.id);
                        if(!check) {
                            let j = {
                                button: "Invite Me",
                                style: "guild-invite",
                                imgstyle: "imgguildstyle-invite",
                                btn: "btn-success",
                                target: "_blank",
                                link: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`,
                                data: guild
                            };
                            guilds.push(j);
                        } else {
                            let j = {
                                button: "Manage Guild",
                                style: "guild-manage",
                                imgstyle: "imgguildstyle-manage",
                                btn: "btn-primary",
                                target: "",
                                link: `/guild/${guild.id}`,
                                data: guild
                            };
                            guilds.push(j);
                        };
                    };
                });
                if(row[0]) { 
                    res.render('account.ejs', { config: client.config, isStaff: staff, guilds: guilds, banned: true, ban: row[0] });
                } else {
                    res.render('account.ejs', { config: client.config, isStaff: staff, guilds: guilds, banned: false });
                };
            });
        });
    });

    app.get('/guild/:guildid', backend.checkAuth, async function(req, res) {
        if(!req.params.guildid) return res.redirect('/account');
        let check = await client.guilds.cache.get(req.params.guildid);
        if(!check) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
        let auth = false;
        await req.session.passport.user.guilds.forEach(async function(guild) {
            if(guild.id == req.params.guildid && guild.owner == true) {
                auth = true;
            };
        });
        if(!auth) return res.redirect('/account');
        req.params.guildid = await req.params.guildid.replaceAll("'", "").replaceAll('"', '').replaceAll("`", "");
        await con.query(`SELECT * FROM guilds WHERE guildid="${req.params.guildid}"`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
            let selectedChan = {
                id: row[0].logging,
                name: "Not Selected..."
            };
            let channels = [];
            await check.channels.cache.forEach(function(channel) {
                if(channel.type == "GUILD_TEXT") {
                    if(channel.id == row[0].logging) selectedChan.name = channel.name;
                    let j = {
                        name: channel.name,
                        id: channel.id
                    };
                    channels.push(j);
                }
            });
            res.render('guild.ejs', { config: client.config, guild: row[0], channels: channels, selectedChan: selectedChan });
        });
    });

    app.post('/backend/guild/update/:guildid', backend.checkAuth, async function(req, res) {
        if(!req.params.guildid) return res.redirect('/account');
        let check = await client.guilds.cache.get(req.params.guildid);
        if(!check) return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
        let auth = false;
        await req.session.passport.user.guilds.forEach(async function(guild) {
            if(guild.id == req.params.guildid && guild.owner == true) {
                auth = true;
            };
        });
        if(!auth) return res.redirect('/account');
        req.params.guildid = await req.params.guildid.replaceAll("'", "").replaceAll('"', '').replaceAll("`", "");
        req.body.autobans = Number(await req.body.autobans.replaceAll("'", "").replaceAll('"', '').replaceAll("`", ""));
        req.body.autounbans = Number(await req.body.autounbans.replaceAll("'", "").replaceAll('"', '').replaceAll("`", ""));
        req.body.logging = await req.body.logging.replaceAll("'", "").replaceAll('"', '').replaceAll("`", "");
        if(isNaN(req.body.autobans) || isNaN(req.body.autounbans)) return res.redirect('/account');
        await con.query(`UPDATE guilds SET autobans=${req.body.autobans}, autounbans=${req.body.autounbans}, logging="${req.body.logging}" WHERE guildid="${req.params.guildid}"`, async (err, row) => {
            if(err) throw err;
        });
        await res.redirect('/account');
    });

    app.post('/backend/search', async function(req, res) {
        let userid = req.body.userid;
        if(!userid) return res.render('search.ejs', { config: client.config, response: false });
        await con.query(`SELECT * FROM bannedusers WHERE userid="${userid}"`, async function(err, row) {
            if(err) throw err;
            let sorted = row.sort((a, b) => Number(b.active) - Number(a.active));
            let bans = sorted;
            if(!row.length) bans = [];
            res.render('search.ejs', { config: client.config, response: true, bans: bans });
        });
    });

    app.post('/backend/bans/add', backend.checkAuth, async function(req, res) {
        await con.query(`SELECT * FROM staff WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) return res.render('403.ejs', { config: client.config, error: "You are not a member of the staff team in this database." });
            await client.utils.addBan(client, con, req.body.userid, req.body.reason, req.body.proof, req.session.passport.user.id);
            res.redirect('/staff');
        });
    });

    app.get('/backend/bans/remove/:userid', backend.checkAuth, async function(req, res) {
        if(!req.params.userid) return res.redirect('/staff');
        await con.query(`SELECT * FROM staff WHERE userid="${req.session.passport.user.id}"`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) return res.render('403.ejs', { config: client.config, error: "You are not a member of the staff team in this database." });
            await client.utils.removeBan(client, con, req.params.userid, req.session.passport.user.id);
            res.redirect('/staff');
        });
    });

    app.post('/backend/create/report', backend.checkAuth, async function(req, res) {
        let userid = req.body.userid;
        let reason = req.body.reason;
        let proof = req.body.proof;

        let reporter = await client.users.fetch(req.session.passport.user.id)
        let user = await client.users.fetch(userid)

        if(!user) return res.redirect('/report');

        await con.query(`INSERT INTO reports (userid, reason, proof, reportedby) VALUES ("${userid}", "${reason}", "${proof}", "${reporter.id}")`, async (err, row) => {
            if(err) throw err;
            let reportConfirmEmbed = new client.discord.MessageEmbed()
            .setColor(client.config.themeColor)
            .setTitle("Confirm Report")
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .addFields(
                { name: "__Reporter Info__", value: `**User Tag:** ||${reporter.tag}||\n**User ID:** [\`${reporter.id}\`](https://discord.com/users/${reporter.id})`, inline: true },
                { name: "__Defendant Info__", value: `**User Tag:** ||${user.tag}||\n**User ID:** [\`${user.id}\`](https://discord.com/users/${user.id})`, inline: true },
                { name: "Reason for Report", value: `\`\`\`${reason}\`\`\``, inline: false },
                { name: "Provided Evidence", value: `${proof.replaceAll(" ", " \n")}`, inline: false },
            )
            .setFooter({ text: `Report ID: ${row.insertId}`, iconURL: client.user.avatarURL({ dynamic: true }) });
    
            let buttons = new client.discord.MessageActionRow()
            .addComponents(
                new client.discord.MessageButton()
                    .setCustomId('acceptReport')
                    .setLabel(`Accept`)
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new client.discord.MessageButton()
                    .setCustomId('denyReport')
                    .setLabel(`Deny`)
                    .setStyle('DANGER')
            )
    
            await backend.post(client, reportConfirmEmbed, buttons, 'report').catch(e => {});
            res.redirect('/');
        });
    });

    app.post('/backend/create/appeal', backend.checkAuth, async function(req, res) {
        let reason = req.body.reason;
        let user = await client.users.fetch(req.session.passport.user.id)

        if(!user) return res.redirect('/appeal');

        await con.query(`INSERT INTO appeals (userid, reason) VALUES ("${user.id}", "${reason}")`, async (err, row) => {
            if(err) throw err;
            let reportConfirmEmbed = new client.discord.MessageEmbed()
            .setColor(client.config.themeColor)
            .setTitle("Confirm Appeal")
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .addFields(
                { name: "__Defendant Info__", value: `**User Tag:** ||${user.tag}||\n**User ID:** [\`${user.id}\`](https://discord.com/users/${user.id})`, inline: true },
                { name: "Reason", value: `\`\`\`${reason}\`\`\``, inline: false },
            )
            .setFooter({ text: `Appeal ID: ${row.insertId}`, iconURL: client.user.avatarURL({ dynamic: true }) });
    
            let buttons = new client.discord.MessageActionRow()
            .addComponents(
                new client.discord.MessageButton()
                    .setCustomId('acceptAppeal')
                    .setLabel(`Accept`)
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new client.discord.MessageButton()
                    .setCustomId('denyAppeal')
                    .setLabel(`Deny`)
                    .setStyle('DANGER')
            )
    
            await backend.post(client, reportConfirmEmbed, buttons, 'appeal').catch(e => {});
            res.redirect('/');
        });
    });

    // API Routing
    app.get('/api', async function(req, res) {
        res.render('api.ejs', { config: client.config });
    });

    app.get('/api/fetchallbans', async function(req, res) {
        await con.query(`SELECT * FROM bannedusers`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) {
                // If the user is not banned
                let json_ = [];
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            } else {
                // If the user is banned
                let json_ = row;
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            };
        });
    });

    app.get('/api/checkuser/:userid', async function(req, res) {
        if(!req?.params?.userid) return res.redirect('/');
        req.params.userid = await req.params.userid.replaceAll('`', '').replaceAll('"', '').replaceAll("'", "");
        await con.query(`SELECT * FROM bannedusers WHERE userid="${req?.params?.userid}" AND active=true`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) {
                // If the user is not banned
                let json_ = {
                    "active": false, // This means that the user is not banned
                }
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            } else {
                // If the user is banned
                let json_ = {
                    "active": true,
                    "userid": row[0].userid,
                    "reason": row[0].reason,
                    "proof": row[0].proof || 'None provided...',
                    "staff": row[0].bannedby,
                    "time": row[0].bannedat
                }
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            };
        });
    });

    app.get('/api/banhistory/:userid', async function(req, res) {
        if(!req?.params?.userid) return res.redirect('/');
        req.params.userid = await req.params.userid.replaceAll('`', '').replaceAll('"', '').replaceAll("'", "");
        await con.query(`SELECT * FROM bannedusers WHERE userid="${req?.params?.userid}"`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) {
                // If the user is not banned
                let json_ = [];
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            } else {
                // If the user is banned
                let json_ = row;
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            };
        });
    });

    // FierwallGG API
    app.get('/firewallgg/checkuser/:userid', async function(req, res) {
        if(!req?.params?.userid) return res.redirect('/');
        req.params.userid = await req.params.userid.replaceAll('`', '').replaceAll('"', '').replaceAll("'", "");
        await con.query(`SELECT * FROM bannedusers WHERE userid="${req?.params?.userid}" AND active=true`, async (err, row) => {
            if(err) throw err;
            if(!row[0]) {
                // If the user is not banned
                let json_ = {
                    "active": false, // This means that the user is not banned
                }
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            } else {
                // If the user is banned
                let json_ = {
                    "active": true,
                    "userid": row[0].userid,
                    "reason": row[0].reason,
                    "proof": row[0].proof || 'None provided...',
                    "time": row[0].bannedat
                }
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            };
        });
    });

    // Discord Authentication
    app.get('/auth/discord', passport.authenticate('discord'));
    app.get('/auth/discord/callback', passport.authenticate('discord', {failureRedirect: '/'}), async function(req, res) {
        req.session?.loginRef ? res.redirect(req.session.loginRef) : res.redirect('/');
        delete req.session?.loginRef
    });

    // Searched the redirects for the page (must be 1 before 404 page)
    client.config.website.redirects.forEach(element => {
        app.get(`/${element.name}`, (req, res) => {
            res.redirect(element.link);
        });
    });

    // MAKE SURE THIS IS LAST FOR 404 PAGE REDIRECT
    app.get('*', function(req, res){
        res.render('404.ejs');
    });

};