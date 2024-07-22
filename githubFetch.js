import axios from 'axios';
import matter from 'gray-matter';
import { createAppAuth } from '@octokit/auth-app';
import 'dotenv/config'

// TO DO: ignore 'old' and other subdirectories that are not intro, js, react, etc
export const githubFetch = async ({ path }) => {
  const org = process.env.GITHUB_ORG;
  const repo = process.env.GITHUB_INDEPENDENT_PROJECTS_REPO;
  const githubUrl = `https://raw.githubusercontent.com/${org}/${repo}/main/${path}`;
  const fileContent = await fetchGithubRawContent(githubUrl);
  const { data: { title, objectives }, content } = matter(fileContent);
  const mappedObjectives = objectives ? objectives.map((objective, idx) => ({ number: idx + 1, content: objective })) : [];
  return { title, objectives: mappedObjectives, content };
}

async function fetchGithubRawContent(url) {
  const token = await getInstallationAccessToken();
  const response = await axios.get(url, {
    headers: {
      Accept: "application/vnd.github.raw",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

async function getInstallationAccessToken() {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID,
    installationId: process.env.GITHUB_APP_INSTALLATION_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY
  });
  const installationAuthentication = await auth({ type: 'installation' });
  return installationAuthentication.token;
}
