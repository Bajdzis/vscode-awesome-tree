/* global document */
/* eslint-disable no-unused-vars */

const renderFile = ({ name, title, value, code, generated }) => {
    const fieldTemplate = document.querySelector(generated ? '#field-generated-template' : '#field-template');
    const html = fieldTemplate.innerHTML;
    const span = document.createElement('span');
    span.innerText = code;
    const escapedCode = span.innerHTML;

    const fragment = document.createElement('template');
    fragment.innerHTML = html
        .replace(/\{\{title\}\}/gi, title)
        .replace(/\{\{code\}\}/gi, escapedCode);

    return fragment.content;
};

const renderTitle = ({ title, count }) => {
    const fieldTemplate = document.querySelector('#title-template');
    const html = fieldTemplate.innerHTML;
    const fragment = document.createElement('template');
    fragment.innerHTML = html
        .replace(/\{\{title\}\}/gi, title)
        .replace(/\{\{count\}\}/gi, count);

    return fragment.content;
};
