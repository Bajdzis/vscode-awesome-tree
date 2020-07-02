interface FieldTemplateProps {
    name: string;
    title: string;
    code: string;
    id: string;
}


export const renderFieldTemplate = ({id, name, title, code}:FieldTemplateProps) => `<blockquote class="panel" >
<p class="panel__text">
    <div class="field">
        <label class="field__label" for="${name}" style="display:flex;justify-content: space-between;">
            <b style="font-size:1.5rem">${title}</b> <button class="panel__button button button--primary" data-event="generate-single" data-id="${id}">Generate single file</button>
        </label>
        <pre class="field__code">${code}</pre>
    </div>
</p>
</blockquote>`;

