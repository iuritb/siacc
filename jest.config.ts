import type { Config } from 'jest';

import { getVersion } from 'jest';

console.log('Versão do JEST =>\x1B[1m', getVersion());

const config: Config = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcovonly', 'text', 'text-summary'],
  reporters: ['default', ['jest-sonar', {
    outputDirectory: 'reports',
    outputName: 'sonarqubeTestReport.xml',
    reportedFilePath: 'relative',
    indent: 4
  }]],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 70,
      lines: 40,
      statements: 40,
    }
  },
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  bail: 1,
  displayName: {
    name: 'PIX-AUTOMATICO-FRONTEND',
    color: 'blue',
  },
};

export default config;
