#!/usr/bin/env node
import readline from "readline";
import {FileManager} from "../utils/FileManager";
import {Env} from "../Env";
import {PathUtils} from "../utils/PathUtils";

export type MenuSelectionCLI = {
    label: string; // The Label for the Menu Choice
    action: () => BaseCLI | Promise<any> | null
}[]

/**
 * --- BaseCLI ---
 */
export abstract class BaseCLI {
    private static _rl: readline.Interface | null = null;

    protected get rl() {
        if (!BaseCLI._rl) {
            BaseCLI._rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        }
        return BaseCLI._rl;
    }

    constructor(protected parent?: BaseCLI) {}

    protected abstract readonly menuSelection: MenuSelectionCLI;
    protected abstract execute(): Promise<void>;

    protected getTitle(): string {
        return "BaseCLI";
    }

    protected async showMainMenu(): Promise<void> {
        console.clear();
        console.log(this.getTitle());
        console.log('═'.repeat(40));

        this.menuSelection.forEach((option, index) => {
            console.log(`${index + 1}. ${option.label}`);
        });
        console.log('═'.repeat(40));

        const choice = await this.prompt('Choose an option: ');

        if(choice == "exit") {
            return this.goBack()
        }

        const choiceIndex = parseInt(choice) - 1;

        if (choiceIndex >= 0 && choiceIndex < this.menuSelection.length) {
            const option = this.menuSelection[choiceIndex];
            if(!option){
                console.log("Invalid Choice")
                return this.showMainMenu();
            }

            const result = await option.action();
            if (result instanceof BaseCLI) {
                if(result == this){
                    await this.execute();
                } else {
                    return await result.showMainMenu();
                }
            }
        }

        await this.prompt('Press Enter to continue...');
        return this.showMainMenu();
    }

    protected async prompt(question: string): Promise<string> {
        return new Promise(resolve => this.rl.question(question, resolve));
    }

    protected async requireInput(message: string, validator?: (val: string) => boolean, canBeEmpty: boolean = false): Promise<string>{
        while (true) {
            const value = (await this.prompt(message));
            if (!value && !canBeEmpty) {
                console.log("⚠️  This field is required. Please enter a value.");
                continue;
            }
            if (validator && !validator(value)) {
                console.log("⚠️  Invalid input. Try again.");
                continue;
            }
            return value;
        }
    }

    protected async yesNoInput(message: string): Promise<boolean> {
        while (true) {
            const value = (await this.prompt(message));
            if (!value) {
                console.log("⚠️  This field is required. Please enter a value.");
                continue;
            }
            if (!["y", "n", "yes", "no"].includes(value.toLowerCase())) {
                console.log("⚠️  Invalid input. Try again.");
                continue;
            }
            return value == "y" || value == "yes";
        }
    }

    protected async showHelp(): Promise<void> {
        console.clear();
        console.log('');
        console.log('||| HELP - Discord Bot Command Manager CLI |||');
        console.log('');
        console.log('🔗 Wiki: https://github.com/Spatulox/DiscordInteractionManager/wiki');
        console.log('═'.repeat(80));
        console.log('🤖 What it does:');
        console.log('  • Manage your Discord interactions (slash commands & context menus) via an interactive CLI');
        console.log('  • Let you deploy/update/delete any interaction');
        console.log('  • Let you generate interactions files');

        console.log('');
        console.log('How generated interaction files are stored');
        console.log('📁 Folder Structure:');
        console.log(`  ├── ${Env.interactionFolderPath}/`);
        console.log('  │   ├── commands/     ← Slash Commands (type 1)');
        console.log('  │   └── context_menu/ ← Context Menus (type 2/3)');

        console.log('');
        console.log('🎯 Features:');
        console.log('  📊 1. List Remote    → Show deployed commands on Discord');
        console.log('  🚀 2. Deploy Local   → Deploy local JSON files → Discord');
        console.log('  🔄 3. Update Remote  → Update Discord commands based on local JSON file');
        console.log('  🗑️ 4. Delete Remote → Remove Discord commands based on local JSON file');

        console.log('');
        console.log('🎮 Selection:');
        console.log('  • Numbered lists appear after the interaction list');
        console.log('  • Enter: "1,3,5" or "all" to select which interaction you want to apply the action');

        console.log('');
        console.log('🔗 Wiki: https://github.com/Spatulox/DiscordInteractionManager/wiki');
        console.log('🔗 Bugs: https://github.com/Spatulox/DiscordInteractionManager/issues')
        console.log('═'.repeat(80));

        await this.prompt('Press Enter to continue...');
        if (this.parent) {
            await this.parent.showMainMenu();
        } else {
            await this.showMainMenu();
        }
    }

    protected async goBack(): Promise<void> {
        if(this.parent){
            return this.parent?.showMainMenu();
        }
        return this.execute() // Fallback for MainCLI
    }


    protected async saveFile<T>(
        folderName: string,
        filename: string,
        data: T,
    ): Promise<void> {
        let finalFilename = filename;
        if(await FileManager.readJsonFile(PathUtils.createPathFile(folderName, filename.split(".json")[0] + ".json"))){
            if (!await this.yesNoInput(`"${finalFilename}" already exists. Overwrite? (y/n): `)) {
                const timestamp = Date.now();
                finalFilename = `${filename.replace('.json', '')}-${timestamp}`;
                console.log(`📝 New filename: ${finalFilename}`);
            }
        }

        // 2. Preview + Confirmation
        console.clear();
        console.log("✨ Final JSON preview:");
        console.log(JSON.stringify(data, null, 2));

        if (!await this.yesNoInput("\nSave this file? (y/n): ")) {
            console.log("Cancelled");
            await this.prompt('Press Enter to continue...');
            return this.showMainMenu();
        }

        try {
            await FileManager.writeJsonFile(PathUtils.createPathFolder(folderName), finalFilename, data);
            console.log(`File saved: ${PathUtils.createPathFile(folderName, finalFilename)}`);
        } catch (error) {
            console.error("Error saving file:", error);
        }

        return
    }
}
