/**
 * Seed V2: 20 Categories + 20 Projects + 20 Articles
 * - Upload ảnh thật từ Unsplash qua /media/upload API
 * - Gán cover_image_id + gallery_ids cho projects/articles
 * - Content HTML dùng Unsplash URLs trực tiếp
 *
 * Chạy: node backend/src/scripts/seed-full-demo-v2.js
 * Yêu cầu: Node 18+ (native fetch + FormData)
 */

const BASE = 'https://bhquan.store/api';

// ============================================================
// UNSPLASH PHOTO POOL — 60 ảnh nội thất chất lượng cao
// Dùng https://images.unsplash.com/photo-{ID}?w=...&fit=crop
// ============================================================
const PHOTO_IDS = [
  '1502672260266-1c1ef2d93688', // living room
  '1618221195710-dd6b41faaea6', // bedroom
  '1600210492486-724fe5c67fb3', // kitchen
  '1560448204771-d60f0e1a26c0', // bedroom 2
  '1616486338812-3dadae4b4ace', // bathroom
  '1600607687939-ce8a6c25118c', // living space
  '1615529182904-14819c35db37', // modern interior
  '1631679706909-1844bbd07221', // furniture
  '1556909114-f6e7ad7d3136', // architecture
  '1600585154340-be6161a56a0c', // interior design
  '1586023492125-27b2012f8222', // home office
  '1583847268964-b28dc8f51f92', // house exterior
  '1600566753190-17f0baa2a6c3', // dining room
  '1600573472592-401b489a3cdc', // kitchen 2
  '1565182999561-18d7dc61c393', // minimalist
  '1600121848594-d8644e57abab', // bathroom 2
  '1555041469-a586c61ea9bc', // modern house
  '1600566753086-00f18fb6b03d', // living room 2
  '1600210491369-e753d80a41f3', // kitchen 3
  '1560185127-6ed189bf02f4', // cozy bedroom
  '1507089947017-82a3e86e0df3', // luxury interior
  '1484154218962-a197022b5858', // kitchen design
  '1540518614846-7eded433c457', // bedroom design
  '1571624436279-b272aff752b5', // dining area
  '1513694203232-719a280e022f', // white interior
  '1560185007-cde436f6670d', // modern bedroom
  '1505693416388-ac5ce068fe85', // workspace
  '1560440021-5f092f8aa458', // bathroom luxury
  '1536437075651-01d7a4e4a3b7', // living room 3
  '1560184897-ae75f418493e', // bedroom 3
  '1556761175-b413da4baf72', // hallway
  '1560185893-39b5c0ef5a1a', // lounge
  '1574739782594-db4ead022697', // hotel room
  '1600607687644-aac5c9cced2d', // kitchen 4
  '1600607688969-a5bfcd646154', // bathroom 3
  '1595526114035-0d45ed16cfbf', // entrance
  '1600047509807-ba8f99d2cdde', // modern kitchen
  '1560184990-de6fdf71e5e7', // condo interior
  '1600566752355-35792bedcfea', // living room 4
  '1598928506311-aab7ecc834e0', // wood interior
  '1556909212-d5b604d0c90d', // luxury bedroom
  '1596900779744-2bdc4a90509a', // open kitchen
  '1560185009-5bf9f2ce0d03', // apartment
  '1560185008-b033106af763', // room
  '1600585153490-76fb20a32601', // balcony
  '1615874694520-41b8fbb0d1ba', // closet
  '1618219908412-a29a1bb7b86c', // bathroom design
  '1556909078-e5b2e5d0d342', // villa
  '1600047508788-786f3865b4b7', // shelves
  '1560185007-5f0bb1866cab', // stairs
  '1600563438749-a0e77bd2afab', // sofa
  '1617103996702-96ff29b1c467', // pendant lights
  '1600210491892-bc01cff441e9', // marble kitchen
  '1594026112284-02bb6f3352fe', // rug design
  '1560184611-c0e94e4cc498', // modern living
  '1600210492493-b930ee81dbf5', // pantry
  '1597218868981-1b68e15f0065', // bookshelf
  '1560185008-a33f5c7a8e09', // lamp
  '1615873968403-f9e601145c1d', // wardrobe
  '1618219740975-d40978bb7378', // shower
];

