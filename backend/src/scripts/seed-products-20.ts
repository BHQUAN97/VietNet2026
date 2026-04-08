/**
 * Seed 20 san pham voi 10 anh moi SP.
 * Chay: npx ts-node -r tsconfig-paths/register src/scripts/seed-products-20.ts
 * Yeu cau: da chay migration + seed-admin + seed-data (de co categories) truoc.
 */
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { ulid } from 'ulid'

dotenv.config()

// ============================================================
// UNSPLASH KITCHEN / INTERIOR PHOTO POOL (200 anh)
// Chia theo nhom: kitchen, wardrobe, tv-shelf, desk, bedroom
// ============================================================
const KITCHEN_PHOTOS = [
  '1556909114-f6e7ad7d3136',
  '1600210492486-724fe5c67fb3',
  '1600573472592-401b489a3cdc',
  '1484154218962-a197022b5858',
  '1600210491369-e753d80a41f3',
  '1596900779744-2bdc4a90509a',
  '1600047509807-ba8f99d2cdde',
  '1600607687644-aac5c9cced2d',
  '1600210492493-b930ee81dbf5',
  '1600210491892-bc01cff441e9',
  '1556185781-2a4a52a29b18',
  '1600585154340-be6161a56a0c',
  '1507089947017-82a3e86e0df3',
  '1560185127-6ed189bf02f4',
  '1600566753190-17f0baa2a6c3',
  '1600047508788-786f3865b4b7',
  '1583847268964-b28dc8f51f92',
  '1556761175-b413da4baf72',
  '1565182999561-18d7dc61c393',
  '1600566753086-00f18fb6b03d',
  '1555041469-a586c61ea9bc',
  '1571624436279-b272aff752b5',
  '1600563438749-a0e77bd2afab',
  '1594026112284-02bb6f3352fe',
  '1560184611-c0e94e4cc498',
]

const FURNITURE_PHOTOS = [
  '1502672260266-1c1ef2d93688',
  '1618221195710-dd6b41faaea6',
  '1560448204771-d60f0e1a26c0',
  '1616486338812-3dadae4b4ace',
  '1600607687939-ce8a6c25118c',
  '1615529182904-14819c35db37',
  '1631679706909-1844bbd07221',
  '1586023492125-27b2012f8222',
  '1600566752355-35792bedcfea',
  '1598928506311-aab7ecc834e0',
  '1556909212-d5b604d0c90d',
  '1560185009-5bf9f2ce0d03',
  '1560185008-b033106af763',
  '1600585153490-76fb20a32601',
  '1615874694520-41b8fbb0d1ba',
  '1618219908412-a29a1bb7b86c',
  '1556909078-e5b2e5d0d342',
  '1560185007-5f0bb1866cab',
  '1617103996702-96ff29b1c467',
  '1597218868981-1b68e15f0065',
  '1560185008-a33f5c7a8e09',
  '1615873968403-f9e601145c1d',
  '1618219740975-d40978bb7378',
  '1513694203232-719a280e022f',
  '1560185007-cde436f6670d',
  '1505693416388-ac5ce068fe85',
  '1560440021-5f092f8aa458',
  '1536437075651-01d7a4e4a3b7',
  '1560184897-ae75f418493e',
  '1574739782594-db4ead022697',
]

const ALL_PHOTOS = [...KITCHEN_PHOTOS, ...FURNITURE_PHOTOS]

