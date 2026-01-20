import type { Config } from 'jest';

const config: Config = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text', 'lcov'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1'
    }
};

export default config;