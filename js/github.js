// github.js - GitHub REST API helpers

const API_BASE = 'https://api.github.com';

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

export async function getFile(owner, repo, path, ref = 'main') {
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return {
    content: atob(data.content.replace(/\s/g, '')),
    sha: data.sha
  };
}

export async function putFile(owner, repo, path, message, content, branch, sha, token) {
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  const body = {
    message,
    content: utf8ToBase64(content),
    branch,
    ...(sha && { sha })
  };
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return {
    sha: data.content.sha,
    commitUrl: data.commit.html_url
  };
}
