/**
 * Generate SQL to seed 20 products with 10 images each.
 * Run: node src/scripts/gen-products-sql.js > /tmp/seed-products.sql
 */

const ADMIN_ID = '01KN11WN8JCFERC81256P0VSAJ'

const CAT_IDS = {
  'tu-bep-go': '01KN40PA6G4DADAFVYY54PFWFJ',
  'tu-bep-acrylic': '01KN40PA705VYEES0Z45MNSN2K',
  'tu-bep-melamine': '01KN40PA7D7XS9C8FFBZ7Y8Z94',
  'ban-lam-viec': '01KNMFRCBJ2P5TK4R21PMR3B1R',
  'tu-quan-ao': '01KNMFRCBJB6GQK316Z5R80MS0',
  'giuong-ngu': '01KNMFRCBJG9F7JBMDCM7347KY',
  'ke-tv-trang-tri': '01KNMFRCBJG9GYJPS72QZ1B2V8',
}

// ULID generator (simplified - timestamp + random)
function ulid() {
  const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  const t = Date.now()
  let id = ''
  // 10 chars for timestamp
  let ts = t
  for (let i = 9; i >= 0; i--) {
    id = ENCODING[ts % 32] + id
    ts = Math.floor(ts / 32)
  }
  // 16 chars random
  for (let i = 0; i < 16; i++) {
    id += ENCODING[Math.floor(Math.random() * 32)]
  }
  return id
}

// Unsplash photo IDs
const KITCHEN_PHOTOS = [
  '1556909114-f6e7ad7d3136', '1600210492486-724fe5c67fb3',
  '1600573472592-401b489a3cdc', '1484154218962-a197022b5858',
  '1600210491369-e753d80a41f3', '1596900779744-2bdc4a90509a',
  '1600047509807-ba8f99d2cdde', '1600607687644-aac5c9cced2d',
  '1600210492493-b930ee81dbf5', '1600210491892-bc01cff441e9',
  '1556185781-2a4a52a29b18', '1600585154340-be6161a56a0c',
  '1507089947017-82a3e86e0df3', '1560185127-6ed189bf02f4',
  '1600566753190-17f0baa2a6c3', '1600047508788-786f3865b4b7',
  '1583847268964-b28dc8f51f92', '1556761175-b413da4baf72',
  '1565182999561-18d7dc61c393', '1600566753086-00f18fb6b03d',
  '1555041469-a586c61ea9bc', '1571624436279-b272aff752b5',
  '1600563438749-a0e77bd2afab', '1594026112284-02bb6f3352fe',
  '1560184611-c0e94e4cc498',
]

const FURNITURE_PHOTOS = [
  '1502672260266-1c1ef2d93688', '1618221195710-dd6b41faaea6',
  '1560448204771-d60f0e1a26c0', '1616486338812-3dadae4b4ace',
  '1600607687939-ce8a6c25118c', '1615529182904-14819c35db37',
  '1631679706909-1844bbd07221', '1586023492125-27b2012f8222',
  '1600566752355-35792bedcfea', '1598928506311-aab7ecc834e0',
  '1556909212-d5b604d0c90d', '1560185009-5bf9f2ce0d03',
  '1560185008-b033106af763', '1600585153490-76fb20a32601',
  '1615874694520-41b8fbb0d1ba', '1618219908412-a29a1bb7b86c',
  '1556909078-e5b2e5d0d342', '1560185007-5f0bb1866cab',
  '1617103996702-96ff29b1c467', '1597218868981-1b68e15f0065',
  '1560185008-a33f5c7a8e09', '1615873968403-f9e601145c1d',
  '1618219740975-d40978bb7378', '1513694203232-719a280e022f',
  '1560185007-cde436f6670d', '1505693416388-ac5ce068fe85',
  '1560440021-5f092f8aa458', '1536437075651-01d7a4e4a3b7',
  '1560184897-ae75f418493e', '1574739782594-db4ead022697',
]

const ALL_PHOTOS = [...KITCHEN_PHOTOS, ...FURNITURE_PHOTOS]