function photoUrl(idx, w = 1200, h = 800) {
  const id = PHOTO_IDS[idx % PHOTO_IDS.length];
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`;
}

// ============================================================
// HELPER: Download image → upload qua API → trả về media ID
// ============================================================
async function uploadImageFromUrl(photoIdx, token, label = '') {
  // Thử download ảnh, nếu 404 thì fallback sang picsum
  const urls = [
    photoUrl(photoIdx, 1200, 800),
    `https://picsum.photos/id/${(photoIdx * 7 + 10) % 200}/1200/800`,
    `https://picsum.photos/1200/800?random=${photoIdx}`,
  ];

  let buffer = null;
  for (const url of urls) {
    try {
      console.log(`    📷 Downloading ${label || `photo[${photoIdx}]`}...`);
      const imgRes = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      if (imgRes.ok) {
        const contentType = imgRes.headers.get('content-type') || '';
        if (contentType.startsWith('image/')) {
          buffer = await imgRes.arrayBuffer();
          break;
        }
      }
    } catch (e) { /* try next */ }
  }
  if (!buffer) {
    console.log(`    ⚠️ Skipped ${label} — all download attempts failed`);
    return null;
  }

  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, `interior-${photoIdx}.jpg`);

  const uploadRes = await fetch(`${BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.success) {
    console.log(`    ⚠️ Upload failed for ${label}: ${uploadData.message}`);
    return null;
  }

  console.log(`    ✅ Uploaded → ${uploadData.data.id}`);
  return uploadData.data.id;
}

// Upload nhiều ảnh tuần tự (tránh rate limit)
async function uploadBatch(indices, token, prefix = '') {
  const ids = [];
  const BATCH_SIZE = 2; // Giảm batch size để tránh rate limit
  for (let i = 0; i < indices.length; i += BATCH_SIZE) {
    const batch = indices.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((idx, j) => uploadImageFromUrl(idx, token, `${prefix} [${i + j + 1}/${indices.length}]`))
    );
    ids.push(...results.filter(Boolean)); // Bỏ null
    // Delay nhỏ giữa batches để tránh rate limit
    if (i + BATCH_SIZE < indices.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return ids;
}

// ============================================================
// HTML CONTENT HELPERS — dùng Unsplash URLs trực tiếp
// ============================================================
function makeContentWithImages(textHtml, photoStartIdx, numImages = 10) {
  const images = [];
  for (let i = 0; i < numImages; i++) {
    const url = photoUrl(photoStartIdx + i, 1200, 800);
    images.push(
      `<figure><img src="${url}" alt="Hình ${i + 1}" loading="lazy" style="width:100%;border-radius:8px;margin-bottom:16px"/></figure>`
    );
  }
  // Xen kẽ: text rồi ảnh
  const parts = textHtml.split('</p>');
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (i < parts.length - 1) {
      result += '</p>\n';
      // Chèn 2-3 ảnh sau mỗi đoạn văn
      const imgStart = Math.floor(i * numImages / Math.max(parts.length - 1, 1));
      const imgEnd = Math.floor((i + 1) * numImages / Math.max(parts.length - 1, 1));
      for (let j = imgStart; j < imgEnd && j < images.length; j++) {
        result += images[j] + '\n';
      }
    }
  }
  // Thêm ảnh còn lại cuối bài
  const usedCount = Math.floor((parts.length - 1) * numImages / Math.max(parts.length - 1, 1));
  for (let j = usedCount; j < images.length; j++) {
    result += images[j] + '\n';
  }
  return result;
}

// ============================================================
// CATEGORIES
// ============================================================
const categories = [
  { name: 'Căn Hộ Chung Cư', type: 'project', description: 'Thiết kế nội thất căn hộ chung cư cao cấp và trung cấp' },
  { name: 'Biệt Thự', type: 'project', description: 'Nội thất biệt thự sang trọng, phong cách đa dạng' },
  { name: 'Nhà Phố', type: 'project', description: 'Thiết kế tối ưu không gian cho nhà phố Việt Nam' },
  { name: 'Văn Phòng', type: 'project', description: 'Không gian làm việc hiện đại, sáng tạo' },
  { name: 'Khách Sạn & Resort', type: 'project', description: 'Thiết kế hospitality đẳng cấp quốc tế' },
  { name: 'Nhà Hàng & Café', type: 'project', description: 'Không gian F&B ấn tượng, thu hút khách hàng' },
  { name: 'Showroom', type: 'project', description: 'Trưng bày sản phẩm chuyên nghiệp, nổi bật thương hiệu' },
  { name: 'Xu Hướng Thiết Kế', type: 'article', description: 'Cập nhật xu hướng nội thất mới nhất' },
  { name: 'Kiến Thức Vật Liệu', type: 'article', description: 'Tìm hiểu về các loại vật liệu nội thất' },
  { name: 'Mẹo Trang Trí', type: 'article', description: 'Bí quyết trang trí nhà đẹp, tiết kiệm' },
  { name: 'Phong Thủy', type: 'article', description: 'Phong thủy trong thiết kế nội thất' },
  { name: 'Câu Chuyện Dự Án', type: 'article', description: 'Behind the scenes các dự án nổi bật' },
  { name: 'Thiết Kế Bếp', type: 'article', description: 'Chuyên sâu về thiết kế và vật liệu bếp' },
  { name: 'Thiết Kế Xanh', type: 'article', description: 'Giải pháp nội thất bền vững, thân thiện môi trường' },
  { name: 'Tủ Bếp Laminate', type: 'product', description: 'Tủ bếp phủ Laminate bền đẹp, giá tốt' },
  { name: 'Tủ Áo', type: 'product', description: 'Tủ quần áo đa năng, tiết kiệm không gian' },
  { name: 'Kệ Tivi', type: 'product', description: 'Kệ tivi hiện đại, tích hợp lưu trữ' },
  { name: 'Bàn Làm Việc', type: 'product', description: 'Bàn làm việc tại nhà, ergonomic' },
  { name: 'Giường Ngủ', type: 'product', description: 'Giường ngủ gỗ công nghiệp và gỗ tự nhiên' },
  { name: 'Nội Thất Phòng Tắm', type: 'product', description: 'Tủ lavabo, kệ phòng tắm chống nước' },
];

// ============================================================
// PROJECTS (20) — mỗi project có content + 10 ảnh inline
// ============================================================
const projects = [
  {
    title: 'Penthouse Vinhomes Central Park',
    description: 'Thiết kế nội thất penthouse 200m² phong cách Contemporary tại Vinhomes Central Park, Bình Thạnh.',
    style: 'Contemporary', area: '200m²', location: 'Bình Thạnh, TP.HCM', year_completed: 2025, catIdx: 0, photoStart: 0,
    content: `<h2>Penthouse Đẳng Cấp Giữa Lòng Sài Gòn</h2>
<p>Dự án penthouse tại Vinhomes Central Park là sự kết hợp hoàn hảo giữa phong cách đương đại và nét sang trọng Á Đông. Không gian mở 200m² được quy hoạch thông minh với phòng khách liền bếp, tạo cảm giác rộng rãi và thoáng đãng. Vật liệu chủ đạo là gỗ óc chó Mỹ kết hợp đá marble Ý, mang lại vẻ đẹp vượt thời gian.</p>
<p>Hệ thống chiếu sáng được thiết kế theo concept "ánh sáng tự nhiên", với cửa kính lớn từ sàn đến trần, cho phép ánh nắng tràn ngập khắp căn hộ. Phòng ngủ master được trang bị walk-in closet và phòng tắm spa riêng với bồn tắm freestanding nhìn ra toàn cảnh thành phố.</p>
<p>Khu vực bếp đảo trung tâm với mặt đá granite nguyên khối, hệ tủ bếp âm tường thiết kế tối giản. Phòng ăn 8 chỗ với bàn gỗ walnut và ghế bọc da Ý. Hệ thống smart home Lutron điều khiển toàn bộ ánh sáng, rèm và nhiệt độ qua app di động.</p>`
  },
  {
    title: 'Biệt Thự Lucasta Quận 9',
    description: 'Nội thất biệt thự song lập phong cách Indochine hiện đại tại Lucasta.',
    style: 'Indochine', area: '350m²', location: 'Quận 9, TP.HCM', year_completed: 2025, catIdx: 1, photoStart: 3,
    content: `<h2>Indochine Hiện Đại — Hơi Thở Việt Nam Đương Đại</h2>
<p>Biệt thự Lucasta là dự án tiêu biểu cho phong cách Indochine hiện đại — nơi truyền thống Việt Nam gặp gỡ thiết kế đương đại. Tổng diện tích sử dụng 350m² trải trên 3 tầng, mỗi không gian đều kể một câu chuyện riêng. Sảnh chính với trần cao 6m, trang trí bằng hệ lam gỗ thông theo motif hoa sen cách điệu.</p>
<p>Phòng khách sử dụng gam màu trầm ấm — nâu đất, xanh rêu, và vàng đồng. Nội thất được đặt làm riêng bởi các nghệ nhân Việt Nam: bàn trà gỗ hương, đèn lồng tre hiện đại, và tranh sơn mài đặt hàng theo kích thước. Khu vực bếp-ăn mở ra sân vườn với hồ cá Koi.</p>
<p>Phòng ngủ master tầng 2 với ban công nhìn ra vườn, nội thất gỗ teak tự nhiên. Phòng tắm sử dụng gạch terrazzo thủ công, bồn tắm đá nguyên khối. Tầng 3 là không gian giải trí gia đình với phòng chiếu phim mini và bar rượu.</p>`
  },
  {
    title: 'Nhà Phố Liền Kề Mega Village',
    description: 'Cải tạo nhà phố 3 tầng phong cách Scandinavian ấm áp.',
    style: 'Scandinavian', area: '120m²', location: 'Quận 9, TP.HCM', year_completed: 2024, catIdx: 2, photoStart: 6,
    content: `<h2>Scandinavia Giữa Sài Gòn — Tối Giản Mà Ấm Cúng</h2>
<p>Nhà phố Mega Village được cải tạo toàn diện theo phong cách Scandinavian — nơi sự tối giản gặp gỡ sự ấm áp. Với diện tích 120m², thách thức lớn nhất là tối ưu mọi mét vuông cho gia đình 4 người. Giải pháp: tường trắng kết hợp gỗ sồi tự nhiên, tạo nền sáng và sạch cho toàn bộ không gian.</p>
<p>Cầu thang gỗ với lan can thép đen trở thành điểm nhấn kiến trúc. Tầng 1 mở hoàn toàn cho phòng khách - bếp - ăn, với cửa kính lùa ra sân sau nhỏ trồng cây xanh. Phòng ngủ các tầng trên dùng nội thất thông minh: giường có ngăn kéo, bàn học gắn tường, tủ áo âm tường.</p>
<p>Phòng tắm tầng 1 thiết kế accessible, gạch subway trắng classic kết hợp vòi sen rainfall chrome. Sân thượng tầng 3 biến thành khu vườn nhỏ với ghế swing và cây cảnh mini.</p>`
  },
  {
    title: 'Văn Phòng Startup The Crest',
    description: 'Không gian co-working 300m² phong cách Industrial tại The Crest, Quận 2.',
    style: 'Industrial Modern', area: '300m²', location: 'Thủ Đức, TP.HCM', year_completed: 2025, catIdx: 3, photoStart: 9,
    content: `<h2>Không Gian Làm Việc Truyền Cảm Hứng</h2>
<p>Văn phòng startup tại The Crest được thiết kế theo concept "Open & Connected" — phá bỏ mọi rào cản vật lý để khuyến khích sáng tạo và hợp tác. Trần bê tông lộ kết hợp hệ thống ống kỹ thuật sơn đen tạo nên DNA Industrial đặc trưng.</p>
<p>Khu vực làm việc chia thành 3 zone: Focus (bàn cá nhân), Collaborate (bàn nhóm 4-8 người), và Relax (bean bag, sofa, bar cà phê). Phòng họp kính cách âm đặt xen kẽ, trang bị công nghệ AV hiện đại.</p>
<p>Điểm nhấn là bức tường xanh sống 15m² tại sảnh chính, lọc không khí và tạo cảm giác thư giãn. Bếp pantry thiết kế như quán café với máy espresso chuyên dụng và quầy bar ăn sáng.</p>`
  },
  {
    title: 'Boutique Hotel Hội An',
    description: 'Thiết kế 12 phòng boutique hotel mang hơi thở phố cổ Hội An.',
    style: 'Heritage Contemporary', area: '800m²', location: 'Hội An, Quảng Nam', year_completed: 2024, catIdx: 4, photoStart: 12,
    content: `<h2>Di Sản Phố Cổ Trong Không Gian Nghỉ Dưỡng</h2>
<p>Boutique Hotel Hội An là dự án đặc biệt: 12 phòng, mỗi phòng một câu chuyện khác nhau về phố cổ — từ Phố Đèn Lồng đến Chùa Cầu, từ nhà cổ Tấn Ký đến bãi biển An Bàng. Vật liệu địa phương: gỗ mít, gạch Bát Tràng, lụa Mã Châu, gốm Thanh Hà.</p>
<p>Sảnh check-in với sàn gạch hoa Hội An nguyên bản, quầy lễ tân bằng gỗ mít nguyên khối. Mỗi phòng có ban công nhỏ nhìn ra vườn hoặc sông Thu Bồn. Phòng tắm sử dụng gạch zellige thủ công và bồn rửa đá granito.</p>
<p>Nhà hàng tầng trệt phục vụ ẩm thực fusion Hội An, với bếp mở nhìn ra vườn thảo mộc. Khu spa trên tầng thượng với liệu pháp truyền thống Việt Nam kết hợp aromatherapy hiện đại.</p>`
  },
  {
    title: 'Saigon Serenity Villa',
    description: 'Thiết kế nội thất biệt thự phong cách Zen hiện đại, kết hợp gỗ tự nhiên và ánh sáng tự nhiên.',
    style: 'Modern Zen', area: '280m²', location: 'Quận 2, TP.HCM', year_completed: 2025, catIdx: 1, photoStart: 15,
    content: `<h2>Zen Hiện Đại Giữa Sài Gòn</h2>
<p>Biệt thự Zen hiện đại tại Quận 2, kết hợp gỗ tự nhiên và ánh sáng chan hòa. Không gian mở 280m² được thiết kế theo triết lý tối giản Nhật Bản, mỗi chi tiết đều có mục đích và ý nghĩa riêng. Vật liệu chính: gỗ sồi Mỹ, đá basalt đen, và kính cường lực Low-E.</p>
<p>Phòng khách với trần cao 4.5m, cửa kính lùa mở ra sân vườn Nhật với hồ cá Koi và đá cuội. Phòng trà tatami truyền thống cho những buổi thiền định cuối tuần. Bếp đảo tối giản với mặt đá nhân tạo trắng tinh, tủ bếp gỗ sồi tự nhiên.</p>
<p>Master bedroom với giường platform thấp kiểu Nhật, tường ốp gỗ slat dọc tạo chiều sâu. Phòng tắm open-plan với bồn tắm đá tròn freestanding, vòi sen rain shower đồng đen. Khu vườn Zen với cây bonsai, đèn đá, và lối đi stepping stones.</p>`
  },
  {
    title: 'Rooftop Bar Skyline',
    description: 'Bar rooftop 200m² trên tầng 25 với view 360° thành phố.',
    style: 'Glamorous Modern', area: '200m²', location: 'Quận 1, TP.HCM', year_completed: 2025, catIdx: 5, photoStart: 18,
    content: `<h2>Skyline — Nơi Sài Gòn Lộng Lẫy Nhất</h2>
<p>Rooftop bar Skyline trên tầng 25 là điểm đến nightlife mới của Sài Gòn — thiết kế Glamorous Modern với view 360° toàn thành phố. Quầy bar trung tâm hình bán nguyệt, mặt onyx translucent chiếu sáng từ bên trong.</p>
<p>Khu lounge ngoài trời với sofa module chống thời tiết, lò sưởi gas, và infinity pool cạnh nông tạo hiệu ứng nước tràn bờ. Trần pergola gỗ với hệ rèm tự động che mưa nắng. LED strip chạy dọc mọi cạnh kiến trúc, đổi màu theo nhạc DJ.</p>
<p>Khu VIP riêng biệt với jacuzzi nóng và champagne locker cá nhân. Sàn terrazzo pha mảnh gương và đồng vụn lấp lánh dưới ánh đèn. Nhà vệ sinh thiết kế như spa mini với vòi cảm ứng và gương LED thông minh.</p>`
  },
  {
    title: 'Căn Hộ Studio Vinhomes Grand Park',
    description: 'Studio 35m² tối ưu không gian cho người trẻ độc thân.',
    style: 'Smart Compact', area: '35m²', location: 'Quận 9, TP.HCM', year_completed: 2025, catIdx: 0, photoStart: 21,
    content: `<h2>35m² — Nhỏ Nhưng Có Tất Cả</h2>
<p>Studio 35m² tại Vinhomes Grand Park là thách thức thiết kế thú vị: làm sao để một không gian nhỏ trở thành nơi sống tiện nghi? Giải pháp: nội thất đa năng và phân vùng bằng ánh sáng, không bằng tường. Giường Murphy gấp lên tường, biến phòng ngủ thành phòng khách ban ngày.</p>
<p>Bếp mini chữ I dài 2.4m nhưng đầy đủ: bếp từ, lò vi sóng tích hợp, và tủ lạnh âm. Phòng tắm 3m² với bồn cầu treo, vòi sen rainfall, và gương tủ có đèn. Tủ quần áo dạng closet mở với rèm vải thay cửa.</p>
<p>Gam màu sáng — trắng, xám nhạt, gỗ bạch dương — phản chiếu ánh sáng, tạo cảm giác rộng hơn thực tế. Ban công nhỏ 3m² biến thành góc thư giãn với ghế xếp và cây xanh treo tường.</p>`
  },
  {
    title: 'Nhà Hàng Phở Việt Modern',
    description: 'Nhà hàng phở cao cấp 250m² phong cách Vietnamese Modern.',
    style: 'Vietnamese Modern', area: '250m²', location: 'Quận 3, TP.HCM', year_completed: 2024, catIdx: 5, photoStart: 24,
    content: `<h2>Phở Việt Trong Không Gian Đương Đại</h2>
<p>Nhà hàng Phở Việt Modern tại Quận 3 là nơi ẩm thực truyền thống gặp gỡ thiết kế đương đại. Concept "Street to Fine Dining" — đưa tinh hoa phở đường phố vào không gian sang trọng. Mặt tiền kính trong suốt cho phép khách qua đường nhìn thấy bếp mở và không gian bên trong.</p>
<p>Sàn gạch bông Việt Nam vintage, tường ốp gạch trần trắng. Đèn mây tre đan thủ công từ Bình Định tạo ánh sáng ấm. Bàn ghế gỗ me tây nguyên cạnh live-edge, mỗi bàn đều độc nhất vô nhị.</p>
<p>Bếp mở showcase với hệ thống hút mùi công nghiệp, khách có thể quan sát đầu bếp ninh xương và kéo phở. Khu VIP tầng lửng với vách ngăn gỗ lam, phù hợp cho tiệc gia đình và doanh nhân tiếp khách.</p>`
  },
  {
    title: 'Biệt Thự Ecopark Grand',
    description: 'Nội thất biệt thự 500m² phong cách Neoclassical châu Âu.',
    style: 'Neoclassical', area: '500m²', location: 'Hưng Yên', year_completed: 2025, catIdx: 1, photoStart: 27,
    content: `<h2>Cổ Điển Châu Âu Giữa Đồng Bằng Bắc Bộ</h2>
<p>Biệt thự Ecopark Grand là dự án nội thất quy mô lớn nhất năm 2025 — 500m² thiết kế theo phong cách Neoclassical châu Âu. Sảnh chính với cầu thang đôi uốn cong, tay vịn gỗ sồi chạm trổ, và đèn chùm pha lê Swarovski đường kính 1.5m.</p>
<p>Phòng khách formal với trần phào chỉ PU mạ vàng, sofa Chesterfield da thật, và lò sưởi giả đá cẩm thạch. Phòng ăn 12 người với bàn gỗ mahogany và ghế bọc nhung. Thư phòng ốp gỗ walnut toàn bộ với hệ kệ sách cao đến trần.</p>
<p>5 phòng ngủ, mỗi phòng một theme màu khác nhau, đều có phòng tắm en-suite với bồn tắm clawfoot. Tầng hầm thiết kế hầm rượu 500 chai và phòng giải trí với bàn bi-a và karaoke.</p>`
  },
  {
    title: 'Nhà Phố Cityland Park Hills',
    description: 'Thiết kế nhà phố 4 tầng phong cách Modern Farmhouse.',
    style: 'Modern Farmhouse', area: '180m²', location: 'Gò Vấp, TP.HCM', year_completed: 2024, catIdx: 2, photoStart: 30,
    content: `<h2>Farmhouse Giữa Phố Thị — Mộc Mạc Và Hiện Đại</h2>
<p>Nhà phố Cityland được thiết kế theo phong cách Modern Farmhouse — xu hướng đang rất được ưa chuộng. Shiplap trắng kết hợp dầm gỗ giả trên trần, cửa barn door, và hardware đen matte tạo nên DNA farmhouse đặc trưng.</p>
<p>Bếp là trái tim của ngôi nhà: đảo bếp lớn với mặt butcher block, tủ bếp shaker style trắng, và apron-front sink. Phòng khách với lò sưởi điện ốp đá tự nhiên, sofa vải bố, và rổ mây trang trí.</p>
<p>Sân thượng thiết kế như farmhouse patio: pergola gỗ, ghế swing, và khu vực trồng rau thảo mộc trong chậu galvanized. Phòng trẻ em thiết kế montessori với giường thấp sàn, kệ sách vừa tầm tay, và bảng vẽ phấn trên tường.</p>`
  },
  {
    title: 'Co-working Space District 7',
    description: 'Không gian co-working 450m² cho freelancer và startup.',
    style: 'Biophilic Design', area: '450m²', location: 'Quận 7, TP.HCM', year_completed: 2025, catIdx: 3, photoStart: 33,
    content: `<h2>Biophilic Co-working — Làm Việc Giữa Thiên Nhiên</h2>
<p>Co-working Space tại Quận 7 áp dụng Biophilic Design — đưa thiên nhiên vào mọi ngóc ngách không gian làm việc. Hơn 300 cây xanh từ dương xỉ, monstera đến cọ areca được bố trí khắp 450m². Tường rêu sống, chậu treo trần, và partition cây leo tạo ranh giới tự nhiên.</p>
<p>Ánh sáng circadian — hệ đèn LED thay đổi nhiệt độ màu theo giờ trong ngày, hỗ trợ nhịp sinh học. Âm thanh white noise pha tiếng suối và chim hót qua hệ loa âm trần.</p>
<p>Vật liệu thô mộc: bàn gỗ nguyên cạnh live-edge, ghế cork, và thảm jute. Khu vực meditation room với sàn tatami và ánh sáng mờ cho 15 phút thư giãn giữa giờ. Bếp chung thiết kế như quán café boutique.</p>`
  },
  {
    title: 'Resort Villa Phú Quốc',
    description: 'Villa nghỉ dưỡng 400m² hướng biển tại Phú Quốc.',
    style: 'Tropical Modern', area: '400m²', location: 'Phú Quốc, Kiên Giang', year_completed: 2025, catIdx: 4, photoStart: 36,
    content: `<h2>Nhiệt Đới Đương Đại — Nghỉ Dưỡng Giữa Thiên Nhiên</h2>
<p>Resort Villa tại Phú Quốc mang phong cách Tropical Modern — kiến trúc mở tối đa, hòa mình vào cảnh quan biển đảo. Mái tranh cọ truyền thống kết hợp kết cấu thép hiện đại. Sàn đá granite mài bóng liền mạch từ trong ra ngoài.</p>
<p>Phòng khách open-air với rèm vải bay trong gió biển, sofa mây tự nhiên, và bàn trà gỗ lũa. Phòng ngủ master nhìn ra biển qua cửa kính trượt toàn phần, giường canopy bằng gỗ teak và rèm tulle trắng.</p>
<p>Hồ bơi infinity 15m hướng biển, deck gỗ composite chống mặn với ghế tắm nắng và dù lá cọ. Bếp ngoài trời với lò nướng và quầy bar phục vụ cocktail hoàng hôn.</p>`
  },
  {
    title: 'Showroom Nội Thất Luxe',
    description: 'Showroom trưng bày 600m² cho thương hiệu nội thất cao cấp.',
    style: 'Gallery Minimal', area: '600m²', location: 'Quận 2, TP.HCM', year_completed: 2024, catIdx: 6, photoStart: 39,
    content: `<h2>Showroom — Nghệ Thuật Trưng Bày Nội Thất</h2>
<p>Showroom Luxe tại Quận 2 được thiết kế theo concept gallery — mỗi sản phẩm nội thất là một tác phẩm nghệ thuật cần được chiếu sáng và trưng bày đúng cách. Không gian 600m² chia thành 8 vignette (không gian mẫu) độc lập, mỗi vignette tái hiện một phong cách sống khác nhau.</p>
<p>Hệ thống chiếu sáng track lighting chuyên dụng, điều chỉnh CRI 95+ để màu sắc vật liệu hiển thị chính xác nhất. Sàn micro-cement xám nhạt làm nền trung tính cho mọi phong cách. Tường di động cho phép thay đổi layout theo mùa collection.</p>
<p>Khu vực consultation riêng biệt với bàn họp tròn, màn hình 75" hiển thị render 3D, và thư viện vật liệu mẫu hơn 500 loại. Quầy reception bằng đá onyx nguyên khối với ánh sáng backlit ấn tượng.</p>`
  },
  {
    title: 'Căn Hộ Duplex Masteri',
    description: 'Duplex 150m² phong cách Japandi tinh tế.',
    style: 'Japandi', area: '150m²', location: 'Thủ Đức, TP.HCM', year_completed: 2025, catIdx: 0, photoStart: 42,
    content: `<h2>Japandi — Khi Nhật Bản Gặp Bắc Âu</h2>
<p>Căn hộ duplex tại Masteri là minh chứng cho phong cách Japandi — sự giao thoa tinh tế giữa tối giản Nhật Bản và ấm áp Scandinavian. 150m² trải trên 2 tầng, mỗi không gian đều hướng đến sự yên bình và hài hòa.</p>
<p>Tầng dưới: phòng khách sunken với sofa module vải boucle, bàn trà gỗ thông Nhật, và đèn washi paper. Bếp chữ L tông trắng-gỗ, mặt bếp quartz trắng, tủ handle-less. Cầu thang gỗ sồi Nhật với lan can dây cáp inox.</p>
<p>Tầng trên: master bedroom với giường platform gỗ hinoki, tủ áo sliding door kiểu shoji. Phòng làm việc nhỏ với bàn gỗ nguyên tấm và ghế Wishbone. Phòng tắm kiểu onsen thu nhỏ: bồn tắm gỗ hinoki, gạch sạn đá tự nhiên.</p>`
  },
  {
    title: 'Café Concept Store',
    description: 'Café kết hợp retail 180m² phong cách Industrial Chic.',
    style: 'Industrial Chic', area: '180m²', location: 'Quận 1, TP.HCM', year_completed: 2024, catIdx: 5, photoStart: 45,
    content: `<h2>Café Meets Retail — Trải Nghiệm Đa Giác Quan</h2>
<p>Café Concept Store tại Quận 1 phá vỡ ranh giới giữa quán café và cửa hàng — khách vừa thưởng thức cà phê specialty vừa khám phá các sản phẩm thiết kế Việt Nam. Không gian 180m² chia 60/40 giữa F&B và retail, liền mạch không rào cản.</p>
<p>Trần cao 5m lộ hệ dầm thép và ống kỹ thuật nguyên bản. Quầy bar bê tông đổ tại chỗ với mặt đồng đánh bóng. Kệ trưng bày sản phẩm bằng ống nước công nghiệp và gỗ pallet tái chế. Đèn Edison vintage và cây xanh rũ từ trần.</p>
<p>Khu vực roasting corner: máy rang cà phê Probat được đặt giữa cửa hàng, vừa là công cụ vừa là art installation. Tường gallery xoay vòng trưng bày tác phẩm nghệ sĩ local mỗi tháng.</p>`
  },
  {
    title: 'Penthouse Thảo Điền Green',
    description: 'Penthouse 280m² phong cách Modern Luxury tại Thảo Điền.',
    style: 'Modern Luxury', area: '280m²', location: 'Quận 2, TP.HCM', year_completed: 2025, catIdx: 0, photoStart: 48,
    content: `<h2>Modern Luxury — Sang Trọng Không Phô Trương</h2>
<p>Penthouse Thảo Điền Green 280m² thể hiện triết lý "quiet luxury" — sang trọng ở chất liệu và tỷ lệ, không phải ở sự phô trương. Palette màu monochrome: trắng kem, xám ấm, và bronze nhẹ. Mỗi vật liệu đều premium: đá travertine Ý, gỗ ebony châu Phi, da nappa Đức.</p>
<p>Phòng khách với sofa module Minotti, bàn trà đá xanh Verde Guatemala, và tường feature đá xẻ rãnh. Bếp đảo Bulthaup toàn inox với bồn rửa flush-mount và vòi nước Dornbracht.</p>
<p>Master suite chiếm 60m²: phòng ngủ, walk-in closet với hệ đèn cảm biến, vanity area, và phòng tắm spa với bồn tắm đá nguyên khối và steam shower. Ban công 30m² với bồn soak ngoài trời nhìn ra sông Sài Gòn.</p>`
  },
  {
    title: 'Văn Phòng Luật Green & Partners',
    description: 'Văn phòng luật 400m² phong cách Classic Professional.',
    style: 'Classic Professional', area: '400m²', location: 'Quận 1, TP.HCM', year_completed: 2024, catIdx: 3, photoStart: 51,
    content: `<h2>Không Gian Pháp Lý — Uy Tín Và Chuyên Nghiệp</h2>
<p>Văn phòng luật Green & Partners tại Quận 1 cần truyền tải thông điệp: uy tín, chuyên nghiệp, và đáng tin cậy. Phong cách Classic Professional với tông nâu sẫm, xanh navy, và vàng đồng. Sảnh chính với sàn đá marble trắng Carrara và quầy lễ tân gỗ sồi chạm trổ.</p>
<p>Phòng họp lớn 20 chỗ: bàn boardroom gỗ mahogany, ghế da thật Herman Miller, và hệ thống AV Crestron. Thư viện pháp lý với hệ kệ gỗ từ sàn đến trần, thang trượt đồng thau, và đèn bàn Banker xanh lá cổ điển.</p>
<p>Phòng partner và associate thiết kế riêng biệt nhưng thống nhất ngôn ngữ. Khu pantry kiểu gentlemen's club với ghế Chesterfield và bar whiskey. Phòng khách chờ VIP với sofa nhung, tạp chí cao cấp, và cà phê máy tự động.</p>`
  },
  {
    title: 'Căn Hộ 2PN The Sun Avenue',
    description: 'Căn hộ 75m² phong cách Wabi-Sabi cho cặp đôi trẻ.',
    style: 'Wabi-Sabi', area: '75m²', location: 'Quận 2, TP.HCM', year_completed: 2025, catIdx: 0, photoStart: 54,
    content: `<h2>Wabi-Sabi — Vẻ Đẹp Của Sự Không Hoàn Hảo</h2>
<p>Căn hộ The Sun Avenue 75m² được thiết kế theo triết lý Wabi-Sabi — tìm kiếm vẻ đẹp trong sự không hoàn hảo, trong dấu vết thời gian, trong chất liệu thô mộc. Tường bê tông trần với vệt spatula có chủ đích, sàn gỗ teak tái chế với vân gỗ tự nhiên.</p>
<p>Phòng khách tối giản: sofa linen tự nhiên, bàn trà gỗ nguyên cạnh không xử lý, gối đệm cotton dệt thủ công. Bếp mở với kệ gỗ thay tủ treo, bát đĩa gốm thủ công Bát Tràng bày lộ.</p>
<p>Phòng ngủ: giường futon thấp sàn, đèn mây tre đan, rèm linen tự nhiên lọc ánh sáng mềm. Phòng tắm gạch đất nung terracotta, bồn rửa đá cuội nguyên khối, vòi đồng patina. Mỗi chi tiết đều kể câu chuyện của thời gian.</p>`
  },
  {
    title: 'Nhà Phố Quận 7 Minimalist',
    description: 'Nhà phố 3 tầng 100m² phong cách Minimalist trắng tinh khiết.',
    style: 'Minimalist', area: '100m²', location: 'Quận 7, TP.HCM', year_completed: 2024, catIdx: 2, photoStart: 57,
    content: `<h2>Less Is More — Tối Giản Thuần Khiết</h2>
<p>Nhà phố Quận 7 là bài tập thực hành về chủ nghĩa tối giản triệt để — chỉ giữ lại những gì thật sự cần thiết. Tường trắng tinh khiết, sàn bê tông mài bóng, và ánh sáng tự nhiên là 3 yếu tố chủ đạo. Không có tay nắm cửa lộ, không có kệ trang trí, không có chi tiết thừa.</p>
<p>Phòng khách: 1 sofa, 1 bàn trà, 1 cây xanh. Tivi giấu sau panel trượt khi không dùng. Bếp handle-less toàn trắng, thiết bị âm tường. Phòng ăn: bàn trắng 4 ghế, 1 đèn pendant đơn giản.</p>
<p>Hệ thống lưu trữ ẩn khắp nơi: tủ âm tường dọc cầu thang, gầm giường, và ceiling storage. Phòng tắm wet room toàn kính, fixtures chrome. Sân thượng chỉ có sàn gỗ, 1 ghế ngồi, và bầu trời — đủ rồi.</p>`
  },
];

