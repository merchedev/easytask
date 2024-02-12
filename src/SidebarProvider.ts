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

export class SidebarProvider implements vscode.WebviewViewProvider {
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
						webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
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

	drawTodos(todos: {file:string, line:number, text:string}[], workspaceFolder:any){
		return todos.map((todoObject:{file:string, line:number, text:string}) => {
				const splittedText      = todoObject.text.split(/\/\/\s*TODO\b/g);
				const todoText          = splittedText[splittedText.length - 1].trim();
				const splittedFileParts = todoObject.file.split(workspaceFolder[0].uri.path);
				const fileName = splittedFileParts[1];

				const el = /* HTML */ `
					<li>
						<button class="todo-button" data-path="${todoObject.file}" data-line="${todoObject.line}" >
							<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 384 512"><path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM305 273L177 401c-9.4 9.4-24.6 9.4-33.9 0L79 337c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L271 239c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
							<div class="text-wrapper">
								<p class="file-text">${fileName}:${todoObject.line}</p>
								<p class="todo-text">${todoText}</p>
							</div>
							<svg xmlns="http://www.w3.org/2000/svg" class="caret" viewBox="0 0 256 512"><path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"/></svg>
						</button>
					</li>
					`;

					return el;
			}).join('');
	}

  private _getHtmlForWebview(webview: vscode.Webview) {

    const nonce = getNonce();
		let htmlContent = '';

		const todos = findTodosInProject();
		const workspaceFolder = vscode.workspace.workspaceFolders;
		if(!workspaceFolder){
			htmlContent = 'No project currently open';
		} else {
			if(todos.length <= 0) {
				htmlContent = 'Nothing to do.';
			} else { 
				htmlContent = this.drawTodos(todos, workspaceFolder);
			}
		}

		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));

    const content = /* HTML */`
		<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet">

				<script defer nonce="${nonce}" src="${scriptUri}"></script>
			</head>
      <body>
				<header>
					<h1>TODO's</h1>
					<button class="refresh-button" onclick="refreshPage">
						<svg class="refresh-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/></svg>
					</button>
				</header>
				<ul>
					${htmlContent}
				</ul>
			</body>
			</html>`;

			return content;
  }
}