function photoUrl(idx: number, w = 1200, h = 800) {
  const id = ALL_PHOTOS[idx % ALL_PHOTOS.length]
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`
}
function thumbUrl(idx: number) { return photoUrl(idx, 300, 300) }
function previewUrl(idx: number) { return photoUrl(idx, 800, 600) }

// ============================================================
// 20 SAN PHAM — 7 categories
// ============================================================
const PRODUCTS = [
  // --- TU BEP GO (4) ---
  {
    name: 'Modern Walnut L-Shape Kitchen',
    slug: 'modern-walnut-l-shape-kitchen',
    desc: 'Tủ bếp chữ L gỗ walnut nhập khẩu, thiết kế hiện đại với tay nắm ẩn và bản lề giảm chấn Blum. Mặt bếp đá thạch anh Caesarstone trắng, chống trầy xước tối ưu.',
    category: 'tu-bep-go', material: 'go-tu-nhien', finish: 'Matte Walnut',
    price: '85,000,000 - 120,000,000 VND', isNew: true, isFeatured: true, photoStart: 0,
  },
  {
    name: 'Classic Oak Island Kitchen',
    slug: 'classic-oak-island-kitchen',
    desc: 'Bếp đảo gỗ sồi Mỹ với quầy bar tích hợp, phù hợp không gian mở. Hệ tủ trên soft-close, ngăn kéo ray giảm chấn Hettich.',
    category: 'tu-bep-go', material: 'go-tu-nhien', finish: 'Semi-Matte Oak',
    price: '95,000,000 - 150,000,000 VND', isNew: false, isFeatured: true, photoStart: 2,
  },
  {
    name: 'Japanese Hinoki U-Shape',
    slug: 'japanese-hinoki-u-shape',
    desc: 'Tủ bếp chữ U phong cách Nhật Bản với gỗ Hinoki tự nhiên. Kết hợp kệ mở và tủ kín, tối ưu lưu trữ cho không gian bếp vừa và nhỏ.',
    category: 'tu-bep-go', material: 'go-tu-nhien', finish: 'Natural Hinoki',
    price: '75,000,000 - 110,000,000 VND', isNew: true, isFeatured: false, photoStart: 4,
  },
  {
    name: 'Scandinavian Birch Galley',
    slug: 'scandinavian-birch-galley',
    desc: 'Bếp dạng hành lang (galley) phong cách Bắc Âu, gỗ bạch dương sáng màu kết hợp tông trắng. Thiết kế tối giản, tận dụng tối đa không gian hẹp.',
    category: 'tu-bep-go', material: 'go-cong-nghiep', finish: 'Light Birch',
    price: '45,000,000 - 70,000,000 VND', isNew: false, isFeatured: false, photoStart: 6,
  },

  // --- TU BEP ACRYLIC (3) ---
  {
    name: 'Crystal White High-Gloss Kitchen',
    slug: 'crystal-white-high-gloss-kitchen',
    desc: 'Tủ bếp Acrylic trắng bóng gương, phản chiếu ánh sáng tạo cảm giác rộng rãi. Cánh tủ không viền (edgeless) sắc nét, dễ vệ sinh.',
    category: 'tu-bep-acrylic', material: 'acrylic', finish: 'High Gloss White',
    price: '65,000,000 - 95,000,000 VND', isNew: true, isFeatured: true, photoStart: 8,
  },
  {
    name: 'Midnight Black Acrylic Suite',
    slug: 'midnight-black-acrylic-suite',
    desc: 'Bộ tủ bếp Acrylic đen bóng cao cấp, tạo điểm nhấn mạnh mẽ cho không gian bếp hiện đại. Kết hợp đèn LED dải dưới tủ treo.',
    category: 'tu-bep-acrylic', material: 'acrylic', finish: 'High Gloss Black',
    price: '70,000,000 - 100,000,000 VND', isNew: false, isFeatured: false, photoStart: 10,
  },
  {
    name: 'Champagne Gold Acrylic Kitchen',
    slug: 'champagne-gold-acrylic-kitchen',
    desc: 'Tủ bếp Acrylic tông vàng champagne sang trọng, bề mặt chống bám vân tay. Phụ kiện inox vàng đồng bộ, mang đến vẻ đẳng cấp.',
    category: 'tu-bep-acrylic', material: 'acrylic', finish: 'Champagne Gold Gloss',
    price: '80,000,000 - 115,000,000 VND', isNew: true, isFeatured: false, photoStart: 12,
  },

  // --- TU BEP MELAMINE (3) ---
  {
    name: 'Urban Grey Melamine Kitchen',
    slug: 'urban-grey-melamine-kitchen',
    desc: 'Tủ bếp Melamine xám đô thị, bề mặt vân gỗ công nghiệp. Giải pháp tối ưu chi phí mà vẫn đảm bảo thẩm mỹ và độ bền.',
    category: 'tu-bep-melamine', material: 'melamine', finish: 'Textured Grey',
    price: '25,000,000 - 40,000,000 VND', isNew: false, isFeatured: false, photoStart: 14,
  },
  {
    name: 'Warm Teak Melamine Suite',
    slug: 'warm-teak-melamine-suite',
    desc: 'Hệ tủ bếp Melamine vân teak ấm áp, phù hợp phong cách tropical. Chống ẩm chuẩn E1, an toàn cho sức khỏe gia đình.',
    category: 'tu-bep-melamine', material: 'melamine', finish: 'Warm Teak',
    price: '28,000,000 - 45,000,000 VND', isNew: true, isFeatured: false, photoStart: 16,
  },
  {
    name: 'Snow White Melamine Compact',
    slug: 'snow-white-melamine-compact',
    desc: 'Tủ bếp Melamine trắng tuyết compact cho căn hộ studio. Tích hợp giá đa năng, kệ gia vị xoay 360° và ngăn kéo phân loại rác.',
    category: 'tu-bep-melamine', material: 'melamine', finish: 'Matte White',
    price: '18,000,000 - 30,000,000 VND', isNew: false, isFeatured: true, photoStart: 18,
  },

  // --- TU QUAN AO (3) ---
  {
    name: 'Walk-in Closet Premium',
    slug: 'walk-in-closet-premium',
    desc: 'Tủ quần áo walk-in cao cấp với hệ thống đèn LED cảm biến, gương toàn thân, và ngăn kéo trang sức khóa điện tử. Thiết kế riêng cho phòng master.',
    category: 'tu-quan-ao', material: 'go-cong-nghiep', finish: 'White Oak Veneer',
    price: '55,000,000 - 85,000,000 VND', isNew: true, isFeatured: true, photoStart: 20,
  },
  {
    name: 'Sliding Door Wardrobe Modern',
    slug: 'sliding-door-wardrobe-modern',
    desc: 'Tủ quần áo cửa trượt ray nhôm êm ái, gương ngoài tích hợp. Bên trong phân vùng: treo áo dài, treo áo ngắn, ngăn kéo, kệ giày.',
    category: 'tu-quan-ao', material: 'melamine', finish: 'Matte Charcoal',
    price: '35,000,000 - 55,000,000 VND', isNew: false, isFeatured: false, photoStart: 22,
  },
  {
    name: 'Kids Room Wardrobe Colorful',
    slug: 'kids-room-wardrobe-colorful',
    desc: 'Tủ quần áo phòng trẻ em với tay nắm tròn an toàn, chiều cao phù hợp tầm với của bé. Màu pastel nhẹ nhàng, chống trầy xước.',
    category: 'tu-quan-ao', material: 'melamine', finish: 'Pastel Mint',
    price: '15,000,000 - 25,000,000 VND', isNew: false, isFeatured: false, photoStart: 24,
  },

  // --- KE TV & TRANG TRI (3) ---
  {
    name: 'Floating TV Console Walnut',
    slug: 'floating-tv-console-walnut',
    desc: 'Kệ TV treo tường gỗ walnut với hệ thống giấu dây cáp thông minh. Ngăn mở cho soundbar, ngăn kín cho thiết bị AV.',
    category: 'ke-tv-trang-tri', material: 'go-tu-nhien', finish: 'Natural Walnut',
    price: '18,000,000 - 35,000,000 VND', isNew: true, isFeatured: true, photoStart: 26,
  },
  {
    name: 'Marble Top Display Shelf',
    slug: 'marble-top-display-shelf',
    desc: 'Kệ trang trí mặt đá marble tự nhiên, khung sắt sơn tĩnh điện đen. Phong cách industrial-luxury, phù hợp phòng khách và showroom.',
    category: 'ke-tv-trang-tri', material: 'go-cong-nghiep', finish: 'Black Steel + Marble',
    price: '22,000,000 - 40,000,000 VND', isNew: false, isFeatured: false, photoStart: 28,
  },
  {
    name: 'Modular Bookshelf System',
    slug: 'modular-bookshelf-system',
    desc: 'Hệ kệ sách module tùy chỉnh, có thể mở rộng theo nhu cầu. Kết hợp ngăn mở, ngăn kính và ngăn kín tạo nhịp điệu thị giác.',
    category: 'ke-tv-trang-tri', material: 'go-cong-nghiep', finish: 'Light Ash',
    price: '12,000,000 - 28,000,000 VND', isNew: false, isFeatured: false, photoStart: 30,
  },

  // --- BAN LAM VIEC (2) ---
  {
    name: 'Executive L-Desk Solid Wood',
    slug: 'executive-l-desk-solid-wood',
    desc: 'Bàn làm việc chữ L gỗ nguyên khối, tích hợp hộc tủ có khóa và ngăn kéo bàn phím. Mặt bàn dày 3cm, chịu lực tốt cho setup đa màn hình.',
    category: 'ban-lam-viec', material: 'go-tu-nhien', finish: 'Dark Mahogany',
    price: '25,000,000 - 45,000,000 VND', isNew: true, isFeatured: false, photoStart: 32,
  },
  {
    name: 'Standing Desk Adjustable',
    slug: 'standing-desk-adjustable',
    desc: 'Bàn đứng điều chỉnh chiều cao bằng motor điện (70-120cm). Mặt bàn gỗ tre ép, chân thép carbon. Tích hợp cổng sạc USB-C.',
    category: 'ban-lam-viec', material: 'go-cong-nghiep', finish: 'Natural Bamboo',
    price: '12,000,000 - 22,000,000 VND', isNew: true, isFeatured: true, photoStart: 34,
  },

  // --- GIUONG NGU (2) ---
  {
    name: 'Platform Bed Scandinavian',
    slug: 'platform-bed-scandinavian',
    desc: 'Giường ngủ platform phong cách Bắc Âu, đầu giường bọc nỉ mềm mại. Khung gỗ thông Phần Lan, hệ thống dát giường Birch uốn cong đàn hồi.',
    category: 'giuong-ngu', material: 'go-tu-nhien', finish: 'Blonde Pine',
    price: '30,000,000 - 50,000,000 VND', isNew: false, isFeatured: true, photoStart: 36,
  },
  {
    name: 'Storage Bed King Size',
    slug: 'storage-bed-king-size',
    desc: 'Giường ngủ King Size với hệ thống ngăn kéo lưu trữ 2 bên và bệ nâng hydraulic. Đầu giường tích hợp đèn đọc sách LED và ổ cắm USB.',
    category: 'giuong-ngu', material: 'go-cong-nghiep', finish: 'Warm Walnut Veneer',
    price: '35,000,000 - 60,000,000 VND', isNew: true, isFeatured: false, photoStart: 38,
  },
]

// ============================================================
// MAIN
// ============================================================
async function seed() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'vietnet',
    synchronize: false,
  })

  await ds.initialize()
  console.log('Connected to database.')

  // Lay admin user id
  const [admin] = await ds.query(
    "SELECT id FROM users WHERE role = 'super_admin' LIMIT 1",
  )
  if (!admin) {
    console.error('No admin user found. Run seed-admin.ts first.')
    await ds.destroy()
    process.exit(1)
  }
  const adminId = admin.id

  // Lay category IDs
  const catRows = await ds.query(
    "SELECT id, slug FROM categories WHERE type = 'product' AND deleted_at IS NULL",
  )
  const catIds: Record<string, string> = {}
  for (const row of catRows) {
    catIds[row.slug] = row.id
  }
  console.log(`Found ${Object.keys(catIds).length} product categories:`, Object.keys(catIds).join(', '))

  // Tao categories neu chua co
  const requiredCats = [
    { name: 'Tủ bếp gỗ', slug: 'tu-bep-go', order: 1 },
    { name: 'Tủ bếp Acrylic', slug: 'tu-bep-acrylic', order: 2 },
    { name: 'Tủ bếp Melamine', slug: 'tu-bep-melamine', order: 3 },
    { name: 'Tủ Quần Áo', slug: 'tu-quan-ao', order: 4 },
    { name: 'Kệ TV & Trang Trí', slug: 'ke-tv-trang-tri', order: 5 },
    { name: 'Bàn Làm Việc', slug: 'ban-lam-viec', order: 6 },
    { name: 'Giường Ngủ', slug: 'giuong-ngu', order: 7 },
  ]
  for (const cat of requiredCats) {
    if (catIds[cat.slug]) continue
    const id = ulid()
    await ds.query(
      `INSERT INTO categories (id, name, slug, type, display_order, is_active, created_by, created_at, updated_at)
       VALUES (?, ?, ?, 'product', ?, 1, ?, NOW(), NOW())`,
      [id, cat.name, cat.slug, cat.order, adminId],
    )
    catIds[cat.slug] = id
    console.log(`  [new category] ${cat.name}`)
  }

  // Helper: insert media
  async function insertMedia(photoIdx: number, altText: string): Promise<string> {
    const id = ulid()
    const url = photoUrl(photoIdx)
    const thumb = thumbUrl(photoIdx)
    const preview = previewUrl(photoIdx)
    await ds.query(
      `INSERT INTO media (id, original_filename, mime_type, file_size, original_url, thumbnail_url, preview_url,
        width, height, alt_text, processing_status, uploaded_by, created_at)
       VALUES (?, ?, 'image/jpeg', 150000, ?, ?, ?, 1200, 800, ?, 'completed', ?, NOW())`,
      [id, `product-${photoIdx}.jpg`, url, thumb, preview, altText, adminId],
    )
    return id
  }

  // Seed 20 products
  console.log('\n=== Seeding 20 Products (10 images each) ===')

  for (let pi = 0; pi < PRODUCTS.length; pi++) {
    const p = PRODUCTS[pi]
    const [existing] = await ds.query(
      'SELECT id FROM products WHERE slug = ? AND deleted_at IS NULL',
      [p.slug],
    )
    if (existing) {
      console.log(`  [skip] ${p.name}`)
      continue
    }

    // Tao 10 media records cho product
    const mediaIds: string[] = []
    for (let i = 0; i < 10; i++) {
      const mid = await insertMedia(p.photoStart + i, `${p.name} - Hình ${i + 1}`)
      mediaIds.push(mid)
    }

    const catId = catIds[p.category] || null
    const productId = ulid()

    // Insert product voi cover_image la anh dau tien
    await ds.query(
      `INSERT INTO products (id, name, slug, description, category_id, material_type, \`finish\`, price_range,
        cover_image_id, status, published_at, is_new, is_featured, display_order, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), ?, ?, ?, ?, NOW(), NOW())`,
      [productId, p.name, p.slug, p.desc, catId, p.material, p.finish, p.price,
        mediaIds[0], p.isNew ? 1 : 0, p.isFeatured ? 1 : 0, pi, adminId],
    )

    // Tao product_images (10 anh)
    for (let gi = 0; gi < mediaIds.length; gi++) {
      const imgId = ulid()
      await ds.query(
        `INSERT INTO product_images (id, product_id, media_id, display_order, is_primary, caption, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [imgId, productId, mediaIds[gi], gi, gi === 0 ? 1 : 0, `${p.name} - Góc nhìn ${gi + 1}`],
      )
    }

    console.log(`  [new] ${p.name} (${mediaIds.length} images)`)
  }

  console.log('\n✓ Done! Seeded products with images.')
  await ds.destroy()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
