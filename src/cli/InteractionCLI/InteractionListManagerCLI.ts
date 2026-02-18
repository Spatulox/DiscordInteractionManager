import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import { BaseInteractionManager } from "../interactions/BaseInteractionManager";
import {GuildListManager} from "../GuildListManager";
import {Env} from "../../Env";
import {Guild} from "discord.js";
import {PathUtils} from "../../utils/PathUtils";
import {FileManager} from "../../utils/FileManager";

export class InteractionListManagerCLI extends BaseCLI {

    protected menuSelection: MenuSelectionCLI;
    protected readonly manager: BaseInteractionManager;
    protected readonly managerKey: string;

    protected getTitle(): string {
        return `${this.managerKey} - ${this.manager.folderPath}`;
    }

    constructor(parent: BaseCLI, manager: BaseInteractionManager, managerKey: string) {
        super(parent);
        this.manager = manager;
        this.managerKey = managerKey;
        this.menuSelection = [
            { label: `List Global ${this.manager.folderPath}`, action: () => this.listRemote() },
            { label: `List Specific ${this.manager.folderPath} for a Guild`, action: async () => this.guildListRemote(await new GuildListManager(Env.clientId, Env.token).chooseGuild()) },
            { label: `Count ${this.manager.folderPath} per Guilds`, action: async () => this.guildListAllRemote() },
            { label: `Save ${this.manager.folderPath} into local file`, action: async () => this.getAndSaveToLocalFile() },
            { label: 'Back', action: () => this.goBack() },
        ];
    }

    protected execute(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected async listRemote(): Promise<void> {
        await this.manager.list();
    }

    protected async guildListRemote(guild: Guild | null): Promise<void> {
        if(!guild) {
            return
        }
        await this.manager.listGuild(guild.id)
    }

    protected async guildListAllRemote(): Promise<void> {
        await this.manager.listAllGuilds(await new GuildListManager(Env.clientId, Env.token).list(false))
    }

    protected async getAndSaveToLocalFile(){
        const commands  = await this.manager.list()
        for (const cmd of commands) {
            await FileManager.writeJsonFile(PathUtils.createPathFolder("generated_"+this.manager.folderPath), cmd.name, cmd)
        }
    }
}