import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, commands, TreeView} from "vscode";
import { window } from "vscode"
import { Frame } from "./Frame";

export class Clip implements TreeDataProvider<Frame> {
    frames: Frame[]
    changeClipEventEmitter = new EventEmitter<void | Frame | Frame[] | null | undefined>()
    currentFrame: number
    view: TreeView<Frame>

    constructor(clip: Frame[])
    {
        this.frames = clip
        this.currentFrame = 0
        this.view = window.createTreeView<Frame>(
            'fireship-video-editor.clipView',
            {
                treeDataProvider: this,
            }
        )
    }

    addFrame(newFrame: Frame, isSaveFirst: boolean)
    {
        if (isSaveFirst)
            this.frames.splice(0, 0, newFrame)
        else
            this.frames.push(newFrame)
        this.changeClipEventEmitter.fire()
    } 

    setClip(newClip: Frame[])
    {
        this.frames = newClip
        this.changeClipEventEmitter.fire()
    }

    getTreeItem(element: Frame): TreeItem | Thenable<TreeItem> {
        return element
    }

    getChildren(element?: Frame | undefined): ProviderResult<Frame[]> {
        if (element) return [];
        else return this.frames
    }

    onDidChangeTreeData?: Event<void | Frame | Frame[] | null | undefined> | undefined = this.changeClipEventEmitter.event;

    toJSON()
    {
        return this.frames.map((frame) => frame.toJSON())
    }

    fromJSON(clipJson: { label: string, content: string }[])
    {
        this.frames = clipJson.map((frameJson) => Frame.fromJSON(frameJson))
        this.changeClipEventEmitter.fire()
    }

    showFrame()
    {
        if (this.frames.length == 0)
            return;

        console.log('update')
        this.view.reveal(this.frames[this.currentFrame], { focus: true })
        commands.executeCommand('fireship-video-editor.showFrame', this.frames[this.currentFrame])
    }

    nextFrame()
    {
        if (this.currentFrame + 1 >= this.frames.length)
            return;

        this.currentFrame += 1
        this.showFrame()
    }

    prevFrame()
    {
        if (this.currentFrame - 1 < 0)
            return;

        this.currentFrame -= 1
        this.showFrame()
    }

    getParent(element: Frame): ProviderResult<Frame> 
    {
        return undefined    
    }
}