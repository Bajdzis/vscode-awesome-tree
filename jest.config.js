/* global module */
module.exports = {
    roots: [
        '<rootDir>/src'
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    collectCoverageFrom: [
        './src/**/*.*'
    ]
};
