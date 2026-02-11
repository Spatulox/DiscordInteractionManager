import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import {PermissionFlagsBits} from "discord.js";
import {DiscordRegex} from "../../utils/DiscordRegex";
import {ContextMenuConfig, SlashCommandConfig} from "../type/InteractionType";

export abstract class InteractionGeneratorCLI extends BaseCLI {
    protected abstract getTitle(): string

    protected abstract readonly menuSelection: MenuSelectionCLI

    protected abstract execute(): Promise<void>;

    protected async nsfw(config: SlashCommandConfig | ContextMenuConfig): Promise<void> {
        if(await this.yesNoInput("NSFW ? (y/n)")){
            config.nsfw = true
        }
    }

    protected async addPermissions(config: SlashCommandConfig | ContextMenuConfig): Promise<void> {
        console.clear();

        const permEntries = Object.entries(PermissionFlagsBits);
        const numberedPerms = permEntries.map(([name, _value], index) =>
            `${index + 1}. ${name}`
        ).join('\n');

        console.log("Valid Permissions:\n" + numberedPerms);

        const input = await this.requireInput(
            "Permission numbers (comma-separated, 'everyone', or leave empty): ",
            (val) => {
                if (!val.trim() || val.toLowerCase() === 'everyone') return true;

                return val.split(',').every(numStr => {
                    const num = parseInt(numStr.trim());
                    return num >= 1 && num <= permEntries.length && !isNaN(num);
                });
            },
            true
        );

        if (!input.trim() || input.toLowerCase() === 'everyone') {
            config.default_member_permissions_string = [''];
            config.default_member_permissions = 0n.toString();
            return;
        }

        const selectedNums = input.split(',').map(n => parseInt(n.trim()));
        const selectedPermNames: (keyof typeof PermissionFlagsBits)[] = [];

        for (const i of selectedNums) {
            const entry = permEntries[i];
            if (entry) {
                selectedPermNames.push(entry[0] as keyof typeof PermissionFlagsBits);
            }
        }

        config.default_member_permissions_string = selectedPermNames;
        config.default_member_permissions = this.permissionsToBitfield(selectedPermNames);
    }


    protected async optionalGuildIds(): Promise<string[] | undefined> {
        const input = await this.prompt("Guild IDs (separated by comma, or 'none' to cancel): ");
        return input.trim() && input.toLowerCase() !== 'none'
            ? input.split(',').map(id => id.trim()).filter(DiscordRegex.GUILD_ID.test.bind(DiscordRegex.GUILD_ID))
            : undefined;
    }

    private permissionsToBitfield(perms: string[] | undefined): string {
        if (!perms || perms.length === 0) return 0n.toString();

        let bits = 0n;
        for (const name of perms) {
            const value = (PermissionFlagsBits as Record<string, bigint>)[name];
            if (!value) {
                console.warn(`Unknow permission in default_member_permissions: ${name}`);
                continue;
            }
            bits |= value;
        }

        return bits.toString();
    }
}