function photoUrl(idx, w = 1200, h = 800) {
  const id = ALL_PHOTOS[idx % ALL_PHOTOS.length]
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`
}
function thumbUrl(idx) { return photoUrl(idx, 300, 300) }
function previewUrl(idx) { return photoUrl(idx, 800, 600) }

const PRODUCTS = [
  { name: 'Modern Walnut L-Shape Kitchen', slug: 'modern-walnut-l-shape-kitchen', desc: 'Tủ bếp chữ L gỗ walnut nhập khẩu, thiết kế hiện đại với tay nắm ẩn và bản lề giảm chấn Blum. Mặt bếp đá thạch anh Caesarstone trắng.', category: 'tu-bep-go', material: 'go-tu-nhien', finish: 'Matte Walnut', price: '85,000,000 - 120,000,000 VND', isNew: 1, isFeatured: 1, photoStart: 0 },
  { name: 'Classic Oak Island Kitchen', slug: 'classic-oak-island-kitchen', desc: 'Bếp đảo gỗ sồi Mỹ với quầy bar tích hợp, phù hợp không gian mở. Hệ tủ trên soft-close, ngăn kéo ray giảm chấn Hettich.', category: 'tu-bep-go', material: 'go-tu-nhien', finish: 'Semi-Matte Oak', price: '95,000,000 - 150,000,000 VND', isNew: 0, isFeatured: 1, photoStart: 2 },
  { name: 'Japanese Hinoki U-Shape', slug: 'japanese-hinoki-u-shape', desc: 'Tủ bếp chữ U phong cách Nhật Bản với gỗ Hinoki tự nhiên. Kết hợp kệ mở và tủ kín, tối ưu lưu trữ cho không gian bếp vừa và nhỏ.', category: 'tu-bep-go', material: 'go-tu-nhien', finish: 'Natural Hinoki', price: '75,000,000 - 110,000,000 VND', isNew: 1, isFeatured: 0, photoStart: 4 },
  { name: 'Scandinavian Birch Galley', slug: 'scandinavian-birch-galley', desc: 'Bếp dạng hành lang phong cách Bắc Âu, gỗ bạch dương sáng màu kết hợp tông trắng. Tối giản, tận dụng tối đa không gian hẹp.', category: 'tu-bep-go', material: 'go-cong-nghiep', finish: 'Light Birch', price: '45,000,000 - 70,000,000 VND', isNew: 0, isFeatured: 0, photoStart: 6 },
  { name: 'Crystal White High-Gloss Kitchen', slug: 'crystal-white-high-gloss-kitchen', desc: 'Tủ bếp Acrylic trắng bóng gương, phản chiếu ánh sáng tạo cảm giác rộng rãi. Cánh tủ không viền edgeless sắc nét.', category: 'tu-bep-acrylic', material: 'acrylic', finish: 'High Gloss White', price: '65,000,000 - 95,000,000 VND', isNew: 1, isFeatured: 1, photoStart: 8 },
  { name: 'Midnight Black Acrylic Suite', slug: 'midnight-black-acrylic-suite', desc: 'Bộ tủ bếp Acrylic đen bóng cao cấp, tạo điểm nhấn mạnh mẽ cho không gian bếp hiện đại. Kết hợp đèn LED dải dưới tủ treo.', category: 'tu-bep-acrylic', material: 'acrylic', finish: 'High Gloss Black', price: '70,000,000 - 100,000,000 VND', isNew: 0, isFeatured: 0, photoStart: 10 },
  { name: 'Champagne Gold Acrylic Kitchen', slug: 'champagne-gold-acrylic-kitchen', desc: 'Tủ bếp Acrylic tông vàng champagne sang trọng, bề mặt chống bám vân tay. Phụ kiện inox vàng đồng bộ.', category: 'tu-bep-acrylic', material: 'acrylic', finish: 'Champagne Gold Gloss', price: '80,000,000 - 115,000,000 VND', isNew: 1, isFeatured: 0, photoStart: 12 },
  { name: 'Urban Grey Melamine Kitchen', slug: 'urban-grey-melamine-kitchen', desc: 'Tủ bếp Melamine xám đô thị, bề mặt vân gỗ công nghiệp. Tối ưu chi phí mà vẫn đảm bảo thẩm mỹ và độ bền.', category: 'tu-bep-melamine', material: 'melamine', finish: 'Textured Grey', price: '25,000,000 - 40,000,000 VND', isNew: 0, isFeatured: 0, photoStart: 14 },
  { name: 'Warm Teak Melamine Suite', slug: 'warm-teak-melamine-suite', desc: 'Hệ tủ bếp Melamine vân teak ấm áp, phù hợp phong cách tropical. Chống ẩm chuẩn E1, an toàn cho gia đình.', category: 'tu-bep-melamine', material: 'melamine', finish: 'Warm Teak', price: '28,000,000 - 45,000,000 VND', isNew: 1, isFeatured: 0, photoStart: 16 },
  { name: 'Snow White Melamine Compact', slug: 'snow-white-melamine-compact', desc: 'Tủ bếp Melamine trắng tuyết compact cho căn hộ studio. Tích hợp giá đa năng, kệ gia vị xoay 360 độ.', category: 'tu-bep-melamine', material: 'melamine', finish: 'Matte White', price: '18,000,000 - 30,000,000 VND', isNew: 0, isFeatured: 1, photoStart: 18 },
  { name: 'Walk-in Closet Premium', slug: 'walk-in-closet-premium', desc: 'Tủ quần áo walk-in cao cấp với đèn LED cảm biến, gương toàn thân và ngăn kéo trang sức khóa điện tử.', category: 'tu-quan-ao', material: 'go-cong-nghiep', finish: 'White Oak Veneer', price: '55,000,000 - 85,000,000 VND', isNew: 1, isFeatured: 1, photoStart: 20 },
  { name: 'Sliding Door Wardrobe Modern', slug: 'sliding-door-wardrobe-modern', desc: 'Tủ quần áo cửa trượt ray nhôm êm ái, gương ngoài tích hợp. Phân vùng treo áo dài, áo ngắn, kệ giày.', category: 'tu-quan-ao', material: 'melamine', finish: 'Matte Charcoal', price: '35,000,000 - 55,000,000 VND', isNew: 0, isFeatured: 0, photoStart: 22 },
  { name: 'Kids Room Wardrobe Colorful', slug: 'kids-room-wardrobe-colorful', desc: 'Tủ quần áo phòng trẻ em với tay nắm tròn an toàn, chiều cao phù hợp tầm với. Màu pastel nhẹ nhàng.', category: 'tu-quan-ao', material: 'melamine', finish: 'Pastel Mint', price: '15,000,000 - 25,000,000 VND', isNew: 0, isFeatured: 0, photoStart: 24 },
  { name: 'Floating TV Console Walnut', slug: 'floating-tv-console-walnut', desc: 'Kệ TV treo tường gỗ walnut với hệ thống giấu dây cáp thông minh. Ngăn mở cho soundbar, ngăn kín cho thiết bị AV.', category: 'ke-tv-trang-tri', material: 'go-tu-nhien', finish: 'Natural Walnut', price: '18,000,000 - 35,000,000 VND', isNew: 1, isFeatured: 1, photoStart: 26 },
  { name: 'Marble Top Display Shelf', slug: 'marble-top-display-shelf', desc: 'Kệ trang trí mặt đá marble tự nhiên, khung sắt sơn tĩnh điện đen. Phong cách industrial-luxury.', category: 'ke-tv-trang-tri', material: 'go-cong-nghiep', finish: 'Black Steel + Marble', price: '22,000,000 - 40,000,000 VND', isNew: 0, isFeatured: 0, photoStart: 28 },
  { name: 'Modular Bookshelf System', slug: 'modular-bookshelf-system', desc: 'Hệ kệ sách module tùy chỉnh, có thể mở rộng. Kết hợp ngăn mở, ngăn kính và ngăn kín tạo nhịp điệu thị giác.', category: 'ke-tv-trang-tri', material: 'go-cong-nghiep', finish: 'Light Ash', price: '12,000,000 - 28,000,000 VND', isNew: 0, isFeatured: 0, photoStart: 30 },
  { name: 'Executive L-Desk Solid Wood', slug: 'executive-l-desk-solid-wood', desc: 'Bàn làm việc chữ L gỗ nguyên khối, tích hợp hộc tủ có khóa. Mặt bàn dày 3cm, chịu lực tốt cho setup đa màn hình.', category: 'ban-lam-viec', material: 'go-tu-nhien', finish: 'Dark Mahogany', price: '25,000,000 - 45,000,000 VND', isNew: 1, isFeatured: 0, photoStart: 32 },
  { name: 'Standing Desk Adjustable', slug: 'standing-desk-adjustable', desc: 'Bàn đứng điều chỉnh chiều cao bằng motor điện 70-120cm. Mặt bàn gỗ tre ép, chân thép carbon, cổng USB-C.', category: 'ban-lam-viec', material: 'go-cong-nghiep', finish: 'Natural Bamboo', price: '12,000,000 - 22,000,000 VND', isNew: 1, isFeatured: 1, photoStart: 34 },
  { name: 'Platform Bed Scandinavian', slug: 'platform-bed-scandinavian', desc: 'Giường platform phong cách Bắc Âu, đầu giường bọc nỉ mềm mại. Khung gỗ thông Phần Lan, dát giường Birch uốn cong.', category: 'giuong-ngu', material: 'go-tu-nhien', finish: 'Blonde Pine', price: '30,000,000 - 50,000,000 VND', isNew: 0, isFeatured: 1, photoStart: 36 },
  { name: 'Storage Bed King Size', slug: 'storage-bed-king-size', desc: 'Giường King Size với ngăn kéo lưu trữ 2 bên và bệ nâng hydraulic. Đầu giường tích hợp đèn đọc sách LED và USB.', category: 'giuong-ngu', material: 'go-cong-nghiep', finish: 'Warm Walnut Veneer', price: '35,000,000 - 60,000,000 VND', isNew: 1, isFeatured: 0, photoStart: 38 },
]

function esc(s) {
  return s.replace(/'/g, "''").replace(/\\/g, '\\\\')
}

const lines = []
lines.push('-- Auto-generated: 20 products with 10 images each')
lines.push('SET @now = NOW();')
lines.push('')

for (let pi = 0; pi < PRODUCTS.length; pi++) {
  const p = PRODUCTS[pi]
  const catId = CAT_IDS[p.category]
  const productId = ulid()

  // Tao 10 media records
  const mediaIds = []
  for (let i = 0; i < 10; i++) {
    const mediaId = ulid()
    mediaIds.push(mediaId)
    const photoIdx = p.photoStart + i
    const orig = esc(photoUrl(photoIdx))
    const thumb = esc(thumbUrl(photoIdx))
    const preview = esc(previewUrl(photoIdx))
    const alt = esc(`${p.name} - Hình ${i + 1}`)

    lines.push(`INSERT INTO media (id, original_filename, mime_type, file_size, original_url, thumbnail_url, preview_url, width, height, alt_text, processing_status, uploaded_by, created_at) VALUES ('${mediaId}', 'product-${pi}-${i}.jpg', 'image/jpeg', 150000, '${orig}', '${thumb}', '${preview}', 1200, 800, '${alt}', 'completed', '${ADMIN_ID}', @now);`)
  }

  // Insert product — kiem tra trung slug truoc
  lines.push(`INSERT INTO products (id, name, slug, description, category_id, material_type, \`finish\`, price_range, cover_image_id, status, published_at, is_new, is_featured, display_order, created_by, created_at, updated_at) SELECT '${productId}', '${esc(p.name)}', '${esc(p.slug)}', '${esc(p.desc)}', '${catId}', '${esc(p.material)}', '${esc(p.finish)}', '${esc(p.price)}', '${mediaIds[0]}', 'published', @now, ${p.isNew}, ${p.isFeatured}, ${pi}, '${ADMIN_ID}', @now, @now FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = '${esc(p.slug)}' AND deleted_at IS NULL);`)

  // Tao product_images (10 anh) — chi insert neu product duoc tao
  for (let gi = 0; gi < mediaIds.length; gi++) {
    const imgId = ulid()
    const caption = esc(`${p.name} - Góc nhìn ${gi + 1}`)
    lines.push(`INSERT INTO product_images (id, product_id, media_id, display_order, is_primary, caption, created_at) SELECT '${imgId}', '${productId}', '${mediaIds[gi]}', ${gi}, ${gi === 0 ? 1 : 0}, '${caption}', @now FROM DUAL WHERE EXISTS (SELECT 1 FROM products WHERE id = '${productId}');`)
  }

  lines.push('')
}

console.log(lines.join('\n'))
