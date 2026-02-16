import {Env} from "../Env";

export class PathUtils {
    static createPathFolder(interactionType: string){
        return `${Env.interactionFolderPath}/${interactionType}${Env.dev ? "_dev" : ""}`
    }

    static createPathFile(interactionType: string, filename: string){
        return `${this.createPathFolder(interactionType)}/${filename}`
    }
}