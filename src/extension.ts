import * as vscode from "vscode";
import { WebviewProvider } from "./WebviewProvider";

export function activate(context: vscode.ExtensionContext) {
	 	const sidebarProvider = new WebviewProvider(context.extensionUri);
		let disposable = vscode.window.registerWebviewViewProvider("easytask.webView", sidebarProvider);
    context.subscriptions.push(disposable);
}
