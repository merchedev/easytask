interface ToDo {
	'file-path':string,
	'file-line':number,
	message:string
}

interface FolderStructure {
	[folder: string]: ToDo[] | FolderStructure;
}