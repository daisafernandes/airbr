/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  setupFiles: ['<rootDir>/jest.setup.env.cjs'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/application/services/*.ts',
    'src/application/services/CityService.ts',
    'src/infrastructure/database/repositories/*.ts',
    'src/shared/errors/AppError.ts',
    'src/shared/utils/pagination.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
}
