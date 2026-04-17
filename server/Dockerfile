# --- Base image ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

# --- Build image ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ScrumDone.Api/ScrumDone.Api.csproj ./ScrumDone.Api/
RUN dotnet restore ./ScrumDone.Api/ScrumDone.Api.csproj
COPY ScrumDone.Api/ ./ScrumDone.Api/
WORKDIR /src/ScrumDone.Api
RUN dotnet publish ScrumDone.Api.csproj -c ${BUILD_CONFIGURATION} -o /app/publish /p:UseAppHost=false

# --- Final ---
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Development
ENTRYPOINT ["dotnet", "ScrumDone.Api.dll"]