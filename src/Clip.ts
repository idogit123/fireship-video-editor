import { TreeItem, TreeItemCollapsibleState } from "vscode"

export class Clip extends TreeItem {
    constructor(
        label: string
    ) {
        super(label, TreeItemCollapsibleState.None)
    }
}

