import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getInfoAboutPath, PathInfo } from './fileInfo/getInfoAboutPath';
import { createVariableTemplate } from './fileInfo/createVariableTemplate';
import { renderVariableTemplate } from './fileInfo/renderVariableTemplate';

export function activate(context: vscode.ExtensionContext) {

	const fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*",false, true, true);
	fileSystemWatcher.onDidCreate((uri: vscode.Uri) => {
		const relative = getRelative(uri.path);
		
		// when directory or file is not empty probably change name parent directory
		if (isEmptyDirectory(uri)) {
			const parentDir = path.dirname(uri.fsPath);
			const newDirname = path.basename(uri.fsPath);
			const infoAboutNewDirectory = getInfoAboutPath(relative);
			const directories: {[key:string]: {
				directoryInfo: PathInfo;
				files: string[];
			}} = {};
			
			const directoryNames = fs.readdirSync(parentDir);
			directoryNames.forEach(subDirectoryOrFiles => {
				const subDirectoryOrFilesPath = path.resolve(parentDir, subDirectoryOrFiles);
				if(fs.lstatSync(subDirectoryOrFilesPath).isDirectory() && newDirname !== subDirectoryOrFiles){
					const files = getAllFilesPath(subDirectoryOrFilesPath);
					const directoryInfo = getInfoAboutPath(getRelative(subDirectoryOrFilesPath));
					directories[subDirectoryOrFiles] = {
						directoryInfo,
						files:files.map((fileName) => createVariableTemplate(fileName.replace(subDirectoryOrFilesPath, ''),[directoryInfo]))
					}
				}
			});

			Object.values(directories)
				.reduce((files, data) => [
					...files,
					...data.files.filter((file) => !files.includes(file))
				], [] as string[])
				.map(filePath => {
					const template: string = renderVariableTemplate(filePath, [infoAboutNewDirectory]);
					const newFilePath = path.join(uri.path, template);
					ensureDirectoryExistence(newFilePath);
					fs.writeFile(newFilePath,'',{}, async () => {
						const textDocument = await vscode.workspace.openTextDocument(newFilePath);
						if (textDocument) {
							vscode.window.showTextDocument(textDocument);
						}
					});
					return template;
				});

			
		} else if(isFile(uri)) {
			console.log(getInfoAboutPath(relative));
			// fill files
		}
	});

	function ensureDirectoryExistence(filePath:string) {
		const dirname = path.dirname(filePath);
		if (fs.existsSync(dirname)) {
			return true;
		}
		ensureDirectoryExistence(dirname);
		fs.mkdirSync(dirname);
	}

	function getAllFilesPath(dir: string): string[] {
		const list = fs.readdirSync(dir);
		let results: string[]  = [];
		list.forEach((file) => {
			const fullFilePath = path.resolve( dir, file);
			let stat = fs.statSync(fullFilePath);
			if (stat && stat.isDirectory()) { 
				results = results.concat(getAllFilesPath(fullFilePath));
			} else { 
				results.push(fullFilePath);
			}
		});
		return results;
	}

	function getRelative(path: string) {
		const { workspaceFolders } = vscode.workspace;
		if(!workspaceFolders){
			return path;
		}
		for (let i = 0; i < workspaceFolders.length; i++) {
			const dirPath = workspaceFolders[i].uri.path;
			path = path.replace(dirPath, '');
		}
		return path;
	}

	function isDirectory(uri: vscode.Uri): boolean  {
		return fs.lstatSync(uri.fsPath).isDirectory()
	}

	function isEmptyDirectory(uri: vscode.Uri): boolean {
		return isDirectory(uri) && !fs.readdirSync(uri.fsPath).length
	}

	function isFile(uri: vscode.Uri): boolean  {
		return fs.lstatSync(uri.fsPath).isFile();
	}

}

export function deactivate() {}
