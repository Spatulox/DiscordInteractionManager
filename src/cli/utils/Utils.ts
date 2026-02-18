import {PermissionFlagsBits} from "discord.js";

export class Utils {

    static permissionsToBitfield(perms: string[] | undefined): string | number | undefined {
        if (!perms || perms.length === 0) return undefined;

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

    static bitfieldToPermissions(bitfield: string | number | bigint | undefined): string[] {
        if (!bitfield) return [];

        const bits = BigInt(bitfield);
        const result: string[] = [];

        for (const [name, value] of Object.entries(PermissionFlagsBits)) {
            if ((bits & value) === value) {
                result.push(name);
            }
        }

        return result;
    }
}