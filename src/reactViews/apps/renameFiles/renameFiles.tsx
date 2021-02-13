import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Footer } from '../../components/Footer/Footer';
import { Input } from '../../components/Input/Input';
import { changeNameAction } from './actions/action';

declare global {
    interface Window { 
        acquireVsCodeApi: <T = unknown>() => {
            getState: () => T;
            setState: (data: T) => void;
            postMessage: (msg: unknown) => void;
        } 
    }
}

interface RenameFilesState {
    createdFolderName: string;
    allSiblingHave: any[];
    generated: boolean;
}

const vscode = window.acquireVsCodeApi<RenameFilesState>();

const initialState: RenameFilesState = {
    createdFolderName: '',
    allSiblingHave: [],
    generated: false
};

let state = vscode.getState() || initialState;

const setState = (newState) => {
    state = {
        ...state,
        ...newState,
    };
    refreshView(state);
    vscode.setState(state);
};
const createdFolderNameInput = document.querySelector('#createdFolderName');

createdFolderNameInput.addEventListener('input', e => {
    const abc = changeNameAction({
        value: ''
    });

    vscode.postMessage({
        type: 'CHANGE_NAME',
        payload: {
            value: createdFolderNameInput.value
        }
    });
});

const renderFile = ({ name, title, value, code }) => {
    const fieldTemplate = document.querySelector(state.generated ? '#field-generated-template' : '#field-template');
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


const generateFiles = () => {
    vscode.postMessage({
        type: 'GENERATE_ALL'
    });
    setState({
        generated: true
    });
};

const generateGroup = (title, key, container) => {
    const items = state[key];
    if (items.length === 0) {
        return;
    }
    const header = renderTitle({
        title,
        count: items.length
    });
    const headerButton = header.querySelector('[data-event="generate-all"]');
    if (state.generated) {
        headerButton.style.display = 'none';
    } else {
        headerButton.addEventListener('click', generateFiles);
    }

    container.appendChild(header);
    items.forEach(({ filePathRelative, filePathFromRelative, content }, index) => {
        const fieldElement = renderFile({
            title: `${filePathFromRelative} => ${filePathRelative}`,
            code: content,
            id: index,
        });
        container.appendChild(fieldElement);
    });
};

const refreshView = state => {
    const fields = document.querySelector('#fields');
    while (fields.firstChild) {
        fields.firstChild.remove();
    }
    const createdFolderNameInput = document.querySelector('#createdFolderName');
    if (createdFolderNameInput.value !== state.createdFolderName) {
        createdFolderNameInput.value = state.createdFolderName;
    }

    generateGroup('Preview', 'allSiblingHave', fields);
};

refreshView(state);

window.addEventListener('message', ({data}) => { 
    if (data.type === 'SET_DATA') {
        const { allSiblingHave, createdFolderName } = data.payload;
        setState({ allSiblingHave, createdFolderName });
    }
});


const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<div>
    
    <Input 
        label="dir name"
        onChange={() => {
            vscode.postMessage(changeNameAction({
                value: ''
            }));
        }} />
    <Footer/></div>,rootElement);

