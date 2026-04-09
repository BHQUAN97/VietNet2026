/**
 * Retry fix for items that failed in first run.
 * Uses only VERIFIED working Unsplash photo IDs.
 *
 * Chay: node backend/src/scripts/fix-seed-images-retry.js
 */

const BASE = 'https://bhquan.store/api';

// VERIFIED working Unsplash photo IDs (all tested in first run)
const VERIFIED_PHOTOS = [
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
  '1618219908412-a29a1bb7b86e',
  '1556909190-eccf4a8bf97a',
];

function unsplashUrl(photoId, w = 800, h = 500) {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;
}

function fixContentImages(html) {
  let idx = 0;
  return html.replace(
    /https:\/\/picsum\.photos\/id\/\d+\/\d+\/\d+/g,
    () => {
      const url = unsplashUrl(VERIFIED_PHOTOS[idx % VERIFIED_PHOTOS.length], 800, 500);
      idx++;
      return url;
    }
  );
}

async function downloadImage(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadMedia(token, buffer, filename) {
  const form = new FormData();
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  form.append('file', blob, filename);
  const res = await fetch(`${BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Upload failed: ${JSON.stringify(data)}`);
  return data.data;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  // Login
  console.log('🔐 Logging in...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vietnet.local', password: 'Admin@123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success) { console.error('Login failed'); process.exit(1); }
  const TOKEN = loginData.data.accessToken;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };
  console.log('✅ Logged in\n');

  // Fetch all projects and articles
  const projRes = await fetch(`${BASE}/projects?limit=50`, { headers });
  const projects = (await projRes.json()).data || [];

  const artRes = await fetch(`${BASE}/articles?limit=50`, { headers });
  const articles = (await artRes.json()).data || [];

  // Find items missing cover_image
  const projMissing = projects.filter(p => !p.cover_image_id && !p.cover_image);
  const artMissing = articles.filter(a => !a.cover_image_id && !a.cover_image);

  console.log(`📋 Projects missing cover: ${projMissing.length}`);
  console.log(`📋 Articles missing cover: ${artMissing.length}\n`);

  // Also find items that have picsum URLs in content (even if they have cover)
  const projPicsum = projects.filter(p => p.content && p.content.includes('picsum.photos'));
  const artPicsum = articles.filter(a => a.content && a.content.includes('picsum.photos'));
  console.log(`📋 Projects with picsum content: ${projPicsum.length}`);
  console.log(`📋 Articles with picsum content: ${artPicsum.length}\n`);

  // Fix missing covers
  let photoIdx = 0;
  const allMissing = [
    ...projMissing.map(p => ({ ...p, _type: 'projects' })),
    ...artMissing.map(a => ({ ...a, _type: 'articles' })),
  ];

  console.log(`🔧 Fixing ${allMissing.length} missing covers...\n`);
  let fixed = 0;
  for (const item of allMissing) {
    const photoId = VERIFIED_PHOTOS[photoIdx % VERIFIED_PHOTOS.length];
    photoIdx++;
    const imgUrl = unsplashUrl(photoId, 1200, 800);

    try {
      console.log(`   [${item._type}] ${item.title}`);
      const imgBuffer = await downloadImage(imgUrl);
      await sleep(300);
      const media = await uploadMedia(TOKEN, imgBuffer, `cover-fix-${photoIdx}.jpg`);
      console.log(`      📎 Media: ${media.id}`);

      // Update cover + fix content
      const updateBody = { cover_image_id: media.id, og_image_id: media.id };
      if (item.content && item.content.includes('picsum.photos')) {
        updateBody.content = fixContentImages(item.content);
      }

      const updateRes = await fetch(`${BASE}/${item._type}/${item.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify(updateBody),
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        console.log(`      ✅ Done`);
        fixed++;
      } else {
        console.log(`      ❌ ${updateData.message}`);
      }
    } catch (err) {
      console.log(`      ❌ ${err.message}`);
    }
    await sleep(800);
  }

  // Fix remaining picsum content (items that already have cover but still have picsum in content)
  console.log(`\n🔧 Fixing remaining picsum content...`);
  const contentOnly = [
    ...projPicsum.filter(p => p.cover_image_id || p.cover_image).map(p => ({ ...p, _type: 'projects' })),
    ...artPicsum.filter(a => a.cover_image_id || a.cover_image).map(a => ({ ...a, _type: 'articles' })),
  ];

  let contentFixed = 0;
  for (const item of contentOnly) {
    try {
      console.log(`   [${item._type}] ${item.title}`);
      const fixedContent = fixContentImages(item.content);
      const updateRes = await fetch(`${BASE}/${item._type}/${item.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ content: fixedContent }),
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        console.log(`      ✅ Content fixed`);
        contentFixed++;
      } else {
        console.log(`      ❌ ${updateData.message}`);
      }
    } catch (err) {
      console.log(`      ❌ ${err.message}`);
    }
    await sleep(300);
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Covers fixed: ${fixed}/${allMissing.length}`);
  console.log(`   Content fixed: ${contentFixed}/${contentOnly.length}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
