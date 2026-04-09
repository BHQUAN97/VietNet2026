/**
 * Replace all picsum.photos URLs in content with Unsplash URLs
 * Fetch tung item rieng de co content day du
 *
 * Chay: node backend/src/scripts/fix-content-images.js
 */

const BASE = 'https://bhquan.store/api';

const PHOTOS = [
  '1502672260266-1c1ef2d93688',
  '1618221195710-dd6b41faaea6',
  '1616486338812-3dadae4b4ace',
  '1600607687939-ce8a6c25118c',
  '1631679706909-1844bbd07221',
  '1600585154340-be6161a56a0c',
  '1616137422495-1e9e46e2aa77',
  '1600566753190-17f0baa2a6c3',
  '1600585154526-990dced4db0d',
  '1600566752355-35792bedcfea',
  '1497366216548-37526070297c',
  '1582719478250-c89cae4dc85b',
  '1554118811-1e0d58224f24',
  '1600607687644-c7171b42498f',
  '1600047509807-ba8f99d2cdde',
  '1522708323590-d24dbb6b0267',
  '1615529328331-f8917597711f',
  '1617806118233-18e1de247200',
  '1556909114-f6e7ad7d3136',
  '1556909172-54557c7e4fb7',
];

function unsplash(id, w = 800, h = 500) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;
}

function fixContent(html, itemIndex) {
  let imgIdx = 0;
  const offset = (itemIndex * 3) % PHOTOS.length;
  return html.replace(
    /https:\/\/picsum\.photos\/id\/\d+\/\d+\/\d+/g,
    () => {
      const photoId = PHOTOS[(offset + imgIdx) % PHOTOS.length];
      imgIdx++;
      return unsplash(photoId);
    }
  );
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  // Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vietnet.local', password: 'Admin@123' }),
  });
  const { data: { accessToken: TOKEN } } = await loginRes.json();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };
  console.log('✅ Logged in\n');

  // Fetch list to get IDs and slugs
  const projects = (await (await fetch(`${BASE}/projects?limit=50`, { headers })).json()).data || [];
  const articles = (await (await fetch(`${BASE}/articles?limit=50`, { headers })).json()).data || [];

  // Fix projects - fetch each individually via admin endpoint
  console.log(`🏗️  Fixing ${projects.length} projects content...`);
  let pFixed = 0;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    try {
      // Fetch full project with content via admin endpoint
      const fullRes = await fetch(`${BASE}/admin/projects/${p.id}`, { headers });
      let fullData;
      if (fullRes.ok) {
        fullData = (await fullRes.json()).data;
      }

      // Fallback: try public slug endpoint
      if (!fullData?.content && p.slug) {
        const slugRes = await fetch(`${BASE}/projects/${p.slug}`, { headers });
        if (slugRes.ok) fullData = (await slugRes.json()).data;
      }

      if (!fullData?.content) {
        console.log(`   [${i+1}] ${p.title} — no content found, skip`);
        continue;
      }

      if (!fullData.content.includes('picsum.photos')) {
        console.log(`   [${i+1}] ${p.title} — already fixed`);
        continue;
      }

      const fixed = fixContent(fullData.content, i);
      const res = await fetch(`${BASE}/projects/${p.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ content: fixed }),
      });
      const data = await res.json();
      console.log(`   [${i+1}] ${p.title} — ${data.success ? '✅' : '❌ ' + data.message}`);
      if (data.success) pFixed++;
    } catch (err) {
      console.log(`   [${i+1}] ${p.title} — ❌ ${err.message}`);
    }
    await sleep(300);
  }

  // Fix articles
  console.log(`\n📰 Fixing ${articles.length} articles content...`);
  let aFixed = 0;
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    try {
      // Fetch full article
      const fullRes = await fetch(`${BASE}/admin/articles/${a.id}`, { headers });
      let fullData;
      if (fullRes.ok) {
        fullData = (await fullRes.json()).data;
      }

      if (!fullData?.content && a.slug) {
        const slugRes = await fetch(`${BASE}/articles/${a.slug}`, { headers });
        if (slugRes.ok) fullData = (await slugRes.json()).data;
      }

      if (!fullData?.content) {
        console.log(`   [${i+1}] ${a.title} — no content found, skip`);
        continue;
      }

      if (!fullData.content.includes('picsum.photos')) {
        console.log(`   [${i+1}] ${a.title} — already fixed`);
        continue;
      }

      const fixed = fixContent(fullData.content, 20 + i);
      const res = await fetch(`${BASE}/articles/${a.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ content: fixed }),
      });
      const data = await res.json();
      console.log(`   [${i+1}] ${a.title} — ${data.success ? '✅' : '❌ ' + data.message}`);
      if (data.success) aFixed++;
    } catch (err) {
      console.log(`   [${i+1}] ${a.title} — ❌ ${err.message}`);
    }
    await sleep(300);
  }

  console.log(`\n🎉 Content fixed: ${pFixed} projects + ${aFixed} articles`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
