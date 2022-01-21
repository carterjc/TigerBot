# TigerBot

Presently encompassing most of the project, the `/bot` subdirectory stores code responsible for **TigerBot**, Princeton's Unofficial Discord Bot.

## Specifications

TigerBot makes use of the following packages:

- discord.js
- chalk v4
- dotenv
- nodemon (dev)
- eslint (dev)

An .eslintrc.json file is defined to specify ESLint requirements. Github actions enforces ESLINT formatting missed during local development.

TigerBot is deployed on Heroku, configured onsite and with the Procfile. View the blog post at [cartercostic.com](https://www.cartercostic.com/posts/2022-01-08-heroku-subdirectory) to find out more information concerning Heroku deployment.

## Structure

- The `deploy-commands.js` file is responsible for registering slash commands with Discord.
- `index.js` is responsible for running the bot client itself, logging in to Discord and instantiating functionality
- The `/commands` directory contains all of TigerBot's slash commands in individual files
- `/data` is the temporary store for all parsed Princeton related data and anything else used for the bot
- Files in `/events` are responsibel for monitoring certain Discord actions. The most important action for TigerBot is `interactionCreate.js` which routes a user's request for a slash command to the functionality for the command itself
- `/handlers` aid in registering commands with the Discord client and Discord itself as well as routing event functionality
- The `/utils` subdirectory contains files used elsewhere in TigerBot. It mainly serves to promote reusable, abstracted code

## Permissions

SCOPES: [ bot, application.commands ]
BOT PERMISSIONS: [ ADMINISTRATOR ]

In order for the /socials command to work (it parses previous message history), TigerBot requires Administrator privileges
