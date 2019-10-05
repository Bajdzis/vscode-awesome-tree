import * as fs from 'fs';
import * as path from 'path';
import * as process from 'child_process';

export function addExtensionToRecommendations(workspaceDirectory: string){
    try {
        const extensionsPath = path.join(workspaceDirectory, '.vscode', 'extensions.json');
        let fileData;
        if (fs.existsSync(extensionsPath)) {
            fileData = JSON.parse(fs.readFileSync(extensionsPath).toString());
            if (!Array.isArray(fileData.recommendations)) {
                fileData.recommendations = [];
            }
            if (fileData.recommendations.includes('bajdzis.awesome-tree')) {
                return;
            }
        } else {
            fileData = {
                recommendations: []
            };
        }
        fileData.recommendations.push('bajdzis.awesome-tree');

        fs.writeFileSync(extensionsPath, JSON.stringify(fileData, null, 2));

        process.spawn('git add ".vscode/extensions.json" -f');
    } catch (error) {
        console.log(error);
    }
}
