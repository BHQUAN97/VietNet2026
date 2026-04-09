/**
 * Fix seed data images:
 * 1. Download curated Unsplash interior photos
 * 2. Upload via /api/media/upload → get media IDs
 * 3. PATCH projects/articles with cover_image_id
 * 4. Replace broken picsum URLs in content with Unsplash URLs
 *
 * Chay: node backend/src/scripts/fix-seed-images.js
 */

const fs = require('fs');
const path = require('path');

const BASE = 'https://bhquan.store/api';

// ========== Curated Unsplash interior design photos ==========
// Moi photo la 1 ID hop le, da kiem tra
const UNSPLASH_INTERIOR = [
  // Projects: cover images (23 photos)
  '1502672260266-1c1ef2d93688', // 0  penthouse living room
  '1618221195710-dd6b41faaea6', // 1  luxury bedroom
  '1600210492493-0946911f159a', // 2  modern kitchen
  '1616486338812-3dadae4b4ace', // 3  zen interior
  '1600607687939-ce8a6c25118c', // 4  modern bathroom
  '1631679706909-1844bbd07221', // 5  office space
  '1600585154340-be6161a56a0c', // 6  hotel lobby
  '1616137422495-1e9e46e2aa77', // 7  restaurant interior
  '1600566753190-17f0baa2a6c3', // 8  showroom
  '1600573472591-ee6981cf35b6', // 9  apartment living
  '1600585154526-990dced4db0d', // 10 villa interior
  '1600566752355-35792bedcfea', // 11 townhouse
  '1497366216548-37526070297c', // 12 tech office
  '1582719478250-c89cae4dc85b', // 13 resort suite
  '1554118811-1e0d58224f24',    // 14 cafe interior
  '1600607687644-c7171b42498f', // 15 showroom 2
  '1600585154363-f2785e64e10a', // 16 grand villa
  '1600573472592-ee6981cf35b7', // 17 city townhouse (placeholder, use 9 again)
  '1600047509807-ba8f99d2cdde', // 18 coworking
  '1559329007-40d22894f337',    // 19 rooftop bar
  '1522708323590-d24dbb6b0267', // 20 studio apartment
  '1586023492125-27b65726826d', // 21 extra 1
  '1556909114-f6e7ad7d3136',    // 22 extra 2
];

// Articles: cover images (24 photos)
const UNSPLASH_ARTICLES = [
  '1556909114-f6e7ad7d3136',    // 0  kitchen materials
  '1556909172-54557c7e4fb7',    // 1  kitchen mistakes
  '1618219908412-a29a1bb7b86e', // 2  minimalist trend
  '1615529328331-f8917597711f', // 3  2026 trends
  '1600210491369-e753d0fa26e5', // 4  wood guide
  '1616486029423-cef65943f137', // 5  budget decor tips
  '1617806118233-18e1de247200', // 6  bedroom feng shui
  '1600585154084-4c0da6be028a', // 7  behind the scenes
  '1556909190-eccf4a8bf97a',    // 8  acrylic vs laminate
  '1556185781-a4e384e37a22',    // 9  kitchen layout
  '1600566752229-35792bedcfe0', // 10 green interior
  '1507089947017-82a3a1cd12d0', // 11 lighting guide
  '1600210491892-ed9a0b1d0dab', // 12 wabi-sabi
  '1600585154526-990dced4db0d', // 13 stone countertop
  '1600573472591-ee6981cf35b6', // 14 altar feng shui
  '1600566753190-17f0baa2a6c3', // 15 renovation BTS
  '1616137422495-1e9e46e2aa77', // 16 curtain guide
  '1600607687939-ce8a6c25118c', // 17 small space
  '1631679706909-1844bbd07221', // 18 door feng shui
  '1556909114-f6e7ad7d3136',    // 19 smart kitchen
  '1585128792020-1d20ba20de5e', // 20 plants
  '1600585154340-be6161a56a0c', // 21 design mistakes
  '1600210492493-0946911f159a', // 22 bathroom materials
  '1497366216548-37526070297c', // 23 solar energy
];

// Content images — 10 sets of 10 Unsplash photos for inline content
const CONTENT_PHOTOS = [
  // Set 0-9: dung cho projects
  ['1502672260266-1c1ef2d93688','1618221195710-dd6b41faaea6','1600210492493-0946911f159a','1616486338812-3dadae4b4ace','1600607687939-ce8a6c25118c','1631679706909-1844bbd07221','1600585154340-be6161a56a0c','1616137422495-1e9e46e2aa77','1600566753190-17f0baa2a6c3','1556909114-f6e7ad7d3136'],
  ['1600573472591-ee6981cf35b6','1600585154526-990dced4db0d','1600566752355-35792bedcfea','1497366216548-37526070297c','1582719478250-c89cae4dc85b','1554118811-1e0d58224f24','1600607687644-c7171b42498f','1600585154363-f2785e64e10a','1586023492125-27b65726826d','1559329007-40d22894f337'],
  ['1522708323590-d24dbb6b0267','1615529328331-f8917597711f','1600210491369-e753d0fa26e5','1616486029423-cef65943f137','1617806118233-18e1de247200','1600585154084-4c0da6be028a','1556909190-eccf4a8bf97a','1556185781-a4e384e37a22','1507089947017-82a3a1cd12d0','1600210491892-ed9a0b1d0dab'],
];

