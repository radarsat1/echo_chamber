# Echo Chamber: RSS & Social Aggregator

This is a single-page application that aggregates RSS feeds, finds corresponding discussions on Hacker News and Reddit, and allows you to view the comments alongside the article abstract.

It's built to be a lightweight, mobile-friendly, client-side-only application. All data is fetched on the client and stored in the browser's `localStorage`.

## Running the App

This project uses **Vite** for a fast and modern development experience.

1.  **Install Dependencies:** First, install the necessary npm packages:
    ```bash
    npm install
    ```

2.  **Run the Development Server:** Start the Vite development server:
    ```bash
    npm run dev
    ```
    This will start the app, typically on `http://localhost:5173`. The server features Hot Module Replacement (HMR), so most changes you make to the code will appear instantly in your browser without a full page reload.

3.  **Run Tests:** To ensure all components are working as expected, especially the feed parser, run the included unit tests:
    ```bash
    npm run test
    ```

## Deployment

This project is configured for continuous deployment to **GitHub Pages** using GitHub Actions.

- On every push to the `main` branch, a workflow automatically builds the application and deploys it.
- To enable this, go to your repository's settings, navigate to the "Pages" section, and set the "Source" to "GitHub Actions".

The live application will be available at `https://<your-username>.github.io/echo-chamber/`.
