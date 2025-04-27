# T3 Innovation Network Data Schema Converter
![tests](https://github.com/t3-innovation-network/desm/actions/workflows/test.yml/badge.svg) ![linters](https://github.com/t3-innovation-network/desm/actions/workflows/lint.yml/badge.svg)

This application provides the means to map (crosswalk) data specifications (standards) using predefined sets of mapping predicates that indicate the degree of equivalency between mapped property pairs, or the lack of such equivalency. The mapping outcomes of the tool will support data interoperability between data specifications based on the probabilities of matching or closely matching semantics.

## About this fork (KIC deployment)

This repository is a fork of the original [DESM repository](https://github.com/t3-innovation-network/desm) maintained by the T3 Innovation Network.

It contains some adaptations to the upstream version that were necessary to deploy the software locally (for testing) and in production on our infrastructure.

The production version is running at:

[https://mappings.skilldata.info/](https://mappings.skilldata.info/)

These adaptations were made in the context of the [QualityLink project](https://quality-link.eu/). [Kamarul Adha](https://github.com/KamarulAdha) (KIC) and [Ronald Ham](https://github.com/hamrt/) (SURF) have contributed to the adaptations.

### Docker Compose

> Precondition -> The following technologies are needed before starting the installation:
> - docker
> - docker compose

1. Clone this project locally
2. Create an ".env" file by copying the ".env.example" file. Adjust the following:
    - Set the `APP_DOMAIN` environment variable to the URL at which DESM will be running, e.g. `http://localhost:3030` for local testing
    - Set a secure password for the PostgreSQL database in `POSTGRES_PASSWORD`
    - Set the secret keys required by the app (`PRIVATE_KEY`, `SECRET_KEY_BASE` and `RAILS_MASTER_KEY`)
3. Execute `docker compose build`
3. If you are starting from an existing DESM database: place the dump in `initdb.d/`
4. Execute `docker compose up -d`
5. If you are starting from an exmpty database: execute `docker compose run --rm web rake db:create db:migrate db:seed`
6. Go to `APP_DOMAIN`

### AWS Lightsail

The KIC-hosted DESM instance is deployed to AWS Lightsail for production use.

The deployment process is managed by a GitHub Action in [.github/workflows/deploy-lightsail.yml](https://github.com/Knowledge-Innovation-Centre/desm/blob/production/.github/workflows/deploy-lightsail.yml). The workflow uses the adapted [Dockerfile](https://github.com/Knowledge-Innovation-Centre/desm/blob/production/Dockerfile).

## Tests

`rspec` for ruby based related tests

`yarn playwright test` for accessibility tests (or use IDE plugin for playwright), they also can be run manually at GH Actions with 2 inputs:
- site url, default qa site, env `BASE_URL`
- configuration profile name, default 'DESM Demo and Documentation', env `SHARED_MAPPING_CONFIG`

Set these env as you need (you can use `.env.playwright` for that) for local development.

Accessiblility reports will be attached to each of the test, both in json and html formats, look for Attachments section at playwright report (download it from Artifacts section or "Playwright Reports" step at GH).

## Customization

### Adjust the text on the Homepage

In order to update the text on the homepage, you have to adjust the file contents inside of the `RightCol.jsx` file located in the following directory: `/main/app/javascript/components/home/`
- In order to see the updates, the system has to be redeployed
- Don't break the syntax of the currently set-up structure


## Collaborate

> Please create an issue or a pull request. There's a GitHub Actions linting and testing workflow that will validate quality.
All tasks are at [project board](https://github.com/orgs/t3-innovation-network/projects/1), issue card should be moved to the column that meets its status.

Development process:
1. All commits should be meaningful, preferably contain some feature or feedback changes/fixes.
2. Add number of issue (#issue_number) at commit message, that way it's easier to track changes.
3. Prefer rebase over merge if there is need to updated branch with master updates.
4. When creating PR add issue number to the PR body, it'll be linked to the issue that way.
5. After merging (only when QA passed and merge is approved by PM) delete the branch and squash commits if needed.

It's highly recommended to setup linters (`rubocop/eslint/stylelint/prettier`) at IDE and `overcommit` hooks (`overcommit --install`) or run manualy before comitting to GH `overcommit -r`.

## Jobs

No background jobs at the moment.
