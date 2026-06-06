
## Build:

- Install Docker https://docs.docker.com/desktop/setup/install/windows-install/
- Run the docker engine (opening downloaded docker dektop should do it)
- Open a terminal and navigate to the `/server` directory of the project.
- `docker compose up --build`
- access scalar api documentation at http://localhost:8080/scalar/v1
- test connection with endpoints like http://localhost:8080/api/utils/health

## When you're done testing or want to rebuild the image from scratch:
- `docker compose down -v`

## Rebuild api only for faster development:
- `docker compose up --build scrumdone-api`

## Run tests with:
- `dotnet test ScrumDone.slnx --no-restore --verbosity minimal`

## For every endpoint:
- Create enpoint inside controller
- Add Service inside service contract
- Add implementation inside related service file
- Create needed dtos
- Create and use the required mappers (this step can be skipped, though it's good practice for maintainability)
    - Compiler can throw some false positives here, just build with `Ctrl+Shift+B`
- Create and connect needed validators
    - Don't use:
        - `.WithMessage()` as errors are handled by `GlobalErrorHandler`
- Ensure all edge cases are handled correctly

## API docs:
- BODY parameter is required only when docs specify
- PATCH behaviour:
    - omission in body -> no update
    - null -> set to empty
    - value -> set to value

## FAQ:
- when running docker with `-d` logs won't display. Either avoid that or look through `docker logs -f scrumdone-api`