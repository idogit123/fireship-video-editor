import { ProviderResult, TreeDataProvider, TreeItem } from "vscode";
import { Clip } from "./Clip";

export class TreeClipProvider implements TreeDataProvider<Clip> {
    getTreeItem(element: Clip): TreeItem | Thenable<TreeItem> {
        return element
    }

    getChildren(element?: Clip | undefined): ProviderResult<Clip[]> {
        return [];
    }
}