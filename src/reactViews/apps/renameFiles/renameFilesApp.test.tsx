import { resetState } from '../../hooks/acquireVsCodeApiMock';
import * as React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { RenameFilesApp } from './renameFilesApp';
import { setDataAction } from './actions/action';

describe('renameFilesApp', () => {

    beforeEach(() => {
        resetState();
    });
    
    it('should render input', async () => {
        const { container } = render(<RenameFilesApp />);

        const input = container.querySelector('#createdFolderName');

        expect(input).not.toBeNull();
    });

    it('should render input with name directory from event', async () => {
        const { container } = render(<RenameFilesApp />);

        await act(async () => {
            fireEvent(window, new MessageEvent('message', {
                data: setDataAction({
                    allSiblingHave:[],
                    createdFolderName: 'directoryName copy (2)'
                }),
            }));
        });

        const input = container.querySelector<HTMLInputElement>('#createdFolderName');

        expect(input).not.toBeNull();
        expect(input?.value).toEqual('directoryName copy (2)');
    });
});
