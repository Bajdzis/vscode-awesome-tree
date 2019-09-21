export function compareVariableTemplate(template1: string, template2: string): boolean {
    if (template1 === template2) {
        return true;
    }

    return deleteDefaultValues(template1) === deleteDefaultValues(template2);
}

function deleteDefaultValues(template: string): string {
    const defaultValues = /\$\{([^${}]*)\|\|'([^${}]*)'\}/g;

    return template.replace(defaultValues, '$1');
}
