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
            dm_permission: true,
            name: "",
            type: 2
        };

        // 1. Type & Nom
        console.clear();
        console.log("🍽️ 1/7 - Menu Type");
        console.log("2 = User Menu | 3 = Message Menu");
        config.type = parseInt(await this.requireInput("Type (2 or 3): ", val => ["2", "3"].includes(val))) as 2 | 3;

        console.clear();
        config.name = await this.requireInput("Name (1-32 chars): ", val => val.length >= 1 && val.length <= 32);
        await this.nsfw(config)

        // 2. Permissions
        console.clear();
        console.log("🔐 2/7 - Command Permissions");
        await this.addPermissions(config);

        // 3. DM
        console.clear();
        console.log("💬 3/7 - DM Permissions");
        config.dm_permission = await this.yesNoInput("Authorize in DM ? (y/n): ");

        console.clear();
        console.log("💬 4/7 - Context");
        const ctx = await this.context()
        if(ctx.length > 0){
            config.contexts = ctx
        }

        console.clear();
        console.log("💬 5/7 - Integration Type");
        const int_type = await this.integration_context()
        if(ctx.length > 0){
            config.integration_types = int_type
        }

        // 4. Guild Specific
        console.clear();
        console.log("⚙️ 6/7 - Guild Specific");
        if(await this.yesNoInput("Guild Specific ? (y/n): ")) {
            config.guild_ids = await this.optionalGuildIds();
        }

        // 5. Save
        console.clear();
        console.log("💾 7/7 - Save");
        const filename = await this.requireInput("Filename : ");
        await this.saveFile(FolderName.CONTEXT_MENU, filename, config);
    }
}