import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function buscarTodosLosArchivos(directory: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isDirectory()) {
            // Ignorar la carpeta node_modules
            if (file !== 'node_modules') {
                buscarTodosLosArchivos(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function buscarTODOsEnArchivo(filePath: string): { archivo: string, linea: number, texto: string }[] {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    const todos: { archivo: string, linea: number, texto: string }[] = [];


    lines.forEach((line, index) => {

			if (line.includes('// TODO') || line.includes('//TODO') && !line.includes("'//TODO'") && !line.includes('"//TODO"') && !line.includes("'// TODO'") && !line.includes('"// TODO"')) {
				todos.push({
						archivo: filePath,
						linea: index + 1,
						texto: line.trim()
				});
			}
    });

    return todos;
}

export function buscarTODOsEnProyecto(): { archivo: string, linea: number, texto: string }[] {
    const directorioProyecto = vscode.workspace.rootPath;

    if (!directorioProyecto) {
        vscode.window.showWarningMessage('No se encontró un proyecto abierto.');
        return [];
    }

    const archivos = buscarTodosLosArchivos(directorioProyecto);
    let todos: { archivo: string, linea: number, texto: string }[] = [];

    archivos.forEach(archivo => {
        const nuevosTodos = buscarTODOsEnArchivo(archivo);
        // console.log('todos: ', nuevosTodos);
        todos = todos.concat(nuevosTodos);
    });

    return todos;
}

// Ejecutar la función para buscar TODOs en el proyecto actualmente abierto en VS Code
const todosEnProyecto = buscarTODOsEnProyecto();
console.log(todosEnProyecto);
