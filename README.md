# FINcredible Bank — Account Verification Dashboard

A small React + TypeScript app that pulls a user's bank account data from the
FINcredibleBank mock API and surfaces personal details, raw transactions, and
four derived verification results (IBAN check, debt risk, gambling, child
support).

## Stack

- React 19 + TypeScript, built with Vite
- MUI (Material UI) for components/theming
- TanStack Query for data fetching, caching, and loading/error state
- Vitest + Testing Library for tests
- Biome for linting and formatting

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API key

The app calls the FINcredibleBank mock API, authenticated via an `x-api-key`
header. Create a `.env` file in the project root:

```bash
VITE_POSTMAN_API_KEY=your-api-key-here
```

The endpoints themselves are fixed mock-server URLs (see `src/config.ts`) and
don't need to be configured.

### 3. Run the app

```bash
npm run dev
```

Open the printed local URL. Nothing loads automatically — click **Load
account data** to trigger the token → bank-data fetch flow.

## Scripts

| Command                | What it does                           |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Start the Vite dev server               |
| `npm run build`         | Type-check, then build for production   |
| `npm run preview`       | Preview the production build locally    |
| `npm run test`          | Run the test suite once                 |
| `npm run test:watch`    | Run tests in watch mode                 |
| `npm run test:coverage` | Run tests with a coverage report        |
| `npm run lint`          | Check formatting/lint rules with Biome  |
| `npm run lint:fix`      | Auto-fix what Biome can fix             |
| `npm run type-check`    | Run `tsc --noEmit`                      |

## Architecture

```
src/
  api/                API + business-logic layer (no React)
    finCredibleBankClient.ts   fetch(token) -> fetch(bank-data) orchestration
    bankMappers.ts             raw DTO -> domain view-model mapping
    bankResultsService.ts      derives the 4 result rows from mapped data
  hooks/
    useBankAccountFacade.ts    TanStack Query wrapper; the only thing
                                components talk to for data
  pages/               Screen-level components (tabs, tables, reload button)
  components/          Reusable presentational components
  types/               DTOs (api.types.ts) vs. domain/view-model types
                        (domain.types.ts), kept separate on purpose
```

The DTO/domain split means an API shape change is a one-file fix in
`bankMappers.ts` — the rest of the app never sees raw API field names
(`DOB`, `IBAN`, etc.), only the normalized `PersonalDetails` /
`BankAccountSummary` / `Transaction` shapes in `domain.types.ts`.

## Notable decisions / assumptions

- **DEBT_RISK tie-break.** The task spec gives two independent conditions
  (HIGH on negative balance, LOW on recurring salary) without an explicit
  "otherwise" case. This is implemented as a priority order: a negative
  balance wins outright as HIGH; short of that, LOW requires positive
  evidence of a recurring salary (2+ salary-labelled credits in different
  months) rather than being the default — no negative balance *and* no
  salary evidence still reads as HIGH. See the comment above `checkDebtRisk`
  in `bankResultsService.ts`.
- **Transaction `type` is derived from `Amount`'s sign, not the API's `Type`
  field.** The sample data has at least one transaction labelled `"deposit"`
  with a negative `Amount`, so `Type` is treated as a hint only, not the
  source of truth.
- **API response shapes couldn't be verified against a live mock server**
  from the dev environment used to build this, so `api.types.ts` DTOs are
  modelled directly off the task's Definition of Done / Result Definition.
  If a real response differs, that file plus `bankMappers.ts` are the only
  places that should need to change.
- **The API key ships in the frontend bundle** (`VITE_POSTMAN_API_KEY`), per
  the task instructions. In a real production app this should be proxied
  through a backend/BFF so the key never reaches the browser — left as-is
  here to match the exercise.

## Testing

Tests focus on the pure logic layer, since that's where the business rules
(and the risk of subtle bugs) actually live:

- `bankMappers.test.ts` — DTO → domain mapping, DOB normalization, balance
  parsing, transaction type derivation, and the "unreliable `Type` field"
  edge case.
- `bankResultsService.test.ts` — all four result rules, including the
  DEBT_RISK tie-break and salary-recurrence edge cases (single month vs.
  multiple, credit vs. debit).
- `finCredibleBankClient.test.ts` — the fetch orchestration (token → bank-data),
  error propagation on non-OK responses, and the "missing token" guard, with
  `fetch` mocked.

UI components (tables, tabs, reload button) aren't covered yet — they're
lower risk than the mapping/business-rule layer and would be the logical
next thing to add tests for (rendering, loading/error states, user
interactions via Testing Library).

```bash
npm run test           # run once
npm run test:coverage  # with coverage report
```
