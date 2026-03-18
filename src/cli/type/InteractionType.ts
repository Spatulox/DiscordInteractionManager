import {PermissionFlagsBits} from "discord.js";

export enum CommandType {
    SLASH = 1,
    USER_CONTEXT_MENU,
    MESSAGE_CONTEXT_MENU,
}

export enum InteractionIntegrationType {
    GUILD_INSTALL = 0,
    USER_INSTALL = 1,
}

export enum InteractionContextType {
    SERVER_CHANNEL,
    BOT_DM,
    GROUP_DM
}

export enum DiscordCommandType {
    CHANT_INPUT = 1,
    USER,
    MESSAGE
}

export enum DiscordOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER,
    CHANNEL,
    ROLE,
    MENTIONABLE,
    NUMBER,
    ATTACHMENT
}

export enum ChannelType { // DM and GroupDM are missing for a reason
    Text = 0,
    Voice = 2,
    Category = 4,
    Announcement = 5,
    ThreadPublic = 10,
    ThreadPublicAnnouncement = 11,
    ThreadPrivate = 12,
    Forum = 15,
    Media = 16
}

export type PermissionString = keyof typeof PermissionFlagsBits | string;


export interface Choice {
    name: string;
    value: string;
}

export interface CommandOption {
    type: DiscordOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: Choice[];
    options?: CommandOption[];
    min_length?: number;
    max_length?: number;
    min_value?: number;
    max_value?: number;
    channel_types?: number[];
    autocomplete?: boolean;
}

interface OnlineInteractionConfigBase {
    id: string;
    name: string;
    version: string;
    application_id: string,
    type: number;
    guild_id?: string;
    default_member_permissions?: string | bigint | number | null;
    dm_permission: boolean;
    integration_types?: InteractionIntegrationType[];
    contexts?: InteractionContextType[];
    nsfw?: boolean;
}

export interface OnlineCommandConfig extends OnlineInteractionConfigBase {
    description: string,
    options: CommandOption[],
    type: 1
}

export interface OnlineContextMenuConfig extends OnlineInteractionConfigBase {
    type: 2 | 3
}

export type OnlineInteractionConfig = OnlineCommandConfig | OnlineContextMenuConfig;












interface InteractionConfig {
    name: string;
    type: CommandType;
    default_member_permissions?: string | bigint | number | null;
    default_member_permissions_string?: PermissionString[];
    dm_permission: boolean;
    integration_types?: InteractionIntegrationType[];
    contexts?: InteractionContextType[];
    nsfw?: boolean;
}

interface LocalCommand extends InteractionConfig {
    command_scope: string;
    description: string;
    options?: any[];
    filename?: string
}

export type SpecificCommandId = Record<string, string | null>;
export interface SpecificGuildCommand extends LocalCommand {
    command_scope: 'guild';
    id?: SpecificCommandId;
}

export interface GlobalGuildCommand extends LocalCommand {
    command_scope: 'global';
    id?: string;
}

export type Command = SpecificGuildCommand | GlobalGuildCommand

export interface SlashCommandConfig extends InteractionConfig{
    name: string;
    description: string;
    type: 1;
    options?: CommandOption[];
}

export interface ContextMenuConfig extends InteractionConfig {
    name: string;
    type: 2 | 3;
}