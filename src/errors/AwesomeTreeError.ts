export class AwesomeTreeError extends Error {
    private debugInfo: { [key: string]: any };

    constructor(message: string, debugInfo: { [key: string]: any }) {
        super(message);
        this.debugInfo = debugInfo;
    }

    getDebugInfo = () => {
        return { ...this.debugInfo };
    }

    getTitle = () => {
        return this.message;
    }

    getBody = () => [
        `${this.getTitle()}`,
        '',
        'Debug Info:', 
        '```json', 
        JSON.stringify(this.debugInfo), 
        '```',
        'Stack Info:',
        '```',
        (this.stack || ''),
        '```'
    ].join('\n');
 
}
