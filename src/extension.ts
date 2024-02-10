import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";

export function activate(context: vscode.ExtensionContext) {
	 	const sidebarProvider = new SidebarProvider(context.extensionUri);
		let disposable = vscode.window.registerWebviewViewProvider("easytask.webView", sidebarProvider);
    context.subscriptions.push(disposable);
}
