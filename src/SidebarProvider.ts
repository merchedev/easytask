import * as vscode from "vscode";
// const { buscarTODOsEnProyecto } = require('./buscarTodosLosArchivos');
import { buscarTODOsEnProyecto } from './buscarTodosLosArchivos';

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
      enableScripts: true, //TODO
      localResourceRoots: [this._extensionUri],
    };

		webviewView.webview.onDidReceiveMessage((message) => {
			switch (message.command) {
					case 'openFile':
							this.abrirArchivo(message.text, message.line);
							break;
					default:
							break;
			}
		});

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

	abrirArchivo(filePath: string, lineNumber: number) {
			vscode.workspace.openTextDocument(filePath).then((document) => {
					vscode.window.showTextDocument(document).then((editor) => {
							const position = new vscode.Position(lineNumber - 1, 0);
							console.log('hola click');
							editor.selection = new vscode.Selection(position, position);
							editor.revealRange(new vscode.Range(position, position));
					});
			});
	}

  private _getHtmlForWebview(webview: vscode.Webview) {

    const nonce = getNonce();
		let htmlContent = '';
		//TODO poner más bonito
		//TODO quitar TODO
		const todos = buscarTODOsEnProyecto();

		console.log('buscar todos: ', todos);
		if(todos.length <= 0) {
			htmlContent = 'No hay un proyecto abierto o no tienes nada que hacer';
		} else { //TODO comentario
			
			htmlContent = todos.map((todoObject:any) => {
				const partes = todoObject.texto.split(/\/\/\s*TODO\b/g); // Dividir por //TODO con o sin espacios
				const todoText = partes[partes.length - 1].trim();
				const fileParts = todoObject.archivo.split('/');
				const fileName = fileParts[fileParts.length - 1];

				const el = /* HTML */ `
					<li>
						<button onclick="tsvscode.postMessage({ command: 'openFile', text: '${todoObject.archivo}', line: ${todoObject.linea} })" >${fileName}:${todoObject.linea}</button>
						<div class="wrapper">
							<input type="checkbox" id="${fileName}:${todoObject.linea}" name="${fileName}:${todoObject.linea}" />
							<label for="${fileName}:${todoObject.linea}">${todoText}</label>
						</div>
					</li>
					`;

					return el;
			}).join('');
		}

    const content = /* HTML */`
		<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<script nonce="${nonce}">const tsvscode = acquireVsCodeApi(); </script>
				<style>

					body {
						background-color: var(--vscode-editor-background);
						color: var(--vscode-editor-foreground);
					}

					ul{
						list-style: none;
						padding: 0;
					}
					button{
						border-bottom: 1px solid rgb(86 96 116);
						padding: 0.5em 0;
						font-family: inherit;
						font-size: inherit;
						hyphens: auto;
						background-color: transparent;
						color: var(--vscode-editor-foreground);
						display: block;
						appearance: none;
						outline: none;
						box-shadow: none;
						border: none;
						transition:all 0.2s ease;
						cursor:pointer;
					}
					button:hover{
						font-weight:600;
					}

					li{
						border-bottom: 1px solid rgb(86 96 116);
						padding: 0.5em 0;
						
						width: 100%;
						
						align-items: start;
						display: flex;
    				flex-direction: column;
						
					}

					p{
						font-size: 0.9em;
						font-weight: 500;
						opacity: 0.6;
					}
					label{
						font-size: 1.15em;
					}
					input{
						margin: 0;
    				transform: translateY(0.15em);
					}
					.wrapper{
					
					}
				</style>
			</head>
      <body>
				<h1>TODO's</h1>
				<ul>
					${htmlContent}
				</ul>
			</body>
			</html>`;

			return content;
  }
}
