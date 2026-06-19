# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

DESM (Data Ecosystem Schema Mapper) is a tool for crosswalking 1-to-n data standards (XML Schema, JSON Schema, RDF Schema) using mapping predicates that express degrees of semantic equivalency. A single instance hosts multiple independent crosswalking projects.

This repo is the **KIC fork** (branch `production`) of [t3-innovation-network/desm](https://github.com/t3-innovation-network/desm), adapted for Docker/Coolify deployment. Production runs at https://mappings.skilldata.info/. When fixing bugs, prefer changes that could be contributed upstream over fork-only hacks unless the change is deployment-specific.

The stack is a **Rails 7.2 JSON API** (Ruby 3.3.7) serving a **React 18 SPA**. Rails renders no views for the app itself — `homepage#index` and the catch-all `get '/*path'` both return the SPA shell, and React Router (v5) handles routing client-side.

## Commands

**Always run dev, tests, and tooling inside the Docker container** — Ruby, Node, and the gems/packages are not installed on the dev host. Prefix the commands below with `docker compose run --rm web ...` (or `docker compose exec web ...` against a running container). The bare commands shown are what runs *inside* the container.

Bring the stack up (full stack incl. Postgres requires the `withdb` compose profile; otherwise an external DB is expected):

```bash
docker compose build
docker compose --profile withdb up -d
docker compose run --rm web rake db:create db:migrate db:seed   # empty DB
```

Dev runs three processes via foreman (`Procfile.local`): Rails on :3000, CSS watch, JS watch.

```bash
docker compose run --rm --service-ports web bin/dev   # start all three (foreman), loads .env.development
yarn build                 # one-off JS bundle (esbuild → app/assets/builds)
yarn build:css             # one-off CSS build (sass + postcss)
yarn build --watch         # JS watch only
```

Tests and linters (run via `docker compose run --rm web <cmd>`):

```bash
bundle exec rspec                          # full Ruby suite
bundle exec rspec spec/models/spine_spec.rb        # single file
bundle exec rspec spec/models/spine_spec.rb:42     # single example by line
yarn lint                                  # eslint (app/javascript) + stylelint
yarn lint:js:fix                           # prettier + eslint --fix
yarn lint:scss:fix                         # prettier + stylelint --fix
bundle exec rubocop                        # Ruby lint
yarn playwright test                       # accessibility tests (axe-core), needs BASE_URL
```

`overcommit --install` wires pre-commit hooks (rubocop, shellcheck, etc.). SimpleCov coverage is on by default for rspec.

## Domain model (read these together to understand the app)

The central entity is **ConfigurationProfile** (`app/models/configuration_profile.rb`) — it defines one crosswalking project: its abstract class set (domains), predicate set, and participating organizations. A CP is driven by a **state machine** implemented as the State pattern in `app/models/cp_state.rb` (`incomplete → complete → active`, plus `deactivated`). State transitions enforce structural validation; `activate!` generates the CP's `structure` JSON. Never set `state` directly — go through `transition_to!` / the CpState classes.

The crosswalking data hierarchy:
- **Specification** — an uploaded data standard. Parsed into **Terms** (each Term wraps a **Property**).
- **Spine** — the reference specification within a **Mapping** that other specs are aligned against.
- **Mapping** — links a specification's terms to a spine's terms for one organization.
- **Alignment** — a single term-to-spine-term correspondence, qualified by a **Predicate** (the equivalency degree). Synthetic alignments/concepts exist for terms with no natural match.
- **Predicate / PredicateSet**, **Domain / DomainSet** (abstract classes) — the controlled vocabularies a CP is configured with.
- **Vocabulary / SkosConcept** — SKOS concept schemes attached to terms.

Most of these are RDF-backed; the app reads/writes RDF and exposes entities at top-level RDF redirect routes (`/Property/:id`, `/TermMapping/:id`, etc.) and under `/resources/*` (slug-based, public-facing).

## Backend architecture

- **Controllers**: API under `app/controllers/api/v1/` (namespaced `/api/v1`, JSON). Public RDF resource endpoints under `app/controllers/resources/`. Auth is JWT-based (`jwt` gem, `PRIVATE_KEY` env), not cookie sessions — see `sessions_controller` and the `current_user_concern`. Authorization uses **Pundit** policies (`app/policies/`).
- **Interactors** (`app/interactors/`, `interactor-rails`): multi-step business operations — CP import/validation/structure generation, schema/specification creation, alignment saving, mapping export. This is where domain workflows live; prefer adding an interactor over fattening a controller or model.
- **Services** (`app/services/`): stateless processing, organized by role:
  - `converters/` — turn an uploaded file (JSON Schema, XML Schema, RDF/XML, Turtle, CEDS, zip) into a normalized RDF/JSON form. `converters/base.rb` is the interface.
  - `parsers/` — parse normalized data (SKOS, specifications, JSON-LD nodes).
  - `processors/` — persist parsed data into models (specifications, mappings, vocabularies, domains, predicates, skos).
  - `exporters/` — produce mapping/CP exports (`mapping/csv.rb`, `mapping/jsonld.rb`).
- **Queries** (`app/queries/`): encapsulated read queries. **Serializers** (`app/serializers/`, `active_model_serializers`) shape API JSON.
- RDF handling uses the `linkeddata` gem; full-text search uses `pg_search`; model changes are tracked with `audited`.

## Frontend architecture

React SPA in `app/javascript/`, bundled by esbuild (entry `application.js`, JSX via automatic runtime). Key dirs:
- `components/` — feature-grouped (`mapping/`, `align-and-fine-tune/`, `edit-specification/`, `mapping-to-domains/`, `specifications-list/`, `dashboard/`, `auth/`, `home/`). `App.jsx` + `Routes.jsx` define the shell and routing (react-router-dom v5).
- State: **easy-peasy** (Redux-based) store under `components/stores/` (`easyState.jsx`, `baseModel.js`), with additional `actions/` and `reducers/`.
- `services/` — axios API clients. Note keys cross the API boundary in snake_case (Ruby) ↔ camelCase (JS); `humps` handles conversion.
- i18n via `i18n-js` (`translations/locales.json`); styling is Bootstrap 5 + SCSS in `app/assets/stylesheets/`.

A few build-time config values are injected into JS via esbuild `define` from env vars: `ADMIN_ROLE_NAME`, `MAPPER_ROLE_NAME`, `MIN_PASSWORD_LENGTH`, `APP_DOMAIN`. Changing these requires a rebuild, not just a restart.

## Conventions

- Editing homepage text: change `app/javascript/components/home/RightCol.jsx` (requires redeploy/rebuild).
- Role names (`ADMIN_ROLE_NAME`, default "Super Admin") are referenced by both backend and frontend — keep them in sync via env, don't hardcode.
- No background jobs currently. Redis is present (used as a dependency/cache), Postgres is the primary DB.
- Commit messages should reference the issue number (`#123`); prefer rebase over merge when updating branches.
