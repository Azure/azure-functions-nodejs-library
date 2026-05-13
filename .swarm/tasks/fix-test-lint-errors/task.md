# Fix lint errors in test files

- Task ID: `fix-test-lint-errors`
- Round: 2
- Branch: (use the assigned branch)
- Dependencies: (none)

## Description

Run `npx eslint test/InvocationModel.test.ts test/ProgrammingModel.test.ts --fix` to auto-fix 4 lint errors:
1. test/InvocationModel.test.ts line 4: import sort order (simple-import-sort/imports)
2. test/InvocationModel.test.ts line 36: prettier multiline formatting of sinon.stub chain
3. test/InvocationModel.test.ts line 123: trailing comma in type assertion
4. test/ProgrammingModel.test.ts line 4: import sort order (simple-import-sort/imports)

After auto-fix, verify with `npx eslint test/InvocationModel.test.ts test/ProgrammingModel.test.ts` (should report 0 errors, only the 2 existing non-null assertion warnings in ProgrammingModel.test.ts are acceptable). Then run `npm test` to confirm all tests still pass.