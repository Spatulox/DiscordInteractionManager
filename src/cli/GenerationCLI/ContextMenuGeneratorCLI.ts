import { MenuSelectionCLI } from "../BaseCLI";
import { FolderName } from "../../type/FolderName";
import {ContextMenuConfig} from "../type/InteractionType";
import {InteractionGeneratorCLI} from "./InteractionGeneratorCLI";

export class ContextMenuGeneratorCLI extends InteractionGeneratorCLI {
    protected getTitle(): string {
        return "🍽️ Context Menu JSON Generator";
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "Generate Context Menu", action: () => this },
        { label: "Back", action: () => this.goBack() },
    ];

    protected async execute(): Promise<void> {
        const config: ContextMenuConfig = {
            name: "",
            type: 2,
            dm_permission: false,
            integration_types: [0, 1]
        };

        // 1. Type & Nom
        console.clear();
        console.log("🍽️ 1/5 - Menu Type");
        console.log("2 = User Menu | 3 = Message Menu");
        config.type = parseInt(await this.requireInput("Type (2 or 3): ", val => ["2", "3"].includes(val))) as 2 | 3;

        console.clear();
        config.name = await this.requireInput("Name (1-32 chars): ", val => val.length >= 1 && val.length <= 32);
        await this.nsfw(config)

        // 2. Permissions
        console.clear();
        console.log("🔐 2/5 - Command Permissions");
        await this.addPermissions(config);

        // 3. DM
        console.clear();
        console.log("💬 3/5 - DM Permissions");
        config.dm_permission = await this.yesNoInput("Authorize in DM ? (y/n): ");

        // 4. Guild Specific
        console.clear();
        console.log("⚙️ 4/5 - Guild Specific");
        if(await this.yesNoInput("Guild Specific ? (y/n): ")) {
            config.guild_ids = await this.optionalGuildIds();
        }

        // 5. Save
        console.clear();
        console.log("💾 5/5 - Save");
        const filename = `${config.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        await this.saveFile(FolderName.CONTEXT_MENU, filename, config);
    }
}