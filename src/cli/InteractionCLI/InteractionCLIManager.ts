import {BaseCLI, MenuSelectionCLI} from "../BaseCLI";
import { BaseInteractionManager, Command } from "../interactions/BaseInteractionManager";
import {Guild, GuildListManager} from "../GuildListManager";
import {Env} from "../../Env";

export class InteractionManagerCLI extends BaseCLI {

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
            { label: "Deploy local", action: () => this.handleDeploy() },
            { label: "Update remote", action: () => this.handleUpdate() },
            { label: "Delete remote", action: () => this.handleDelete() },
            { label: 'Back', action: () => this.goBack() },
        ];
    }

    protected execute(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async listRemote(): Promise<void> {
        await this.manager.list();
    }

    private async guildListRemote(guild: Guild | null): Promise<void> {
        if(!guild) {
            return
        }
        await this.manager.listGuild(guild.id)
    }

    private async guildListAllRemote(): Promise<void> {
        await this.manager.listAllGuilds(await new GuildListManager(Env.clientId, Env.token).list(false))
    }

    private async handleDeploy(): Promise<void> {
        const selected = await this.selectCommands(this.manager, await this.manager.listFromFile());
        if (selected.length === 0) return;
        await this.manager.deploy(selected);
    }

    private async handleUpdate(): Promise<void> {
        let guild
        const rep = await this.yesNoInput("Do you want to update a global command or a specific guild command (y=global/n=specific): ")

        console.log('═'.repeat(80));
        console.log(`ACTUAL DEPLOYED ${this.manager.folderPath?.toUpperCase()}`)
        if(rep){
            await this.listRemote()
        } else {
            guild = await new GuildListManager(Env.clientId, Env.token).chooseGuild()
            await this.guildListRemote(guild);
        }
        console.log('═'.repeat(80));
        console.log(`ACTUAL LOCAL ${this.manager.folderPath?.toUpperCase()}`)
        const selected = await this.selectCommands(this.manager, await this.manager.listFromFile(false, guild?.id));
        if (selected.length === 0) return;
        await this.manager.update(selected);
    }

    private async handleDelete(): Promise<void> {

        const rep = await this.yesNoInput("Do you want to delete a global command or a specific guild command (y=global/n=specific): ")

        let commands: Command[]
        if(rep){
            commands = await this.manager.list()
        } else {
            let guild = await new GuildListManager(Env.clientId, Env.token).chooseGuild()
            if(!guild){
                console.log("Error, cannot find guild")
                return
            }
            commands = await this.manager.listGuild(guild?.id)
        }

        const selected = await this.selectCommands(this.manager, commands);
        if (selected.length === 0) return;
        await this.manager.delete(selected);
    }

    private async selectCommands(manager: BaseInteractionManager, commands: Command[]): Promise<Command[]> {
        const handlerManagerType = `${manager.folderPath}(s)`;

        if (!commands?.length) {
            console.log(`No ${handlerManagerType} found`);
            return [];
        }

        const input = await this.prompt('Enter numbers (ex: 1,3,5 or "all" or "exit"): ');
        if (input.toLowerCase() === 'all') return commands;
        if (input.toLowerCase() === 'exit') return [];

        const indices = input.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        const selected = commands.filter((cmd: any) => indices.includes(cmd.index));

        if (selected.length === 0) {
            console.log('Invalid number');
            return [];
        }

        console.log(`${selected.length} selected ${handlerManagerType}`);
        return selected;
    }
}