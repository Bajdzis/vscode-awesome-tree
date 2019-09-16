import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getInfoAboutPath, PathInfo } from './fileInfo/getInfoAboutPath';
import { createVariableTemplate } from './fileInfo/createVariableTemplate';
import { renderVariableTemplate } from './fileInfo/renderVariableTemplate';

type Directories = {
	[key:string]: {
		directoryInfo: PathInfo;
		files:{
			pathTemplate: string;
			contentTemplate: string;
		}[];
	}
};

export function activate(context: vscode.ExtensionContext) {

	const fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*",false, true, true);
	fileSystemWatcher.onDidCreate(async(uri: vscode.Uri) => {
		try {
			const relative = getRelative(uri.fsPath);

			// when directory or file is not empty probably change name parent directory
			if (isEmptyDirectory(uri)) {
				const parentDir = path.dirname(uri.fsPath);
				const newDirname = path.basename(uri.fsPath);
				const infoAboutNewDirectory = getInfoAboutPath(relative);
				const directories: Directories = {};
				
				const directoryNames = fs.readdirSync(parentDir);
				directoryNames.forEach(subDirectoryOrFiles => {
					const subDirectoryOrFilesPath = path.resolve(parentDir, subDirectoryOrFiles);
					if (fs.lstatSync(subDirectoryOrFilesPath).isDirectory() && newDirname !== subDirectoryOrFiles) {
						const files = getAllFilesPath(subDirectoryOrFilesPath);
						const directoryInfo = getInfoAboutPath(getRelative(subDirectoryOrFilesPath));
						directories[subDirectoryOrFiles] = {
							directoryInfo,
							files:files.map((fileName) => ({
								pathTemplate: createVariableTemplate(fileName.replace(subDirectoryOrFilesPath, ''),[directoryInfo]),
								contentTemplate: createVariableTemplate(fs.readFileSync(fileName).toString(),[directoryInfo])
							}))
						};
					}
				});

				const preparePathFiles = Object.values(directories)
					.reduce((files, data) => [
						...files,
						...data.files.map(file => file.pathTemplate).filter((file) => !files.includes(file))
					], [] as string[]);

				const answersQuestion = [
					'Yes, generate files', 
					'No, thanks'
				];

				const resultQuestion = await vscode.window.showInformationMessage(
					`Do you want to create ${preparePathFiles.length} file(s) in new "${newDirname}" folder?`,
					...answersQuestion
				);

				if (resultQuestion !== answersQuestion[0]) {
					return;
				}

				preparePathFiles.map(filePathTemplate => {
						const filePath: string = renderVariableTemplate(filePathTemplate, [infoAboutNewDirectory]);
						const newFilePath = path.join(uri.fsPath, filePath);
						const content = createFileContent(filePathTemplate, directories, [infoAboutNewDirectory]);

						ensureDirectoryExistence(newFilePath);
						fs.writeFile(newFilePath, content, {}, async () => {
							const textDocument = await vscode.workspace.openTextDocument(newFilePath);
							if (textDocument) {
								vscode.window.showTextDocument(textDocument);
							}
						});
						return filePath;
					});

				
			} else if(isFile(uri)) {
				console.log(getInfoAboutPath(relative));
				// fill files
			}
		} catch (error) {
			const result = await vscode.window.showErrorMessage(
				`Something go wrong :( ${error.toString()}`,
				'Create issue od GitHub'
			);

			if (result === 'Create issue od GitHub') {
				vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/Bajdzis/vscode-awesome-tree/issues/new'));
			}

		}
	});

	function createFileContent(templateStringPath:string, directories: Directories, variables: PathInfo[]): string {
		const contents: Array<string[]> = [];
		Object.values(directories).forEach(directory => {
			directory.files.forEach(({pathTemplate, contentTemplate}) => {
				if (pathTemplate === templateStringPath) {
					const lines = contentTemplate.split(encodeURIComponent("\n"));
					contents.push(lines);
				}
			})
		});

		if (contents.length === 0) {
			return '';
		}
		
		const [baseFile, ...otherFiles] = contents;
		const lineToGenerate: string[] = [];

		baseFile.forEach(line => {
			if(allFilesIncludeThisLine(otherFiles, line)){
				lineToGenerate.push(renderVariableTemplate(line, variables))
			}
		});

		return lineToGenerate.join("\n");
	}

	function allFilesIncludeThisLine(files: Array<string[]>, line: string): boolean{
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if(!file.includes(line)){
				return false;
			}
		}
		return true;
	}

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
			const dirPath = workspaceFolders[i].uri.fsPath;
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
