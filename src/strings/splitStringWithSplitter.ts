
export function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function splitStringWithSplitter(s: string, splitter: string): string[] {
    const splitters = splitter.split('');
    const split = new RegExp(`([${escapeRegExp(splitters.join('|'))}])`, 'g');
    return s.split(split).filter(str => str.length);
}
