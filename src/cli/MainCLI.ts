#!/usr/bin/env node
import {BaseCLI, MenuSelectionCLI} from "./BaseCLI";
import {InteractionCLI} from "./InteractionCLI/InteractionCLI";
import {GenerationCLI} from "./GenerationCLI/GenerationCLI";
import {Env} from "../Env";

/**
 * --- MainCLI ---
 * Main controller for sub menu
 */
export class MainCLI extends BaseCLI {

    protected getTitle(): string {
        return "💠 SimpleDiscordBot CLI";
    }

    constructor() {
        super();
        const {clientId, token} = Env
        if(!clientId || !token){
            throw new Error("Missing clientId or token");
        }
        this.showMainMenu();
    }

    protected readonly menuSelection: MenuSelectionCLI = [
        { label: "Manage Interactions", action: () => new InteractionCLI(this) },
        { label: "Generate Files", action: () => new GenerationCLI(this) },
        { label: "Help", action: () => this.showHelp() },
        { label: "Exit", action: () => this },
    ];

    protected execute(): Promise<void> {
        console.log("👋  Bye !")
        process.exit()
    }
}

new MainCLI()