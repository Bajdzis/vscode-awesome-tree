import css from '../style.css';
interface HtmlProps {
    title: string;
    content: string;
}

export const renderHtml = ({title, content }: HtmlProps) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${css}</style>
    <title>${title}</title>
</head>

<body>
    ${content}
</body>
</html>`;
