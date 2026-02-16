# Contributing to the Project

We love to receive contributions from the community and are thrilled that you're interested in making this project better. This document will guide you through the process of contributing.

## Community

Join our Discord server for discussions, support, and to connect with other contributors:
[https://discord.gg/ewHtFk9G](https://discord.gg/ewHtFk9G)

## Getting Started

To get started with development, you'll need to have Node.js and npm installed on your machine.

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** to your local machine:
    ```bash
    git clone https://github.com/your-username/PersonalLearningPro.git
    ```
3.  **Navigate to the project directory:**
    ```bash
    cd PersonalLearningPro
    ```
4.  **Install the dependencies:**
    ```bash
    npm install
    ```
5.  **Set up your environment variables.** Create a `.env` file in the root of the project and add the following, replacing the placeholders with your actual database credentials:
    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    ```
6.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the backend server on `http://localhost:5001`. The client-side application is served by the same server, so you can access it by opening your browser to `http://localhost:5001`.

## Contribution Workflow

1.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b your-branch-name
    ```
2.  **Make your changes.**
3.  **Ensure all TypeScript checks pass** before committing:
    ```bash
    npm run check
    ```
4.  **Commit your changes** with a descriptive commit message.
5.  **Push your changes** to your fork:
    ```bash
    git push origin your-branch-name
    ```
6.  **Open a pull request** to the `main` branch of the original repository.

## Coding Style

This project does not currently have a code formatter (like Prettier) or a linter (like ESLint) configured. We ask that you please follow the existing code style in the files you are editing to maintain consistency.

## Reporting Bugs

If you find a bug, please create an issue on the GitHub repository. In your issue, please include:

*   A clear and descriptive title.
*   A detailed description of the bug, including steps to reproduce it.
*   Any relevant error messages or screenshots.

## Suggesting Enhancements

If you have an idea for an enhancement, please create an issue on the GitHub repository. In your issue, please include:

*   A clear and descriptive title.
*   A detailed description of the enhancement, including the problem it solves and why you think it would be a good addition to the project.

Thank you for your interest in contributing to this project!
