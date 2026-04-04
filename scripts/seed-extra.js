const http = require('http');
const API = 'http://localhost:4000/api';
let TOKEN = '';

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(API + path);
    const data = body ? JSON.stringify(body) : null;
    const opts = { hostname: url.hostname, port: url.port, path: url.pathname, method, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN } };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: d }); } }); });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}

async function main() {
  // Login
  const lr = await req('POST', '/auth/login', { email: 'admin@vietnet.local', password: 'Admin@123' });
  TOKEN = lr.body.data?.accessToken;
  console.log('Logged in');

  // Tao material categories
  const mats = ['Gỗ tự nhiên', 'Gỗ công nghiệp', 'Laminate', 'Acrylic', 'Melamine', 'Veneer', 'Đá marble', 'Đá thạch anh', 'Kính cường lực', 'Inox 304'];
  let matOk = 0;
  for (const name of mats) {
    const res = await req('POST', '/categories', { name, type: 'material' });
    if (res.status === 201) { matOk++; console.log(`  Material: ${name}`); }
    else console.log(`  Skip: ${name} (${res.body.message})`);
  }
  console.log(`Materials: ${matOk}/${mats.length}\n`);

  // Tao article #20 bi thieu
  const content = JSON.stringify({ type: 'doc', content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Cách tự đo căn hộ chính xác là bước đầu tiên quan trọng nhất — sai 5cm có thể khiến tủ không vừa hoặc cửa không mở được. Dụng cụ cần: thước laser Bosch GLM 30 (từ 800K), thước cuộn 5m, giấy bút ghi chép.' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Quy trình đo VietNet: (1) Đo tổng diện tích từng phòng dài nhân rộng. (2) Đo vị trí cửa ra vào, cửa sổ, ban công — khoảng cách từ tường. (3) Đo chiều cao trần. (4) Đánh dấu ổ điện, switch, ống nước. (5) Chụp ảnh toàn bộ mỗi góc phòng.' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Gửi bản đo cho VietNet Interior — chúng tôi tư vấn layout miễn phí trong 24h. Email: measure@vietnetinterior.vn. Hoặc đặt lịch đo miễn phí tại nhà — kiến trúc sư đến đo laser 3D chính xác đến 1mm.' }] },
  ] });

  // Check categories
  const cr = await req('GET', '/categories?limit=100');
  const CATS = {};
  for (const c of (cr.body.data || [])) CATS[c.name] = c.id;

  const artRes = await req('POST', '/articles', {
    title: 'Hướng Dẫn Đo Đạc Căn Hộ Trước Khi Thiết Kế',
    excerpt: 'Cách tự đo căn hộ chính xác để tối ưu thiết kế nội thất.',
    content,
    category_id: CATS['Kiến thức nội thất'],
    is_featured: false,
  });
  if (artRes.status === 201) {
    await req('PATCH', `/articles/${artRes.body.data.id}/publish`);
    console.log('Article #20 created: Huong Dan Do Dac');
  } else {
    console.log('Article #20 failed:', artRes.body.message);
  }

  console.log('\n=== EXTRA SEED COMPLETE ===');
}
main().catch(console.error);
