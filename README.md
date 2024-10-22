# Markable

Markable is a free alternative to note-taking tools like Notion and Obsidian, designed specifically for markdown with a focus on simplicity and minimalism. Ultimately, the goal is to emulate how IDEs handle markdown and previews, offering that experience within a web app.

## Development

Markable is hosted on Vercel, with authentication and storage handled by Firebase.

## Local Development

To run Markable locally, you need to set up the following:

1. Clone the repo:
   ```bash
   git clone
   cd markable
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

4. Create a `.env` file in the root dir

## Deployment
Create Feature Branch and submit PR for merge to `main`

## Next Steps
- Add a logout button
- Implement "forgot password" functionality
- Introduce directory/hierarchical note support
- Review storage options
- Add "smart" markdown (markdown while you type)
- Implement search functionality