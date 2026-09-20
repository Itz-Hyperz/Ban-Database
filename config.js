const _config = {
  // Client Settings (REQUIRED)
  token: 'YOUR_BOT_TOKEN', // The token from your Discord Dev Portal
  themeColor: '#FFFFFF', // The color of the theme for the bot (hex code)
  aboutServer: "YOUR_BOT_DESCRIPTION", // A brief description of your community (Not Required)
  date_format: 'MM-DD-YYYY HH:mm', // The date format for the bot

  // Application Settings (REQUIRED)
  cliThemeColor: 'blue', // The theme color for the main logger (blue, red, green, yellow, magenta)
  port: '3000', // The port for the bot to listen on
  debugmode: true, // Toggles the logging of errors and excess information

  // MySQL Settings (REQUIRED)
  database: {
    host: 'localhost', // The IP of your SQL Server
    user: 'root', // The username for your SQL Server
    password: '', // The password for of the user for your SQL Server
    database: 'bandb', // The database designated for the bot
  },

  website: {
    enabled: false, // Toggles the website for the bot
    domain: 'http://example.com', // The domain of your website (No trailing /)
    oauthId: 'YOUR_OAUTH_ID', // The client ID of your bot
    oauthToken: 'YOUR_OAUTH_SECRET', // The client secret of your bot

    siteName: "Ban DB",
    siteSlogan: "Ban DB | Better Security",
    siteFooter: "BanDB Project",
    siteDescription: "Ban DB is the next generation of security on Discord. Need protection? We've got you covered!",
    
    redirects: [
      { 
        name: 'discord',
        link: 'https://github.com/itz-hyperz'
      },
      { 
        name: 'hyperz',
        link: 'https://github.com/itz-hyperz'
      }
    ]
  },

  botOwners: ['704094587836301392', 'YOUR_USER_ID_HERE'], // The owner Ids of the bot (can add staff members)

  guildLogs: 'YOUR_CHANNEL_ID', // The ID of the channel to log guild creations/deletions
  reportLogs: 'YOUR_CHANNEL_ID', // The ID of the channel to log reports
  appealLogs: 'YOUR_CHANNEL_ID', // The ID of the channel to log appeals

  // Slash Commands Settings
  commands: {
    ephemeral: false, // Will make most slash commands ephemeral (Recommended: false)
  },

  // Presence Settings (REQUIRED)
  presence: {
    name: '{guilds} guilds to stop {bans} banned users',
    type: 'COMPETING',
    status: 'dnd',
  },
};

module.exports = _config;
