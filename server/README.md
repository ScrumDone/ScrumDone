
## Build 

- Install Docker https://docs.docker.com/desktop/setup/install/windows-install/
- Run the docker engine (opening downloaded docker dektop should do it)
- Open a terminal and navigate to the `/server` directory of the project.
- `docker compose up --build`
- access scalar api documentation at http://localhost:8080/scalar/v1
- test connection with endpoints like http://localhost:8080/api/utils/health

## When you're done testing or want to rebuild the image from scratch:
- `docker compose down -v`