// ============================================================
// ARTICLES (20) — mỗi article có content + ảnh inline
// ============================================================
const articles = [
  {
    title: '10 Xu Hướng Thiết Kế Nội Thất 2026 Không Thể Bỏ Qua',
    excerpt: 'Từ Japandi đến Biophilic Design — những phong cách định hình năm mới.',
    catIdx: 7, photoStart: 0,
    content: `<h2>Xu Hướng Nội Thất Nổi Bật Năm 2026</h2>
<p>Năm 2026 đánh dấu sự trỗi dậy mạnh mẽ của thiết kế bền vững và gần gũi thiên nhiên. Japandi — sự kết hợp giữa tối giản Nhật Bản và ấm áp Scandinavian — tiếp tục dẫn đầu xu hướng. Biophilic Design không còn là lựa chọn mà trở thành tiêu chuẩn.</p>
<p>Curvilinear Design — đường cong mềm mại thay thế góc vuông cứng nhắc — lan từ nội thất ra kiến trúc. Sofa cong, gương tròn, bàn kidney-shape trở thành must-have. Maximalism có dấu hiệu trở lại: pha trộn pattern, texture, và màu sắc bạo dạn nhưng có kiểm soát.</p>
<p>Vật liệu tái chế và upcycled nâng tầm từ trend thành mainstream. Smart home tích hợp sâu hơn: đèn circadian, rèm tự động, và hệ thống lọc không khí trở thành tiêu chuẩn trong mọi dự án thiết kế nội thất cao cấp năm 2026.</p>`
  },
  {
    title: 'Hướng Dẫn Chọn Gỗ Công Nghiệp Cho Tủ Bếp',
    excerpt: 'So sánh MDF, HDF, Plywood — ưu nhược điểm và giá thành chi tiết.',
    catIdx: 8, photoStart: 3,
    content: `<h2>Gỗ Công Nghiệp — Lựa Chọn Thông Minh Cho Tủ Bếp Hiện Đại</h2>
<p>Gỗ công nghiệp ngày nay đã vượt xa định kiến "rẻ tiền, kém bền". Với công nghệ sản xuất tiên tiến, các loại MDF chống ẩm, HDF siêu cứng, và Plywood marine grade có tuổi thọ 15-20 năm trong điều kiện bếp Việt Nam.</p>
<p>MDF (Medium Density Fiberboard): mặt phẳng tuyệt đối, dễ sơn và phủ PVC/Acrylic. Giá: 350-450K/m². Nhược điểm: trương nở khi ngấm nước. HDF cứng hơn MDF 30%, chịu nước tốt hơn, thích hợp làm cánh tủ. Giá: 500-650K/m².</p>
<p>Plywood: chịu lực tốt nhất, không cong vênh, tuổi thọ cao nhất. Giá: 600-900K/m² tùy loại gỗ mặt. Lựa chọn khuyến nghị: Plywood cho thân tủ + MDF phủ Acrylic cho cánh — sự kết hợp giữa độ bền và thẩm mỹ với chi phí hợp lý.</p>`
  },
  {
    title: '7 Mẹo Trang Trí Phòng Khách Dưới 10 Triệu Đồng',
    excerpt: 'Biến phòng khách nhàm chán thành không gian ấn tượng với ngân sách nhỏ.',
    catIdx: 9, photoStart: 6,
    content: `<h2>Thay Đổi Lớn, Chi Phí Nhỏ</h2>
<p>Bạn không cần hàng trăm triệu để có phòng khách đẹp. Mẹo 1: Sơn lại accent wall — chỉ 1 bức tường với màu đậm hơn hoặc wallpaper điểm nhấn. Chi phí: 500K-2 triệu. Mẹo 2: Thay vỏ gối và thêm throw blanket — cách rẻ nhất để thay đổi bảng màu phòng khách theo mùa.</p>
<p>Mẹo 3: Đặt cây xanh lớn — monstera hoặc fiddle leaf fig trong chậu đẹp ngay góc sofa. Mẹo 4: Gallery wall — in và đóng khung 5-7 bức ảnh gia đình hoặc art print. Mẹo 5: Thay đèn — đèn sàn hoặc đèn bàn với ánh sáng ấm biến đổi mood hoàn toàn.</p>
<p>Mẹo 6: Tấm thảm mới — thảm jute hoặc kilim 2x3m thay đổi toàn bộ cảm giác không gian. Mẹo 7: Kệ floating đơn giản — trưng bày sách và đồ trang trí nhỏ. Chi phí ước tính toàn bộ: 7-10 triệu.</p>`
  },
  {
    title: 'Phong Thủy Phòng Ngủ: 12 Nguyên Tắc Vàng',
    excerpt: 'Bố trí phòng ngủ theo phong thủy để có giấc ngủ ngon và vận khí tốt.',
    catIdx: 10, photoStart: 9,
    content: `<h2>Phong Thủy Phòng Ngủ — Ngủ Ngon, Vận Tốt</h2>
<p>Phòng ngủ là nơi bạn dành 1/3 cuộc đời. Nguyên tắc 1: Giường không đối diện cửa ra vào — vị trí "quan tài" trong phong thủy. Đầu giường tựa tường vững chắc, không đặt dưới dầm ngang.</p>
<p>Nguyên tắc 2: Gương không phản chiếu giường ngủ — gây mất ngủ và bất an. Nguyên tắc 3: Đèn ngủ đặt thành cặp đối xứng hai bên. Nguyên tắc 4: Không đặt cây xanh lớn trong phòng ngủ — ban đêm cây hấp thụ oxy.</p>
<p>Nguyên tắc 5: Màu sắc nhẹ nhàng — trắng kem, be, hồng phấn, xanh pastel. Tránh đỏ, cam, vàng chói. Nguyên tắc 6-12: Hướng giường theo tuổi, không đặt bể cá, tránh góc nhọn hướng về giường, giữ gọn gàng dưới gầm giường, cửa sổ phải có rèm, tivi nên che khi ngủ.</p>`
  },
  {
    title: 'Behind The Scenes: Dự Án Penthouse Vinhomes',
    excerpt: 'Hành trình 6 tháng từ concept đến bàn giao — thử thách và giải pháp.',
    catIdx: 11, photoStart: 12,
    content: `<h2>6 Tháng — Từ Ý Tưởng Đến Hiện Thực</h2>
<p>Dự án penthouse Vinhomes Central Park là một trong những dự án phức tạp nhất năm 2025. Bài viết này chia sẻ hành trình 6 tháng từ buổi brief đầu tiên đến ngày bàn giao — với tất cả thử thách và giải pháp sáng tạo.</p>
<p>Tháng 1-2: Concept và thiết kế. Khách hàng muốn "sang trọng nhưng không phô trương" — brief mơ hồ nhưng đầy thách thức. Đội thiết kế đã tạo 3 moodboard khác nhau trước khi khách chọn hướng Contemporary Luxury.</p>
<p>Tháng 3-4: Sản xuất nội thất. Bàn ăn đá marble nguyên khối nặng 300kg cần cần cẩu đặc biệt. Tháng 5-6: Lắp đặt và hoàn thiện — 15 thợ làm việc liên tục 45 ngày. Kết quả: không gian sống vượt kỳ vọng khách hàng, trở thành dự án portfolio hàng đầu.</p>`
  },
  {
    title: 'Tủ Bếp Acrylic vs Laminate: Đâu Là Lựa Chọn Tốt Hơn?',
    excerpt: 'Phân tích chi tiết 2 vật liệu phổ biến nhất cho cánh tủ bếp.',
    catIdx: 12, photoStart: 15,
    content: `<h2>Acrylic vs Laminate — Cuộc Chiến Vật Liệu Tủ Bếp</h2>
<p>Acrylic: bề mặt bóng gương, sang trọng, phản chiếu ánh sáng tạo cảm giác rộng rãi. Giá: 1.8-3 triệu/m² cánh. Ưu điểm: không thấm nước, dễ lau chùi, màu sắc đa dạng, độ bền 15-20 năm.</p>
<p>Laminate: bề mặt nhám hoặc vân gỗ tự nhiên, giá thành phải chăng hơn. Giá: 800K-1.5 triệu/m² cánh. Ưu điểm: chống trầy xước tốt hơn Acrylic, đa dạng vân gỗ, chịu nhiệt đến 180°C. Nhược điểm: không thể sửa chữa nếu bong tróc.</p>
<p>Kết luận: Acrylic cho bếp hiện đại, sang trọng — đặc biệt bếp ít nấu nướng nặng. Laminate cho bếp ấm cúng, gia đình nấu hàng ngày, ngân sách vừa phải. Có thể kết hợp: cánh tủ trên Acrylic, cánh tủ dưới Laminate chống trầy.</p>`
  },
  {
    title: 'Thiết Kế Bếp Chữ L, Chữ U, Song Song — Chọn Layout Nào?',
    excerpt: 'Hướng dẫn chọn layout bếp phù hợp với diện tích và thói quen nấu nướng.',
    catIdx: 12, photoStart: 18,
    content: `<h2>Layout Bếp — Quyết Định Quan Trọng Nhất</h2>
<p>Bếp chữ L: phổ biến nhất, phù hợp diện tích 8-15m². Hai cạnh vuông góc tạo tam giác hoạt động tự nhiên (bồn rửa - bếp nấu - tủ lạnh). Có thể thêm đảo bếp nếu không gian cho phép.</p>
<p>Bếp chữ U: lý tưởng cho không gian 12-20m², bao quanh 3 mặt, tối đa diện tích lưu trữ. Nhược điểm: có thể cảm thấy chật nếu diện tích dưới 12m².</p>
<p>Bếp song song (galley): hai dãy tủ đối diện, phù hợp nhà phố hẹp rộng 2-3m. Hiệu quả cao nhất cho người nấu ăn chuyên nghiệp. Bếp đảo: xu hướng hiện đại, cần tối thiểu 15m², đảo kết hợp bếp nấu hoặc bồn rửa và bar ăn sáng.</p>`
  },
  {
    title: 'Cách Chọn Màu Sơn Tường Phù Hợp Với Không Gian',
    excerpt: 'Hướng dẫn phối màu sơn cho từng phòng trong nhà.',
    catIdx: 9, photoStart: 21,
    content: `<h2>Màu Sắc Thay Đổi Không Gian</h2>
<p>Màu sơn tường là yếu tố đơn giản nhất nhưng tác động lớn nhất đến cảm nhận không gian. Phòng khách: nên chọn tông trung tính ấm — beige, greige, hoặc trắng kem. Tránh trắng tinh khiết vì tạo cảm giác lạnh lẽo và clinical.</p>
<p>Phòng ngủ: tông xanh dương nhạt, xanh xám, hoặc lavender giúp thư giãn và ngủ ngon. Phòng trẻ em: có thể dùng màu tươi sáng nhưng nên giới hạn ở accent wall. Bếp: trắng hoặc xám nhạt phản chiếu ánh sáng, kết hợp backsplash màu làm điểm nhấn.</p>
<p>Mẹo chuyên gia: luôn thử sơn mẫu trên tường 1m² và quan sát dưới cả ánh sáng tự nhiên lẫn đèn điện trước khi quyết định. Màu sơn trên bảng mẫu nhỏ luôn khác với khi sơn lên tường diện tích lớn — thường sẽ đậm hơn 1-2 shade.</p>`
  },
  {
    title: 'Nội Thất Thông Minh: Giải Pháp Cho Căn Hộ Nhỏ',
    excerpt: 'Các sản phẩm nội thất đa năng giúp tối ưu không gian sống.',
    catIdx: 7, photoStart: 24,
    content: `<h2>Smart Furniture — Tối Ưu Mỗi Mét Vuông</h2>
<p>Với giá nhà ngày càng cao, căn hộ ngày càng nhỏ, nội thất thông minh trở thành giải pháp tối ưu. Giường Murphy: gấp lên tường khi không dùng, giải phóng 6-8m² sàn cho hoạt động ban ngày. Giá: 15-35 triệu tùy kích thước và cơ cấu.</p>
<p>Bàn ăn gắn tường gấp: từ bàn 4 người thu gọn thành kệ trang trí dày 10cm. Ghế xếp treo tường: 4 ghế chỉ chiếm 0.5m² khi gấp. Sofa giường: ban ngày là sofa, ban đêm mở ra thành giường đôi cho khách.</p>
<p>Tủ quần áo rotating: trục xoay cho phép tiếp cận cả 2 mặt trong không gian hẹp. Bàn làm việc pull-out: kéo ra từ kệ tivi khi work-from-home, đẩy lại khi giải trí. Modular storage: hệ kệ module ghép theo nhu cầu, dễ thay đổi khi chuyển nhà.</p>`
  },
  {
    title: 'Thiết Kế Phòng Tắm Hiện Đại: Xu Hướng 2026',
    excerpt: 'Từ walk-in shower đến bathtub freestanding — cập nhật xu hướng phòng tắm.',
    catIdx: 7, photoStart: 27,
    content: `<h2>Phòng Tắm — Spa Tại Gia</h2>
<p>Phòng tắm 2026 không chỉ là nơi vệ sinh — nó là spa thu nhỏ tại gia. Walk-in shower không viền: kính cường lực 10mm, sàn dốc thoát nước, vòi rain shower 30cm — trải nghiệm tắm mưa mỗi ngày. Bồn tắm freestanding trở lại: vị trí trung tâm hoặc cạnh cửa sổ.</p>
<p>Vanity floating (treo tường): tạo cảm giác rộng rãi, dễ vệ sinh sàn bên dưới. Gương LED thông minh: đèn viền, chống sương mù, có loa bluetooth. Gạch: terrazzo handmade và zellige thủ công thay thế gạch metro đơn điệu.</p>
<p>Vòi nước matte black và brushed gold thay chrome truyền thống. Bồn cầu thông minh: nắp tự động, xịt nước ấm, sấy khô — xu hướng từ Nhật Bản. Sàn sưởi ấm cho phòng tắm biệt thự tại Đà Lạt và Sapa.</p>`
  },
  {
    title: 'Hướng Dẫn Chọn Đèn Trang Trí Cho Từng Phòng',
    excerpt: 'Cách chọn và bố trí đèn để tạo bầu không khí hoàn hảo.',
    catIdx: 9, photoStart: 30,
    content: `<h2>Ánh Sáng Tạo Nên Không Gian</h2>
<p>Đèn không chỉ chiếu sáng — đèn tạo bầu không khí, định hình không gian, và ảnh hưởng tâm trạng. 3 lớp ánh sáng cơ bản: Ambient (chiếu sáng chung), Task (chiếu sáng tập trung), Accent (điểm nhấn). Mỗi phòng cần ít nhất 2 trong 3 lớp.</p>
<p>Phòng khách: đèn trần cho ambient + đèn đứng/bàn cho task (đọc sách) + đèn strip cho accent (kệ tivi, trần giật cấp). Phòng ăn: đèn thả cluster hoặc chandelier treo cách mặt bàn 70-80cm. Bếp: đèn LED âm tủ treo chiếu sáng mặt bàn bếp + đèn pendant trên đảo bếp.</p>
<p>Phòng ngủ: tuyệt đối tránh đèn trần trực tiếp — dùng đèn wall sconce 2 bên đầu giường + đèn gián tiếp sau headboard. Nhiệt độ màu: 2700K (ấm) cho phòng ngủ/khách, 4000K (trung tính) cho bếp/phòng tắm.</p>`
  },
  {
    title: 'Phong Thủy Bàn Làm Việc: Bố Trí Để Thăng Tiến',
    excerpt: 'Cách sắp xếp bàn làm việc theo phong thủy giúp tập trung và thăng tiến.',
    catIdx: 10, photoStart: 33,
    content: `<h2>Bàn Làm Việc — Phong Thủy Cho Sự Nghiệp</h2>
<p>Vị trí bàn làm việc ảnh hưởng trực tiếp đến năng suất và sự nghiệp theo phong thủy. Nguyên tắc quan trọng nhất: ngồi nhìn về phía cửa (vị trí "command"), lưng tựa tường vững chắc. Tuyệt đối không ngồi quay lưng ra cửa hoặc ngồi đối diện nhà vệ sinh.</p>
<p>Hướng bàn theo tuổi: Tuổi Kim hướng Tây/Tây Bắc, tuổi Mộc hướng Đông/Đông Nam, tuổi Thủy hướng Bắc, tuổi Hỏa hướng Nam, tuổi Thổ hướng Đông Bắc/Tây Nam. Trên bàn nên có: cây xanh nhỏ (phía Đông), đèn bàn (phía Nam), vật phẩm kim loại (phía Tây).</p>
<p>Tránh: bàn đặt dưới dầm ngang (áp lực), giữa hai cửa đối nhau (gió lùa), hoặc sát cửa sổ lớn (năng lượng rò rỉ). Dọn dẹp bàn mỗi tối — bàn sạch = đầu óc sạch = quyết định sáng suốt.</p>`
  },
  {
    title: 'Đá Tự Nhiên vs Đá Nhân Tạo: Ưu Nhược Điểm',
    excerpt: 'So sánh chi tiết các loại đá dùng cho mặt bếp, sàn nhà và phòng tắm.',
    catIdx: 8, photoStart: 36,
    content: `<h2>Đá — Vật Liệu Muôn Thuở Trong Nội Thất</h2>
<p>Đá tự nhiên (marble, granite, quartzite): vẻ đẹp độc nhất vô nhị, mỗi tấm đá là một tác phẩm của thiên nhiên. Marble: sang trọng, vân đẹp, nhưng xốp — dễ bám vết, cần seal định kỳ. Giá: 3-15 triệu/m² tùy loại. Granite: cứng, bền, kháng vết tốt. Giá: 2-8 triệu/m².</p>
<p>Đá nhân tạo (quartz, sintered stone, solid surface): đồng đều, ít bảo trì, đa dạng màu sắc. Quartz: 93% thạch anh + 7% resin, cứng, kháng vết, không cần seal. Giá: 2-6 triệu/m². Sintered stone (Dekton, Neolith): siêu cứng, chịu nhiệt, UV, kháng hóa chất. Giá: 4-10 triệu/m².</p>
<p>Khuyến nghị: Marble cho phòng tắm và tường feature (ít va chạm). Granite hoặc Quartz cho mặt bếp (chịu lực, kháng vết). Sintered stone cho outdoor và mặt bếp cao cấp. Solid surface cho bồn rửa liền mặt bàn (seamless).</p>`
  },
  {
    title: 'Câu Chuyện: Cải Tạo Nhà Cũ 30 Năm Thành Không Gian Sống Mới',
    excerpt: 'Hành trình cải tạo nhà phố cũ tại Quận 3 — từ xuống cấp thành tuyệt đẹp.',
    catIdx: 11, photoStart: 39,
    content: `<h2>30 Năm Tuổi — Một Cuộc Đời Mới</h2>
<p>Nhà phố 3 tầng tại Quận 3, xây năm 1995, sau 30 năm đã xuống cấp nghiêm trọng: trần nứt, sàn gạch bong, hệ điện nước cũ kỹ. Gia chủ muốn giữ lại "hồn" ngôi nhà nhưng nâng cấp toàn bộ tiện nghi cho cuộc sống hiện đại.</p>
<p>Phase 1: Tháo dỡ có chọn lọc — giữ lại tường gạch nguyên bản, cửa gỗ cổ, và sàn gạch hoa vintage tầng 1. Phase 2: Gia cố kết cấu — thay toàn bộ hệ điện nước, chống thấm mái và tường. Phase 3: Nội thất mới — phong cách Vintage Modern, kết hợp đồ cũ restore với nội thất đương đại.</p>
<p>Kết quả: tường gạch trần patina kết hợp nội thất hiện đại. Sàn gạch hoa cũ được giữ nguyên ở tầng 1, tầng 2-3 lát gỗ SPC mới. Cầu thang sắt mỹ thuật thay bê tông cũ, giải phóng thêm 3m² sàn. Tổng chi phí cải tạo: 1.2 tỷ — tiết kiệm 60% so với xây mới.</p>`
  },
  {
    title: 'Thiết Kế Xanh: Vật Liệu Bền Vững Cho Nội Thất',
    excerpt: 'Hướng dẫn chọn vật liệu eco-friendly không hy sinh thẩm mỹ.',
    catIdx: 13, photoStart: 42,
    content: `<h2>Nội Thất Xanh — Đẹp Mà Không Hại Môi Trường</h2>
<p>Thiết kế bền vững không có nghĩa là hy sinh thẩm mỹ. Gỗ tre (bamboo): mọc lại trong 3-5 năm (vs gỗ rừng 30-50 năm), cứng hơn sồi, đa dạng finish. Ứng dụng: sàn, ốp tường, nội thất. Gỗ tái chế (reclaimed wood): vẻ đẹp patina tự nhiên, mỗi tấm gỗ mang theo câu chuyện.</p>
<p>Cork: thu hoạch từ vỏ cây sồi cork không cần đốn cây, cách âm, cách nhiệt, đàn hồi. Ứng dụng: sàn, tường accent, nội thất. Đá tái chế (recycled stone): terrazzo từ đá vụn, kính vỡ, và xi măng — mỗi tấm là tác phẩm upcycle.</p>
<p>Sơn sinh học (bio-paint): từ protein sữa, khoáng chất tự nhiên, VOC gần bằng 0. Vải organic: linen, hemp, cotton organic cho rèm, sofa, gối. Chứng nhận cần tìm: FSC (gỗ), GOTS (vải), Greenguard (sơn và vật liệu).</p>`
  },
  {
    title: 'Tủ Quần Áo Walk-In Closet: Hướng Dẫn Thiết Kế A-Z',
    excerpt: 'Từ layout đến phụ kiện — mọi thứ bạn cần biết để có walk-in closet hoàn hảo.',
    catIdx: 8, photoStart: 45,
    content: `<h2>Walk-In Closet — Giấc Mơ Có Thật</h2>
<p>Walk-in closet không chỉ dành cho biệt thự — căn hộ từ 80m² có thể biến 1 phòng nhỏ 6-8m² thành closet đáng mơ ước. Layout cơ bản: chữ L (6m²+), chữ U (8m²+), song song (chiều rộng tối thiểu 1.8m). Chiều cao treo: 1.7m cho áo dài, 1.0m cho áo ngắn (treo 2 tầng).</p>
<p>Phụ kiện must-have: thanh treo pull-down (với tủ cao 2.4m+), ngăn kéo velvet lót cho trang sức, kệ nghiêng cho giày, gương toàn thân có đèn LED, và ghế stool hoặc ottoman ở giữa. Đèn: LED strip tự động bật khi mở cửa, CRI 90+ để nhìn đúng màu quần áo.</p>
<p>Vật liệu khuyến nghị: MDF phủ Melamine cho thân tủ (chống ẩm, giá tốt), gỗ veneer hoặc sơn PU cho mặt ngoài (nếu không có cửa). Ngân sách: 30-50 triệu cho closet 8m² cơ bản, 80-150 triệu cho premium với phụ kiện Häfele/Blum nhập khẩu.</p>`
  },
  {
    title: 'Phong Cách Wabi-Sabi: Vẻ Đẹp Không Hoàn Hảo',
    excerpt: 'Triết lý thiết kế Nhật Bản đang chinh phục thế giới nội thất.',
    catIdx: 7, photoStart: 48,
    content: `<h2>Wabi-Sabi — Khi Khiếm Khuyết Trở Thành Nghệ Thuật</h2>
<p>Wabi-Sabi là triết lý thẩm mỹ Nhật Bản tôn vinh sự không hoàn hảo, sự vô thường, và sự chưa hoàn thiện. Trong nội thất, Wabi-Sabi thể hiện qua vật liệu thô mộc, dấu vết thời gian, và sự tối giản không gượng ép.</p>
<p>Palette màu: trắng kem, beige, nâu đất, xám ấm — không có màu nào "hoàn hảo" hay đồng đều. Vật liệu: bê tông trần với vệt form, gỗ với nốt sẹo và vân không đều, gốm handmade với dáng hơi méo, vải linen nhăn tự nhiên.</p>
<p>Cách áp dụng: chọn đồ handmade thay đồ công nghiệp, để vật liệu lộ bản chất thay vì sơn phủ, chấp nhận patina — vết xước trên gỗ, xỉn màu trên đồng — là vẻ đẹp, không phải hư hỏng. Tối giản nhưng ấm áp: mỗi món đồ đều có ý nghĩa và câu chuyện.</p>`
  },
  {
    title: 'Cách Bảo Quản Nội Thất Gỗ Trong Khí Hậu Việt Nam',
    excerpt: 'Mẹo chống ẩm, chống mối mọt cho đồ gỗ tại vùng nhiệt đới.',
    catIdx: 8, photoStart: 51,
    content: `<h2>Gỗ Và Khí Hậu Nhiệt Đới — Thách Thức Và Giải Pháp</h2>
<p>Khí hậu Việt Nam với độ ẩm trung bình 80% và nhiệt độ cao là kẻ thù số 1 của nội thất gỗ. Vấn đề phổ biến: cong vênh, nứt tách, mốc, và mối mọt. Giải pháp 1: Kiểm soát độ ẩm — máy hút ẩm giữ 55-65% là vùng an toàn cho gỗ.</p>
<p>Giải pháp 2: Phủ bảo vệ đúng cách. Gỗ tự nhiên: dầu tung (tung oil) hoặc sáp ong thẩm thấu vào thớ gỗ, bảo vệ từ bên trong. Gỗ công nghiệp: lớp phủ PVC, Melamine, hoặc HPL đã kháng ẩm tốt, chỉ cần tránh ngâm nước trực tiếp.</p>
<p>Giải pháp 3: Chống mối mọt. Xử lý hóa chất chống mối trước khi lắp đặt (đặc biệt gỗ sàn và tủ bếp). Kiểm tra định kỳ 6 tháng/lần tại các điểm tiếp giáp tường-sàn. Dấu hiệu mối: bột gỗ mịn dưới chân nội thất, lỗ nhỏ 1-2mm trên bề mặt gỗ.</p>`
  },
  {
    title: 'Năng Lượng Mặt Trời Trong Thiết Kế Nội Thất',
    excerpt: 'Tích hợp solar vào nội thất — từ đèn đến rèm phát điện.',
    catIdx: 13, photoStart: 54,
    content: `<h2>Solar Meets Interior Design</h2>
<p>Năng lượng mặt trời không chỉ dành cho mái nhà — nhiều giải pháp solar đã có thể tích hợp vào thiết kế nội thất và ngoại thất. Đèn sân vườn solar: lắp đặt không cần dây điện, tự sạc ban ngày và chiếu sáng 8-12 giờ ban đêm. Giá: 200-800K/bộ.</p>
<p>Đèn ban công solar: clamp-on hoặc railing mount, không cần khoan tường. Quạt solar: quạt thông gió tích hợp pin solar cho nhà kho, gác mái, nhà vệ sinh — giảm ẩm tự nhiên không tốn điện.</p>
<p>Rèm solar: tấm pin mỏng tích hợp vào rèm cửa sổ, vừa che nắng vừa phát điện. Công nghệ BIPV (Building Integrated Photovoltaics) đang phát triển nhanh — kính cửa sổ bán trong suốt có thể phát điện, hứa hẹn nội thất tự cung cấp năng lượng trong tương lai gần.</p>`
  },
];


