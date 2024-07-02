// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Frame } from './Frame';
import { Clip } from './Clip';
import { readFileSync, writeFileSync } from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "fireship-video-editor" is now active!');
	const currentClip = new Clip([])
	
	context.subscriptions.concat(
		vscode.commands.registerCommand('fireship-video-editor.newClip', () => {
			currentClip.setClip([])
			vscode.window.showInformationMessage("New clip set.")
		}),

		vscode.commands.registerCommand('fireship-video-editor.saveFrameLast', async () => {
			saveFrame(currentClip, false)
		}),

		vscode.commands.registerCommand('fireship-video-editor.saveFrameFirst', async () => {
			saveFrame(currentClip, true)
		}),

		vscode.commands.registerCommand('fireship-video-editor.showFrame', (frame: Frame) => {
			const status = setEditorContent(frame.content)
			if (status.error)
				vscode.window.showErrorMessage(status.error)

			else 
				currentClip.currentFrame = currentClip.frames.indexOf(frame)
		}),

		vscode.commands.registerCommand('fireship-video-editor.saveClip', async () => {
			const saveDir = await vscode.window.showOpenDialog({
				"title": "Pick a directory",
				"openLabel": "Select",
				"canSelectFiles": false,
				"canSelectFolders": true,
				"canSelectMany": false
			})
			if (!saveDir)
				return;

			const clipName = await vscode.window.showInputBox({
				"title": "Name the clip",
				"validateInput": (value) => value.length > 0 ? null : "Name cant be empty!",
				"placeHolder": "New Clip",
				"ignoreFocusOut": true
			}) ?? "New Clip"

			const clipPath = `${saveDir[0].fsPath}\\${clipName}.json`

			try {
				writeFileSync(clipPath, JSON.stringify(currentClip.toJSON()), { flag: "w+" })
				// w+ flag ensures that the file is created if it doesn’t exist, 
				// and if it does, it will be truncated (emptied) before writing new data to it.

				vscode.window.showInformationMessage(`Clip: "${clipName}" saved successfuly.`)
			}
			catch {
				vscode.window.showErrorMessage('Error saving clip.')
			}
		}),

		vscode.commands.registerCommand('fireship-video-editor.loadClip', async () => {
			const clipFile = await vscode.window.showOpenDialog({
				"title": "Pick a clip",
				"openLabel": "Select Clip",
				"canSelectFiles": true,
				"canSelectFolders": false,
				"canSelectMany": false,
				"filters": { "Clip": ["json"] }
			})
			if (!clipFile)
				return;

			const clipJson = readFileSync(clipFile[0].fsPath)

			currentClip.fromJSON(JSON.parse(clipJson.toString()))
			currentClip.showFrame()
		}),

		vscode.commands.registerCommand('fireship-video-editor.nextFrame', () => {
			currentClip.nextFrame()
		}),

		vscode.commands.registerCommand('fireship-video-editor.prevFrame', () => {
			currentClip.prevFrame()
		}),

		vscode.commands.registerCommand('fireship-video-editor.deleteFrame', (deleteFrame: Frame) => {
			const deleteFrameIndex = currentClip.frames.indexOf(deleteFrame)
			currentClip.frames.splice(deleteFrameIndex, 1)

			currentClip.changeClipEventEmitter.fire()
		})
	);

	vscode.window.registerTreeDataProvider(
		'fireship-video-editor.clipView',
		currentClip
	)
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getEditorContents() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor)
		return undefined

	const editorContents = activeEditor.document.getText();
	return editorContents
}

function setEditorContent(content: string) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor)
		return { error: "No active text editor." }

	const edit = new vscode.WorkspaceEdit();
	const documentUri = activeEditor.document.uri;
	const range = new vscode.Range(0, 0, activeEditor.document.lineCount, 0);
	edit.replace(documentUri, range, content);
	vscode.workspace.applyEdit(edit);
	return { success: true }
}

async function saveFrame(currentClip: Clip, isSaveFirst: boolean)
{
	const frameContent = getEditorContents()
	if (frameContent == undefined || frameContent.length == 0)
	{
		vscode.window.showErrorMessage('No content to save to frame.')
		return;	
	}

	const defaultLabel = `Frame #${currentClip.frames.length + 1}`
	const frameLabel = await vscode.window.showInputBox({
		"title": "Label the frame",
		"validateInput": (value) => value.length > 0 ? null : "Lebel cant be empty!",
		"placeHolder": defaultLabel,
		"ignoreFocusOut": true
	}) ?? defaultLabel

	currentClip.addFrame(
		new Frame(frameLabel, frameContent),
		isSaveFirst
	)
}