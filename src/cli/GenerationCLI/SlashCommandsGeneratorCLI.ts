import { MenuSelectionCLI } from "../BaseCLI";
import { FolderName } from "../../type/FolderName";
import {ChannelType, Choice, CommandOption, DiscordOptionType, SlashCommandConfig} from "../type/InteractionType";
import {InteractionGeneratorCLI} from "./InteractionGeneratorCLI";

export class SlashCommandGeneratorCLI extends InteractionGeneratorCLI {
    protected getTitle(): string {
        return "📝 Slash Command JSON Generator";
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "Generate Slash Command", action: () => this },
        { label: "Back", action: () => this.goBack() },
    ];

    protected async execute(): Promise<void> {
        const config: SlashCommandConfig = {
            type: 1,
            name: "",
            description: "",
            options: [],
            dm_permission: false,
            integration_types: [0, 1],
            contexts: [0]
        };

        console.clear();
        console.log("📝 1/6 - Base");
        config.name = await this.requireInput(
            "Name (a-z0-9_-, 1-32 chars): ",
            val => /^[a-z0-9_-]{1,32}$/.test(val)
        );
        config.description = await this.requireInput(
            "Description (1-100 chars): ",
            val => val.length >= 1 && val.length <= 100
        );

        console.clear();
        console.log("🔐 2/6 - Command Permissions");
        await this.addPermissions(config);

        console.clear();
        console.log("💬 3/6 - DM Permissions");
        config.dm_permission = await this.yesNoInput("Authorize DM ? (y/n): ");

        console.clear();
        console.log("⚙️ 4/6 - Options/Subcommands");
        await this.addOptions(config.options!);

        console.clear();
        console.log("⚙️ 5/6 - Guild Specific");
        if(await this.yesNoInput("Guild Specific ? (y/n): ")) {
            config.guild_ids = await this.optionalGuildIds();
        }

        console.clear();
        console.log("💾 6/6 - Save");
        const filename = await this.requireInput("Filename : ");
        await this.saveFile(FolderName.SLASH_COMMANDS, filename.split(".json")[0] ?? filename, config);
    }

    private async addOptions(options: CommandOption[]): Promise<void> {
        const addOptions = await this.yesNoInput("Add options/subcommands ? (y/n): ");
        if (!addOptions) return;

        while (true) {
            console.clear();
            console.log("🚀 Options type :");
            console.log("Valid options : " +
                Object.entries(DiscordOptionType)
                    .filter(([, value]) => typeof value === 'number')
                    .map(([key, value]) => `${value}.${key}`)
                    .join(', ')
            );

            const numericValues = Object.values(DiscordOptionType).filter((v): v is DiscordOptionType => typeof v === 'number');
            const maxType = Math.max(...numericValues);
            const minType = Math.min(...numericValues);


            const type = parseInt(await this.requireInput(
                `Type (${minType}-${maxType}): `,
                val => {
                    const n = parseInt(val);
                    return n >= minType && n <= maxType;
                }
            )) as DiscordOptionType;

            const option = await this.buildOption(type);
            options.push(option);

            if (!await this.yesNoInput("Other option ? (y/n): ")) break;
        }
    }

    private async buildOption(type: DiscordOptionType): Promise<CommandOption> {
        const name = await this.requireInput(
            "Option name (a-z0-9_-, 1-32): ",
            val => /^[a-z0-9_-]{1,32}$/.test(val)
        );
        const description = await this.requireInput(
            "Description (1-100): ",
            val => val.length >= 1 && val.length <= 100
        );
        const required = type !== 2 && await this.yesNoInput("Required ? (y/n): ");

        const option: CommandOption = { type, name, description, required };

        await this.handleOptionType(option, type);

        if (type === 1 || type === 2) {
            option.options = [];
            await this.addOptions(option.options!);
        }

        return option;
    }

    private async handleOptionType(option: CommandOption, type: DiscordOptionType): Promise<void> {
        switch (type) {
            case 3: // STRING
                if (await this.yesNoInput("Autocomplete ? ")) option.autocomplete = true;
                option.min_length = await this.optionalNumber("Min length: ");
                option.max_length = await this.optionalNumber("Max Length: ");
                if (!option.autocomplete) option.choices = await this.addChoices();
                break;

            case 4: case 10: // INTEGER/NUMBER
                option.min_value = await this.optionalNumber("Min value: ");
                option.max_value = await this.optionalNumber("Max value: ");
                if (type === 4) option.choices = await this.addChoices();
                break;

            case 7: // CHANNEL
                option.channel_types = await this.addChannelTypes();
                break;
        }
    }

    private async optionalNumber(prompt: string): Promise<number | undefined> {
        const input = await this.prompt(prompt);
        return input.trim() ? parseFloat(input) : undefined;
    }

    private async addChoices(): Promise<Choice[] | undefined> {
        if (!await this.yesNoInput("Add Choices (25 max) ? ")) return undefined;

        const choices: Choice[] = [];
        while (choices.length < 25) {
            const name = await this.requireInput("Choice name (≤100): ", val => val.length <= 100);
            const value = await this.requireInput("Choice value (≤100): ", val => val.length <= 100);
            choices.push({ name, value });

            if (!await this.yesNoInput("Another choice ? ")) break;
        }
        if(choices.length >= 25){
            console.log("You can't have 25+ choices")
        }
        return choices;
    }

    private async addChannelTypes(): Promise<number[] | undefined> {
        console.log("Types: " +
            Object.entries(ChannelType)
                .filter(([, value]) => typeof value === 'number')
                .map(([name, value]) => `${value}. ${name}`)
                .join(', ')
        );

        const input = await this.requireInput(
            "Types (separated by comma, or leave empty for all): ",
            (val) => {
                if (!val.trim()) return true;

                const trimmed = val.trim().toLowerCase();
                if (trimmed === 'all') return true;

                return val.split(',').every(i => {
                    const num = parseInt(i.trim());
                    return !isNaN(num) && Object.values(ChannelType).includes(num);
                });
            },
            true
        );

        if (!input.trim() || input.trim() == 'all') return undefined;

        return input.split(',').map(i => parseInt(i.trim()));
    }

}
