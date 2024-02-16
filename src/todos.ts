import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const ignoreFoldersArr = ['node_modules', '.git', 'build', 'out'];

export function getCommentsOnCode(filePath:string) {
    const code     = fs.readFileSync(filePath, 'utf8');
    const comments = [];

    //? Regular expression to match single line comments
    const singleLineCommentRegex = /\/\/\s*TODO.*|#\s*TODO[^\n]*|(--\s*TODO[^\n]*)/gi;

    //? Regular expression to match block comments
    const blockCommentRegex = /\/\*+\s*TODO[\s\S]*?\*\/|<!--\s*TODO[\s\S]*?-->|'''\s*TODO\s*.*?\s*'''|"""\s*TODO\s*.*?\s*"""/gi;

    //? Extract single line comments
    let match;
    let lineNumber = 0;
		
    while ((match = singleLineCommentRegex.exec(code)) !== null) {

				const todoWord = /todo\s*:*/gi;
				const splittedText = match[0].trim().toLocaleLowerCase().split(todoWord);
				const commentText = splittedText[1];

        const lines = code.substring(0, match.index).split('\n');
        lineNumber = lines.length;

        comments.push({ 'file-path': filePath, 'file-line': lineNumber, message: commentText });
    }

    //? Extract block comments
    while ((match = blockCommentRegex.exec(code)) !== null) {
				const todoWord = /todo\s*:*/gi;
				const splittedText = match[0].trim().toLocaleLowerCase().split(todoWord);
				const commentText = splittedText[1];
				const withoutEndOfBlock = commentText.replace(/([\s\S]-+->|\/\*\s*$|[\s\S]\*+\/|[\s\S]'''|[\s\S]""")/gi, '');
        const lines = code.substring(0, match.index).split('\n');
        lineNumber = lines.length + commentText.split('\n').length - 1;
        comments.push({ 'file-path': filePath, 'file-line': lineNumber, message: withoutEndOfBlock });
    }

    return comments;
}

function searchThroughFiles(directory: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!ignoreFoldersArr.includes(file)) {
                searchThroughFiles(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    });

    return fileList;
}

export function findTodosInProject():ToDo[] {
    const projectDir = vscode.workspace.rootPath;

    if (!projectDir) {
        vscode.window.showWarningMessage('No opened project found.');
        return [];
    }

    const files = searchThroughFiles(projectDir);
    let todos: ToDo[] = [];

    files.forEach(file => {
        const foundTodos = getCommentsOnCode(file);
        todos = todos.concat(foundTodos);
    });

    return todos;
}