function unsplashUrl(photoId, w = 800, h = 500) {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;
}

// Replace picsum URLs in content HTML with Unsplash URLs
function fixContentImages(html, setIndex) {
  const set = CONTENT_PHOTOS[setIndex % CONTENT_PHOTOS.length];
  let idx = 0;
  // Thay tung img src picsum bang Unsplash
  return html.replace(
    /https:\/\/picsum\.photos\/id\/\d+\/\d+\/\d+/g,
    () => {
      const url = unsplashUrl(set[idx % set.length], 800, 500);
      idx++;
      return url;
    }
  );
}

// Download image as Buffer
async function downloadImage(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

// Upload image buffer to API, return media object
async function uploadMedia(token, buffer, filename) {
  const { FormData, Blob } = await getFormData();
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

// Node 18+ co native FormData nhung can check
async function getFormData() {
  // Node 18+ has built-in FormData and Blob
  if (typeof globalThis.FormData !== 'undefined') {
    return { FormData: globalThis.FormData, Blob: globalThis.Blob };
  }
  // Fallback: undici
  try {
    const undici = require('undici');
    return { FormData: undici.FormData, Blob: undici.Blob || globalThis.Blob };
  } catch {
    throw new Error('Need Node 18+ or undici package for FormData support');
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============ MAIN ============
async function main() {
  // 1. Login
  console.log('🔐 Logging in...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vietnet.local', password: 'Admin@123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('❌ Login failed:', loginData);
    process.exit(1);
  }
  const TOKEN = loginData.data.accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  };
  console.log('✅ Logged in\n');

  // 2. Fetch all projects
  console.log('📋 Fetching projects...');
  const projRes = await fetch(`${BASE}/projects?limit=50`, { headers });
  const projData = await projRes.json();
  const projects = projData.data || [];
  console.log(`   Found ${projects.length} projects\n`);

  // 3. Fetch all articles
  console.log('📋 Fetching articles...');
  const artRes = await fetch(`${BASE}/articles?limit=50`, { headers });
  const artData = await artRes.json();
  const articles = artData.data || [];
  console.log(`   Found ${articles.length} articles\n`);

  // 4. Fix projects
  console.log('🏗️  Fixing projects...');
  let projFixed = 0;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const photoId = UNSPLASH_INTERIOR[i % UNSPLASH_INTERIOR.length];
    const imgUrl = unsplashUrl(photoId, 1200, 800);

    try {
      // Download cover image
      console.log(`   [${i + 1}/${projects.length}] ${p.title}`);
      console.log(`      ⬇ Downloading cover...`);
      const imgBuffer = await downloadImage(imgUrl);

      // Upload to API
      console.log(`      ⬆ Uploading to R2...`);
      const media = await uploadMedia(TOKEN, imgBuffer, `project-cover-${i + 1}.jpg`);
      console.log(`      📎 Media ID: ${media.id}`);

      // Fix content images
      const fixedContent = p.content ? fixContentImages(p.content, i) : p.content;

      // Update project
      const updateBody = {
        cover_image_id: media.id,
        og_image_id: media.id,
      };
      if (fixedContent !== p.content) {
        updateBody.content = fixedContent;
      }

      const updateRes = await fetch(`${BASE}/projects/${p.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateBody),
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        console.log(`      ✅ Updated!`);
        projFixed++;
      } else {
        console.log(`      ❌ Update failed: ${updateData.message}`);
      }
    } catch (err) {
      console.log(`      ❌ Error: ${err.message}`);
    }

    // Rate limit: 500ms between requests
    await sleep(500);
  }

  console.log(`\n📊 Projects fixed: ${projFixed}/${projects.length}\n`);

  // 5. Fix articles
  console.log('📰 Fixing articles...');
  let artFixed = 0;
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const photoId = UNSPLASH_ARTICLES[i % UNSPLASH_ARTICLES.length];
    const imgUrl = unsplashUrl(photoId, 1200, 800);

    try {
      console.log(`   [${i + 1}/${articles.length}] ${a.title}`);
      console.log(`      ⬇ Downloading cover...`);
      const imgBuffer = await downloadImage(imgUrl);

      console.log(`      ⬆ Uploading to R2...`);
      const media = await uploadMedia(TOKEN, imgBuffer, `article-cover-${i + 1}.jpg`);
      console.log(`      📎 Media ID: ${media.id}`);

      // Fix content images
      const fixedContent = a.content ? fixContentImages(a.content, i) : a.content;

      const updateBody = {
        cover_image_id: media.id,
        og_image_id: media.id,
      };
      if (fixedContent !== a.content) {
        updateBody.content = fixedContent;
      }

      const updateRes = await fetch(`${BASE}/articles/${a.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateBody),
      });
      const updateData = await updateRes.json();
      if (updateData.success) {
        console.log(`      ✅ Updated!`);
        artFixed++;
      } else {
        console.log(`      ❌ Update failed: ${updateData.message}`);
      }
    } catch (err) {
      console.log(`      ❌ Error: ${err.message}`);
    }

    await sleep(500);
  }

  console.log(`\n📊 Articles fixed: ${artFixed}/${articles.length}`);
  console.log(`\n🎉 Done! Total: ${projFixed} projects + ${artFixed} articles fixed.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
