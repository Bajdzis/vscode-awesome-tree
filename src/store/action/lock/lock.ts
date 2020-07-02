import actionCreatorFactory from 'typescript-fsa';
 
const lockActionCreator = actionCreatorFactory('LOCK');

export const generateStarted = lockActionCreator('GENERATE_STARTED');
export const generateFinish = lockActionCreator('GENERATE_FINISH');
