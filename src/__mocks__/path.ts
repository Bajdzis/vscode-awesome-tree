import * as path from 'path';
import { changeToUnixSlashes } from '../strings/changeToUnixSlashes';

const pathNode: typeof path = jest.requireActual('path');

export const join = jest.fn((...args) => changeToUnixSlashes(pathNode.join(...args)));

export const dirname = jest.fn((args) => changeToUnixSlashes(pathNode.dirname(args)));

export const basename = jest.fn((args) => changeToUnixSlashes(pathNode.basename(args)));

export const sep = '/';
