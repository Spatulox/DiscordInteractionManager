# Discord Interaction Manager

A lightweight CLI tool to manage Discord bot interactions (slash commands, context menus) in under 30 seconds. Deploy, update, delete, and generate interaction files with an interactive terminal interface.

✨ Features

    📡 Interaction Management: List, deploy, update, delete global/guild commands & context menus

    ⚙️ File Generation: Interactive JSON generators for slash commands & context menus

    🔍 Guild Discovery: Auto-detect all guilds + command counts per guild

    🎛️ Interactive CLI: Rich menus, input validation, command selection

    📦 Only one runtime deps: Only discord.js is required in production
    
    🛡️ Never deprecated: Uses discord.js for all Discord requests - no breaking changes, always up-to-date with Discord API

## Quick Start
```bash
npm install @spatulox/discord-interaction-manager
```

### Env variables :
You can use dotenv or set them by hand
```
DISCORD_BOT_TOKEN="" // Discord Bot Token
DISCORD_BOT_CLIENTID="" // The clientID of your bot
```

## Run the tool
Simply type "dim" in your console (which stands for DiscordInteractionManager)
```bash
dim
```
You will be greet by a CLI