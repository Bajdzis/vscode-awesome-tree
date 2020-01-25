import * as fs from 'fs';
import * as path from 'path';

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

        const content = JSON.stringify(fileData, null, 2);
        const parentDir = path.dirname(extensionsPath);

        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir);
        }

        fs.writeFileSync(extensionsPath, content, {});

    } catch (error) {
        console.log(error);
    }
}
