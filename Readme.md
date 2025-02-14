# Seed Planner Stack

Seed Planner is a monorepo that combines a modern React frontend with an Express/Node backend. Built with Vite and esbuild, this stack is optimized for fast development and streamlined production builds. It comes preconfigured with testing, linting, and Docker support to make your life easier.

## Table of Contents

- [Seed Planner Stack](#seed-planner-stack)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Building for Production](#building-for-production)
  - [Running the Application](#running-the-application)
    - [Testing and Linting](#testing-and-linting)
    - [Compile TypeScript:](#compile-typescript)
    - [Run Tests:](#run-tests)
    - [Docker](#docker)
  - [Configuration](#configuration)
    - [Environment Variables:](#environment-variables)
    - [Customization:](#customization)
  - [Contributing](#contributing)

## Features

- **Modern Frontend:** Built with React, React Router, and powered by Vite for blazing-fast builds.
- **Robust Backend:** An Express server built with TypeScript and optimized with esbuild.
- **Observability:** Integrated OpenTelemetry support for distributed tracing.
- **Monorepo Management:** Single repository for both frontend and backend code.
- **Efficient Development:** Use `concurrently` to run both frontend and backend in development mode.
- **Testing:** Jest for unit/integration tests along with ESLint for code quality.
- **Docker Support:** Easily containerize and deploy with Docker Compose.

## Prerequisites

- **Node.js** v20+
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized deployment)

## Installation

1. **Clone the Repository:**

   ```bash   
    git clone https://github.com/yourusername/seed-planner.git
    cd seed-planner
   ```

2. Install Dependencies

   ```bash   
      npm ci
    ```

## Development
Start both the frontend and backend in development mode:

  ```bash
    npm run dev
  ```

- Frontend: Runs the Vite dev server. It will wait until the backend health endpoint is live before starting.
- Backend: Runs in watch mode with auto-rebuilds using esbuild and concurrently serves the API.

### Building for Production
To create optimized production builds for both frontend and backend:

  ```bash
    npm run build
  ```

This command will:

1. Build the frontend with vite:build (assets output to the configured directory).
2. Build the backend with api:build (outputs to ./.local/express/dist).

## Running the Application
After building, start the production server with:

  ```bash
    npm start
  ```

This command starts the Express server using the built backend located at ./.local/express/dist/api.js.

### Testing and Linting
Lint the Code:

  ```bash
    npm run lint
  ```

### Compile TypeScript:

  ```bash
    npm run tsc
  ```

### Run Tests:

  ```bash
    npm test
  ```

Run Complete Checks (Lint, Compile, Build, Test):

  ```bash
    npm run test:all
  ```
### Docker
Use Docker to containerize the application for preview or production deployment.

Preview the Application:
  ```bash
    npm run docker:preview
  ```

Rebuild Docker Images:
  ```bash
    npm run docker:preview:rebuild
  ```

Rebuild Without Cache:
  ```bash
    npm run docker:preview:rebuild:nocache
  ```

Make sure Docker is installed and running on your system.

## Configuration
### Environment Variables:
Create a .env file in the root directory to set up configuration values (e.g., database credentials, API keys, etc.).

### Customization:
Adjust any scripts or configurations in the package.json or Docker files to suit your deployment environment.

## Contributing
Contributions are welcome. If you have improvements, fixes, or new features, please:

1. Fork the repository.
2. Create a feature branch (git checkout -b feature/your-feature).
3. Commit your changes.
4. Open a pull request.
- For major changes, please open an issue first to discuss what you would like to change.