// ============================================================
// CLEANUP: Xóa data cũ trước khi seed mới
// ============================================================
async function cleanup(headers) {
  console.log('🧹 Cleaning up old data...\n');

  // 1. Delete all projects
  console.log('  Deleting projects...');
  let page = 1;
  let deleted = 0;
  while (true) {
    const res = await fetch(`${BASE}/projects/admin/list?page=${page}&limit=50`, { headers });
    const data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) break;
    for (const item of data.data) {
      await fetch(`${BASE}/projects/${item.id}`, { method: 'DELETE', headers });
      deleted++;
    }
    if (data.data.length < 50) break;
    page++;
  }
  console.log(`  ✅ Deleted ${deleted} projects`);

  // 2. Delete all articles
  console.log('  Deleting articles...');
  page = 1; deleted = 0;
  while (true) {
    const res = await fetch(`${BASE}/articles/admin/list?page=${page}&limit=50`, { headers });
    const data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) break;
    for (const item of data.data) {
      await fetch(`${BASE}/articles/${item.id}`, { method: 'DELETE', headers });
      deleted++;
    }
    if (data.data.length < 50) break;
    page++;
  }
  console.log(`  ✅ Deleted ${deleted} articles`);

  // 3. Delete all categories
  console.log('  Deleting categories...');
  deleted = 0;
  for (const type of ['project', 'article', 'product']) {
    const res = await fetch(`${BASE}/categories?type=${type}&limit=100`, { headers });
    const data = await res.json();
    if (data.success && data.data) {
      for (const item of data.data) {
        await fetch(`${BASE}/categories/${item.id}`, { method: 'DELETE', headers });
        deleted++;
      }
    }
  }
  console.log(`  ✅ Deleted ${deleted} categories`);

  console.log('');
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🚀 VietNet Seed V2 — Full Demo Data');
  console.log('====================================\n');

  // --- STEP 1: Login ---
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
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };
  console.log('✅ Logged in\n');

  // --- STEP 1.5: Cleanup old data ---
  await cleanup(headers);

  // --- STEP 2: Upload ảnh pool ---
  // Upload 60 ảnh Unsplash → lưu media IDs
  // Upload 30 ảnh (đủ cho cover + gallery, content dùng URL trực tiếp)
  console.log('📷 Uploading image pool (30 images)...');
  console.log('   (Batch 2 concurrent, ~15 batches)');
  const allPhotoIndices = Array.from({ length: 30 }, (_, i) => i);
  const mediaIds = await uploadBatch(allPhotoIndices, TOKEN, 'Pool');
  console.log(`✅ Uploaded ${mediaIds.length} images\n`);

  // --- STEP 3: Create Categories ---
  console.log('📁 Creating categories...');
  const categoryIds = {};
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const res = await fetch(`${BASE}/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...cat, display_order: i + 1 }),
    });
    const data = await res.json();
    if (data.success) {
      categoryIds[i] = data.data.id;
      console.log(`  ✅ [${i + 1}/${categories.length}] ${cat.name} (${cat.type})`);
    } else {
      console.log(`  ⚠️ [${i + 1}] ${cat.name}: ${data.message || JSON.stringify(data)}`);
    }
  }

  // --- STEP 4: Create Projects ---
  console.log('\n🏗️ Creating projects (with cover + gallery)...');
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const coverIdx = mediaIds.length > 0 ? (p.photoStart % mediaIds.length) : -1;
    const galleryIdxes = mediaIds.length > 0
      ? Array.from({ length: 6 }, (_, j) => (p.photoStart + 1 + j) % mediaIds.length)
      : [];

    const fullContent = makeContentWithImages(p.content, p.photoStart, 10);
    const body = {
      title: p.title,
      description: p.description,
      content: fullContent,
      category_id: categoryIds[p.catIdx] || null,
      cover_image_id: coverIdx >= 0 ? mediaIds[coverIdx] : undefined,
      gallery_ids: galleryIdxes.length > 0 ? galleryIdxes.map(idx => mediaIds[idx]) : undefined,
      style: p.style,
      area: p.area,
      location: p.location,
      year_completed: p.year_completed,
      status: 'published',
      is_featured: i < 6,
      display_order: i + 1,
      ref_code: `PRJ${String(i + 1).padStart(3, '0')}`,
    };
    const res = await fetch(`${BASE}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`  ✅ [${i + 1}/${projects.length}] ${p.title} (cover: ${mediaIds[coverIdx].slice(-6)}, gallery: ${galleryIdxes.length})`);
    } else {
      console.log(`  ❌ [${i + 1}] ${p.title}: ${data.message || JSON.stringify(data)}`);
    }
  }

  // --- STEP 5: Create Articles ---
  console.log('\n📰 Creating articles (with cover)...');
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const coverIdx = mediaIds.length > 0 ? ((a.photoStart + 20) % mediaIds.length) : -1;
    const fullContent = makeContentWithImages(a.content, a.photoStart + 30, 6);
    const body = {
      title: a.title,
      excerpt: a.excerpt,
      content: fullContent,
      category_id: categoryIds[a.catIdx] || null,
      cover_image_id: coverIdx >= 0 ? mediaIds[coverIdx] : undefined,
      status: 'published',
      is_featured: i < 5,
      display_order: i + 1,
    };
    const res = await fetch(`${BASE}/articles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`  ✅ [${i + 1}/${articles.length}] ${a.title}`);
    } else {
      console.log(`  ❌ [${i + 1}] ${a.title}: ${data.message || JSON.stringify(data)}`);
    }
  }

  // --- Summary ---
  console.log('\n====================================');
  console.log('🎉 Seed V2 Complete!');
  console.log(`  📷 Images: ${mediaIds.length}`);
  console.log(`  📁 Categories: ${Object.keys(categoryIds).length}/${categories.length}`);
  console.log(`  🏗️ Projects: ${projects.length} (with cover + gallery + inline images)`);
  console.log(`  📰 Articles: ${articles.length} (with cover + inline images)`);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
