# Discord Interaction Manager

A lightweight CLI tool to manage Discord bot interactions (slash commands, context menus) in under 30 seconds. Deploy, update, delete, and generate interaction files with an interactive terminal interface.

✨ Features

    📡 Interaction Management: List, deploy, update, delete global/guild commands & context menus

    ⚙️ File Generation: Interactive JSON generators for slash commands & context menus

    🔍 Guild Discovery: Auto-detect all guilds + command counts per guild

    🎛️ Interactive CLI: Rich menus, input validation, command selection

    📦 Only one runtime deps: Only discord.js is required in production
    
    🛡️ Never deprecated: Uses discord.js for all Discord requests and enum, always up-to-date with Discord API


> This documentation assume that you know how interactions are built on Discord, if not, please see :
> - [Overview](https://docs.discord.com/developers/interactions/overview)
> - [Receiving and responding](https://docs.discord.com/developers/interactions/receiving-and-responding)
> - [Application Commands](https://docs.discord.com/developers/interactions/application-commands)
>   - [Slash Commands](https://docs.discord.com/developers/interactions/application-commands#slash-commands)
>   - [User Commands](https://docs.discord.com/developers/interactions/application-commands#user-commands)
>   - [Message Commands](https://docs.discord.com/developers/interactions/application-commands#message-commands)

### ⚠️ Discord "Activities" are not supported, even if it's a type of interaction, since it's a complete game feature.

## Quick Start
```bash
npm install @spatulox/discord-interaction-manager
```

### Env variables :
You can use dotenv or set them by hand
```
DISCORD_BOT_TOKEN="" // Discord Bot Token
DISCORD_BOT_CLIENTID="" // The clientID of your bot
DISCORD_INTERACTION_FOLDER="" // Optionnal, redirect where the generated interactions files are stored
```

## Run the tool
Simply type "dim" in your console (which stands for DiscordInteractionManager)
```bash
dim
```

You will be greet by a CLI :
```
💠 SimpleDiscordBot CLI
════════════════════════════════════════
1. Manage Interactions
2. Generate Files
3. Help
4. Exit
════════════════════════════════════════
Choose an option: 
```

## How it works
### Creating an interaction
- You can generate slash commands and context menu with the cli
- When generating files with the cli, you should be able to see generated files in the ./handlers*

### Update an interaction
- You can update any interaction, by updating the generated file inside the ./handlers folder*
- If you want to update the default_member_permissions_string field with the keyof PermissionBitFields of discordjs (or let it empty for everyone), it will automatically update the default_member_permissions field



Key:
* Folder at the root of your project, if not, make sure you didn't overwrite the path with the DISCORD_INTERACTION_FOLDER variable