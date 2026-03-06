import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When building for GitHub Pages via Actions, GITHUB_REPOSITORY is "owner/repo-name"
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : '/',
})
