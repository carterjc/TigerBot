# TigerBot

The Unofficial Princeton Discord Bot, or **TigerBot**, is a student created tool aimed to facilitate the delivery of Princeton-related information to incoming and current students.

## Abstract

There are three main components involved in the data flow

- parsing from Princeton websites
- storing parsed data
- manipulating stored data and presenting it via Discord

## Future

If this project is to be maintained, we need to expand upon the current structure and add parsing capabilities for new sites, store more data (and maybe in another format - not JSON), and increase bot functionality.

If this is developed, we can also add Discord authentication via Princeton email addresses (which would be cool!)

Currently, data is stored via JSON files. This is functional, but not scalable for more use cases. A potential new release of TigerBot could incorporate an API linked to a DB to enable CRUD operations - greatly expanding possibilities. Additionally, the use of an API would allow for TigerBot to become a 'TigerSuite'; a so called 'TigerSuite' would enable the same information TigerBot provides to be accessible in different mediums. While a Discord Bot is helpful and convenient for some, others do not use Discord. Thus, it can be said that TigerBot alienates part of the Princeton community.

Presently, TigerBot can be seen as a wrapper and aggregator for certain aspects of the Princeton domain. Before expanding functionality and bettering the end user experience, TigerBot must aim to provide more functionality.

## Contributing Guide

If you have an idea for the bot or want to report a bug, please open an issue with the appropriate tag in this repo.

If you want to contribute to a certain issue, open a new branch titled TB-#. For example, issue #2 would be developed on a branch titled TB-2. You can create a new branch via CLI with `git checkout -b *name*`.

When developing code, you will need to create a .env file in the root directory. Enter the following fields:

```env
DISCORD_TOKEN=**the bot's token**
SENDGRID_API_KEY=**sendgrid api key token**
CLIENT_ID=**the bot's id**
GUILD_ID=**the testing server id**
ENV=dev
```

Note: if you don't plan on testing email verification functionality, don't include the `SENDGRID_API_KEY` field.

For now, please create a bot of your own and use its token for development. In order to find the ids, enter into Discord's development mode under Settings > Advanced > Developer Mode. Then you can right click on any object and press 'copy id'.

When you believe you are done with the given feature, make a pull request with a short description of what you completed. Someone will then review your code and either merge the code or send it back.
