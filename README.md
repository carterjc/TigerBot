# Princeton Discord Bot

Currently, this is a PoC that is not fully fleshed out.

There are three main components involved in the data flow

- parsing from Princeton websites
- storing parsed data
- manipulating stored data and presenting it via Discord (note, this can be presented in other forms)

## Future

If this project is to be maintained, we need to expand upon the current structure and add parsing capabilities for new sites, store more data (and maybe in another format - not JSON), and increase bot functionality.

If this is developed, we can also add Discord authentication via Princeton email addresses (which would be cool)

## Contributing Guide

If you have an idea for the bot or want to report a bug, please open an issue with the appropriate tag in this repo. If you want to contribute to a certain issue, open a new branch titled TB-#. For example, issue #2 would be developed on a branch titled TB-2. You can create a new branch via CLI with `git checkout -b *name*`.

When developing code, you will need to create a .env file in the root directory. Enter the following fields:

```env
DISCORD_TOKEN=**the bot's token**
CLIENT_ID=**the bot's id**
GUILD_ID=**the testing server id**
ENV=dev
```

For now, please create a bot of your own and use its token for development. In order to find the ids, enter into Discord's development mode under Settings > Advanced > Developer Mode. Then you can right click on any object and press 'copy id'.

When you believe you are done with the given feature, make a pull request with a short description of what you completed. Someone will then review your code and either merge the code or send it back.
