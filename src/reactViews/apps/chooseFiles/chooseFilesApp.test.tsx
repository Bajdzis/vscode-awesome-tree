import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { resetState } from '../../hooks/acquireVsCodeApiMock';
import { setDataAction } from './actions/action';
import { ChooseFilesApp } from './chooseFilesApp';

describe('renameFilesApp', () => {

    beforeEach(() => {
        resetState();
    });

    it('should correct render headers', async () => {
        const { findByText, getByText } = render(<ChooseFilesApp />);

        await act(async () => {
            fireEvent(window, new MessageEvent('message', {
                data: setDataAction({
                    createdFolderName: 'newDirectoryName',
                    files:[]
                }),
            }));
        });

        expect(await findByText('Choose files to create')).toBeVisible();
        expect(getByText('newDirectoryName').closest('p')).toHaveTextContent('For new newDirectoryName directory');
    });
});
