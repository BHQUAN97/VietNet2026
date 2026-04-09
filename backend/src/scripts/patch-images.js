/**
 * Patch Images: Gắn ảnh bìa + gallery + sửa content cho projects/articles đã có
 * - Upload ảnh qua /media/upload
 * - PATCH projects: cover_image_id, gallery_ids, content (fix inline images)
 * - PATCH articles: cover_image_id, content (fix inline images)
 *
 * Chạy: node backend/src/scripts/patch-images.js
 */

const BASE = 'https://bhquan.store/api';

// Unsplash photo IDs — đã test OK
const PHOTO_IDS = [
  '1502672260266-1c1ef2d93688',
  '1618221195710-dd6b41faaea6',
  '1560448204771-d60f0e1a26c0',
  '1616486338812-3dadae4b4ace',
  '1600607687939-ce8a6c25118c',
  '1615529182904-14819c35db37',
  '1631679706909-1844bbd07221',
  '1556909114-f6e7ad7d3136',
  '1600585154340-be6161a56a0c',
  '1586023492125-27b2012f8222',
  '1600566753190-17f0baa2a6c3',
  '1600573472592-401b489a3cdc',
  '1565182999561-18d7dc61c393',
  '1600121848594-d8644e57abab',
  '1555041469-a586c61ea9bc',
  '1600566753086-00f18fb6b03d',
  '1560185127-6ed189bf02f4',
  '1507089947017-82a3e86e0df3',
  '1484154218962-a197022b5858',
  '1571624436279-b272aff752b5',
  '1513694203232-719a280e022f',
  '1560185007-cde436f6670d',
  '1505693416388-ac5ce068fe85',
  '1560440021-5f092f8aa458',
  '1536437075651-01d7a4e4a3b7',
  '1560184897-ae75f418493e',
  '1556761175-b413da4baf72',
  '1560185893-39b5c0ef5a1a',
  '1574739782594-db4ead022697',
  '1600607687644-aac5c9cced2d',
];

function unsplashUrl(idx, w = 1200, h = 800) {
  const id = PHOTO_IDS[idx % PHOTO_IDS.length];
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;
}

// Download ảnh → upload qua API → trả media ID
async function uploadImage(photoIdx, token, label) {
  const urls = [
    unsplashUrl(photoIdx),
    `https://picsum.photos/id/${(photoIdx * 7 + 10) % 200}/1200/800`,
    `https://picsum.photos/1200/800?random=${Date.now()}_${photoIdx}`,
  ];

  let buffer = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (res.ok && (res.headers.get('content-type') || '').startsWith('image/')) {
        buffer = await res.arrayBuffer();
        break;
      }
    } catch { /* next */ }
  }
  if (!buffer) { console.log(`    ⚠️ Skip ${label}`); return null; }

  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), `interior-${photoIdx}.jpg`);

  const res = await fetch(`${BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!data.success) { console.log(`    ⚠️ Upload failed: ${data.message}`); return null; }
  console.log(`    ✅ ${label} → ${data.data.id}`);
  return data.data.id;
}

// Fix content: thay picsum broken images bằng Unsplash URLs
function fixContentImages(html, photoOffset) {
  if (!html) return html;
  let idx = 0;
  // Thay tất cả <img src="https://picsum..."> bằng Unsplash
  return html.replace(/<img\s+src="https:\/\/picsum\.photos[^"]*"/g, () => {
    const url = unsplashUrl(photoOffset + idx, 1200, 800);
    idx++;
    return `<img src="${url}"`;
  });
}

async function main() {
  console.log('🔧 Patch Images — Fix cover + gallery + content\n');

  // Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vietnet.local', password: 'Admin@123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success) { console.error('Login failed'); process.exit(1); }
  const TOKEN = loginData.data.accessToken;
  const authHeaders = { Authorization: `Bearer ${TOKEN}` };
  const jsonHeaders = { 'Content-Type': 'application/json', ...authHeaders };
  console.log('✅ Logged in\n');

  // Upload image pool (30 ảnh)
  console.log('📷 Uploading 30 images...');
  const mediaIds = [];
  for (let i = 0; i < 30; i++) {
    const id = await uploadImage(i, TOKEN, `[${i + 1}/30]`);
    if (id) mediaIds.push(id);
    // Delay nhỏ giữa uploads
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`✅ Pool: ${mediaIds.length} images\n`);

  if (mediaIds.length === 0) {
    console.error('❌ No images uploaded, cannot proceed');
    process.exit(1);
  }

  // Lấy danh sách projects hiện tại
  console.log('🏗️ Patching projects...');
  const projRes = await fetch(`${BASE}/projects/admin/list?limit=50`, { headers: jsonHeaders });
  const projData = await projRes.json();
  const existingProjects = projData.success ? projData.data : [];
  console.log(`  Found ${existingProjects.length} projects`);

  for (let i = 0; i < existingProjects.length; i++) {
    const p = existingProjects[i];
    const coverIdx = i % mediaIds.length;
    const galleryIds = Array.from({ length: 6 }, (_, j) => mediaIds[(i + j + 1) % mediaIds.length]);

    // Fix content images
    const fixedContent = fixContentImages(p.content, i * 3);

    const patchBody = {
      cover_image_id: mediaIds[coverIdx],
      gallery_ids: galleryIds,
    };
    if (fixedContent !== p.content) {
      patchBody.content = fixedContent;
    }

    const res = await fetch(`${BASE}/projects/${p.id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(patchBody),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`  ✅ [${i + 1}/${existingProjects.length}] ${p.title} (cover: ${mediaIds[coverIdx].slice(-6)}, gallery: 6)`);
    } else {
      console.log(`  ❌ [${i + 1}] ${p.title}: ${data.message}`);
    }
  }

  // Lấy danh sách articles hiện tại
  console.log('\n📰 Patching articles...');
  const artRes = await fetch(`${BASE}/articles/admin/list?limit=50`, { headers: jsonHeaders });
  const artData = await artRes.json();
  const existingArticles = artData.success ? artData.data : [];
  console.log(`  Found ${existingArticles.length} articles`);

  for (let i = 0; i < existingArticles.length; i++) {
    const a = existingArticles[i];
    const coverIdx = (i + 15) % mediaIds.length; // Offset để ảnh bìa khác projects

    const fixedContent = fixContentImages(a.content, (i + 10) * 3);

    const patchBody = {
      cover_image_id: mediaIds[coverIdx],
    };
    if (fixedContent !== a.content) {
      patchBody.content = fixedContent;
    }

    const res = await fetch(`${BASE}/articles/${a.id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(patchBody),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`  ✅ [${i + 1}/${existingArticles.length}] ${a.title}`);
    } else {
      console.log(`  ❌ [${i + 1}] ${a.title}: ${data.message}`);
    }
  }

  console.log('\n🎉 Done!');
  console.log(`  📷 ${mediaIds.length} images uploaded`);
  console.log(`  🏗️ ${existingProjects.length} projects patched`);
  console.log(`  📰 ${existingArticles.length} articles patched`);
}

main().catch(err => { console.error('💥', err); process.exit(1); });
