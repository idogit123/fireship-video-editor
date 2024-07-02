import { Command, TreeItem, TreeItemCollapsibleState } from "vscode"

export class Frame extends TreeItem {
    content: string
    command: Command

    constructor(
        label: string,
        content: string
    ) {
        super(label, TreeItemCollapsibleState.None)
        this.content = content
        this.command = new FrameCommand(this)
    }

    toJSON()
    {
        return {
            label: this.label,
            content: this.content
        }
    }

    static fromJSON(frameJson: { label: string, content: string })
    {
        return new Frame(frameJson.label, frameJson.content)
    }
}

class FrameCommand implements Command {
    title: string
    command: string
    tooltip?: string | undefined
    arguments?: any[] | undefined

    constructor(frame: Frame)
    {
        this.title = "Fireship: Show Frame"
        this.command = "fireship-video-editor.showFrame"
        this.arguments = [frame]
    }
}