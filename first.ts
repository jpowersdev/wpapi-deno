import { exec } from 'https://deno.land/x/exec/mod.ts';

const SITE_PATH = 'PATH_TO_SITE_FOLDER';
Deno.chdir(SITE_PATH);
await exec('pwd');

const BASE_URL = 'REST_API_URL';

async function authenticate() {
  const response = await fetch(BASE_URL + '/jwt-auth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'password',
    }),
  });
  const { token, user_nicename } = await response.json();
  if (!token) throw new Error('Failed to Authenticate');
  console.log('authenticated as', user_nicename);
  return token;
}

async function getPosts() {
  const response = await fetch(BASE_URL + '/wp/v2/posts');
  const json = await response.json();
  return json;
}

async function getPost(id: number) {
  const response = await fetch(BASE_URL + '/wp/v2/posts/' + id);
  const json = await response.json();
  return json;
}

async function updatePost(id: number, data: any) {
  const token = await authenticate();
  const response = await fetch(BASE_URL + '/wp/v2/posts/' + id, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json;
}

async function replacePostContent(id: number, from: string, to: string) {
  const post = await getPost(id);
  console.log(post.content);
  const content = post.content.rendered.replace(from, to);
  console.log(content);
  const update = await updatePost(id, {
    content,
  });
  return update;
}
