import * as vscode from "vscode";
import { findTodosInProject } from "./todos";


export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class WebviewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true, 
      localResourceRoots: [this._extensionUri],
    };

		webviewView.webview.onDidReceiveMessage((message) => {
			switch (message.command) {
					case 'openFile':
						this.openFile(message.text, message.line);
						break;
					case 'refresh':
						this.setView(webviewView.webview, message.viewName);
    				break;
					case 'setView':
						this.setView(webviewView.webview, message.viewName);
    				break;
					default:
							break;
			}
		});

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }
	openFile(filePath: string, lineNumber: number) {
		vscode.workspace.openTextDocument(filePath).then((document) => {
				vscode.window.showTextDocument(document).then((editor) => {
						const position = new vscode.Position(lineNumber - 1, 0);
						editor.selection = new vscode.Selection(position, position);
						editor.revealRange(new vscode.Range(position, position));
				});
		});
	}
	setView(webview: vscode.Webview, viewName:'none' | 'files' | 'folders'){
		let htmlContent = '';
		const todos:ToDo[] = findTodosInProject();

		const workspaceFolder = vscode.workspace.workspaceFolders;
		if(!workspaceFolder){
			htmlContent = 'No project currently opened.';
		} else {
			if(todos.length <= 0) {
				htmlContent = 'Nothing to do.';
			} else { 

				if(viewName.toLowerCase() === 'none'){

					let todoLiEls = todos.map((todo:ToDo) => this.getTodoEl(todo, false)).join('');
					htmlContent = `<ul>${todoLiEls}</ul>`;

				} else if(viewName.toLowerCase() === 'files'){

					htmlContent = this.getAccordionFileViewContent(todos);
					
				} else if(viewName.toLowerCase() === 'folders'){

					const folderStructure = todos.reduce((folderStructure: FolderStructure, todo:ToDo)=> this.getFolderStructure(folderStructure, todo), {});

					htmlContent = this.getAccordionFolderViewContent(folderStructure, '');

				}
			}
		}
		webview.postMessage({ command: 'loadContent', content: htmlContent });
	}

	getFolderStructure(folderStructure: FolderStructure, todo:ToDo) {

		const { 'file-path': filePath } = todo;
		const workspaceFolder         = vscode.workspace.workspaceFolders;
		const splittedFileParts       = workspaceFolder ? filePath.split(workspaceFolder[0].uri.path): filePath;
		const folders                 = splittedFileParts[1].split('/').filter(folder => folder.trim() !== ''); 
		let currentFolder             = folderStructure;

		for (const folder of folders) {
	
				if (!currentFolder[folder]){ currentFolder[folder] = {}; }

				currentFolder = currentFolder[folder] as FolderStructure;
		}

		if (!currentFolder['todos']) { currentFolder['todos'] = []; }

		(currentFolder['todos'] as ToDo[]).push(todo);
		return folderStructure;
	}

	getAccordionFileViewContent(todos: ToDo[]): string {
		const workspaceFolder = vscode.workspace.workspaceFolders;
		const fileGroups = todos.reduce((acc: { [key: string]:ToDo[] }, todo:ToDo) => {

				if (!acc[todo['file-path']]) {
						acc[todo['file-path']] = [];
				}
				acc[todo['file-path']].push(todo);
				return acc;
		}, {});

		let content = '';
		for (const key in fileGroups) {
			const splittedFileParts = workspaceFolder ? key.split(workspaceFolder[0].uri.path) : key;
			const fileName = splittedFileParts[1];
			const els = fileGroups[key];

			const todoLiEls = els.map(todo => this.getTodoEl(todo, true)).join('');
			content += this.getAccordionEl(fileName, 'file', `<ul>${todoLiEls}</ul>`);

		}
		return content;
	}

	getAccordionFolderViewContent(folderStructure: FolderStructure, currentPath: string): string {
			let htmlContent = '';

			for (const folder in folderStructure) {
					const fullPath = currentPath + '/' + folder;
					const contents = folderStructure[folder];
					if (Array.isArray(contents)) {

							const todoLiEls = contents.map(todo => this.getTodoEl(todo, true)).join('');
							htmlContent += /*HTML*/ `<ul>${todoLiEls}</ul>`;
								
					} else if (Object.keys(contents).length > 0) {
						const isFile  = folder.split('.').length >1;
						const icon    = isFile ? 'file' : 'folder';
						const content = this.getAccordionFolderViewContent(contents as FolderStructure, fullPath);

						htmlContent += this.getAccordionEl(folder, icon, content); 
					}
			}
			
			return htmlContent;
	}

	getAccordionEl(title:string, icon:string, content:string){
		return /* HTML */ `
			<accordion-wc data-title="${title}" data-icon="${icon}">
				<div slot="content-${title}">${content}</div>
			</accordion-wc>`;
	}

	getTodoEl(todo:ToDo, hideName:boolean){
		const workspaceFolder   = vscode.workspace.workspaceFolders;
		const splittedText      = todo.message.split(/\/\/\s*TODO\b/g);
		const todoText          = splittedText[splittedText.length - 1].trim();
		const splittedFileParts = workspaceFolder ? todo['file-path'].split(workspaceFolder[0].uri.path) : todo['file-path'];
		const fileName = hideName ? 'line' : splittedFileParts[1];

		return /* HTML */ `
			<todo-button data-name="${fileName}" data-path="${todo['file-path']}" data-line="${todo['file-line']}" data-msg="${todoText}"></todo-button>
			`;

	}

  private _getHtmlForWebview(webview: vscode.Webview) {

    const nonce = getNonce();
		

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const dropdownSelectButtonWC = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'components','dropdown-select-button.js'));
		const todoButtonWC = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'components','todo-button.js'));
		const accordionWC = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'components','accordion-wc.js'));
		const dropdownIconButtonWC = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'components','dropdown-icon-button.js'));
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));

    const html = /* HTML */`
		<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">

				<script defer nonce="${nonce}" type="module" src="${scriptUri}"></script>
				<script defer nonce="${nonce}" type="module" src="${dropdownSelectButtonWC}"></script>
				<script defer nonce="${nonce}" type="module" src="${todoButtonWC}"></script>
				<script defer nonce="${nonce}" type="module" src="${accordionWC}"></script>
				<script defer nonce="${nonce}" type="module" src="${dropdownIconButtonWC}"></script>
			</head>
      <body>
				<header>
					<h1>TODO's</h1>
					<div div class="buttons-wrapper">
						<dropdown-icon-button data-title="group by" data-icon="group-by" data-options="none,check|files,check|folders,check"></dropdown-icon-button>

						<button id="refresh-button" class="icon-button" title="Refresh">
							<svg class="icon-button__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/></svg>
						</button>
					</div>
				</header>
				
				<div class="container">
				</div>
				
			</body>
			</html>`;

			return html;
  }
}
