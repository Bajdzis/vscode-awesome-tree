interface FieldTemplateGeneratedProps {
    name: string;
    title: string;
}

export const renderFieldTemplateGenerated = ({name, title}:FieldTemplateGeneratedProps) => `<blockquote class="panel" >
<p class="panel__text">
    <div class="field">
        <label class="field__label" for="${name}" style="display:flex;justify-content: space-between;">
            <b>${title}</b> <span>Generated!</span>
        </label>
    </div>
</p>
</blockquote>`;
