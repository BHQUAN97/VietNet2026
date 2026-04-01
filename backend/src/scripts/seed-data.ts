/**
 * Seed du lieu mau cho development: categories, projects, products, articles.
 * Chay: npx ts-node -r tsconfig-paths/register src/scripts/seed-data.ts
 * Yeu cau: da chay migration va seed-admin truoc.
 */
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { generateUlid } from '../common/helpers/ulid.helper'

dotenv.config()

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

  // ── Lay admin user id ───────────────────────────────────────
  const [admin] = await ds.query(
    "SELECT id FROM users WHERE role = 'super_admin' LIMIT 1",
  )
  if (!admin) {
    console.error('No admin user found. Run seed-admin.ts first.')
    await ds.destroy()
    process.exit(1)
  }
  const adminId = admin.id

  // ── Categories ──────────────────────────────────────────────
  const projectCategories = [
    { name: 'Residential', slug: 'residential', type: 'project' },
    { name: 'Commercial', slug: 'commercial', type: 'project' },
    { name: 'Hospitality', slug: 'hospitality', type: 'project' },
  ]

  const productCategories = [
    { name: 'Tủ bếp gỗ', slug: 'tu-bep-go', type: 'product' },
    { name: 'Tủ bếp Acrylic', slug: 'tu-bep-acrylic', type: 'product' },
    { name: 'Tủ bếp Melamine', slug: 'tu-bep-melamine', type: 'product' },
  ]

  const catIds: Record<string, string> = {}

  for (const cat of [...projectCategories, ...productCategories]) {
    const [existing] = await ds.query(
      'SELECT id FROM categories WHERE slug = ? AND type = ? AND deleted_at IS NULL',
      [cat.slug, cat.type],
    )
    if (existing) {
      catIds[cat.slug] = existing.id
      continue
    }
    const id = generateUlid()
    await ds.query(
      `INSERT INTO categories (id, name, slug, type, display_order, is_active, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 1, ?, NOW(), NOW())`,
      [id, cat.name, cat.slug, cat.type, adminId],
    )
    catIds[cat.slug] = id
    console.log(`  Category: ${cat.name} (${cat.type})`)
  }

  // ── Projects ────────────────────────────────────────────────
  const projects = [
    {
      title: 'Saigon Serenity Villa',
      slug: 'saigon-serenity-villa',
      description: 'Thiết kế nội thất biệt thự phong cách Zen hiện đại, kết hợp gỗ tự nhiên và ánh sáng tự nhiên.',
      category: 'residential',
      style: 'Modern Zen',
      area: '280m²',
      location: 'Quận 2, TP.HCM',
      year: 2025,
      featured: true,
    },
    {
      title: 'Grand Oak Executive Suite',
      slug: 'grand-oak-executive-suite',
      description: 'Không gian văn phòng cao cấp với nội thất gỗ sồi, thiết kế tối giản và sang trọng.',
      category: 'commercial',
      style: 'Executive Minimalist',
      area: '150m²',
      location: 'Quận 1, TP.HCM',
      year: 2024,
      featured: true,
    },
    {
      title: 'Emerald Lake Kitchen',
      slug: 'emerald-lake-kitchen',
      description: 'Nhà bếp resort bên hồ với vật liệu đá tự nhiên và hệ tủ bếp gỗ walnut.',
      category: 'hospitality',
      style: 'Resort Contemporary',
      area: '120m²',
      location: 'Đà Lạt, Lâm Đồng',
      year: 2025,
      featured: true,
    },
    {
      title: 'Vintage Loft Master',
      slug: 'vintage-loft-master',
      description: 'Căn hộ duplex phong cách vintage công nghiệp, kết hợp gạch trần và sắt rèn nghệ thuật.',
      category: 'residential',
      style: 'Industrial Vintage',
      area: '95m²',
      location: 'Quận 7, TP.HCM',
      year: 2024,
      featured: false,
    },
  ]

  for (const p of projects) {
    const [existing] = await ds.query(
      'SELECT id FROM projects WHERE slug = ? AND deleted_at IS NULL',
      [p.slug],
    )
    if (existing) continue

    const id = generateUlid()
    await ds.query(
      `INSERT INTO projects (id, title, slug, description, category_id, style, area, location, year_completed,
        status, published_at, is_featured, display_order, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), ?, 0, ?, NOW(), NOW())`,
      [id, p.title, p.slug, p.description, catIds[p.category], p.style, p.area, p.location, p.year, p.featured ? 1 : 0, adminId],
    )
    console.log(`  Project: ${p.title}`)
  }

  // ── Products ────────────────────────────────────────────────
  const products = [
    {
      name: 'Modern Minimalist Kitchen',
      slug: 'modern-minimalist-kitchen',
      description: 'Tủ bếp gỗ tự nhiên phong cách tối giản, bề mặt phẳng không tay nắm.',
      category: 'tu-bep-go',
      material_type: 'go-tu-nhien',
      finish: 'Matte Natural',
      price_range: '45,000,000 - 65,000,000 VND',
      is_new: true,
    },
    {
      name: 'Ultra-Gloss Arctic White',
      slug: 'ultra-gloss-arctic-white',
      description: 'Tủ bếp Acrylic trắng bóng cao, phản chiếu ánh sáng tạo không gian rộng rãi.',
      category: 'tu-bep-acrylic',
      material_type: 'acrylic',
      finish: 'High Gloss White',
      price_range: '55,000,000 - 80,000,000 VND',
      is_new: true,
    },
    {
      name: 'Luxury Natural Oak Cabinets',
      slug: 'luxury-natural-oak-cabinets',
      description: 'Hệ tủ bếp gỗ sồi tự nhiên nguyên khối, vân gỗ đẹp tự nhiên.',
      category: 'tu-bep-go',
      material_type: 'go-tu-nhien',
      finish: 'Semi-Matte Oak',
      price_range: '70,000,000 - 120,000,000 VND',
      is_new: false,
    },
    {
      name: 'Loft Industrial Grey',
      slug: 'loft-industrial-grey',
      description: 'Tủ bếp Melamine xám công nghiệp, phù hợp không gian loft và căn hộ hiện đại.',
      category: 'tu-bep-melamine',
      material_type: 'melamine',
      finish: 'Textured Grey',
      price_range: '25,000,000 - 40,000,000 VND',
      is_new: false,
    },
    {
      name: 'Scandi Birch Collection',
      slug: 'scandi-birch-collection',
      description: 'Bộ sưu tập tủ bếp phong cách Bắc Âu với gỗ bạch dương sáng màu.',
      category: 'tu-bep-go',
      material_type: 'go-cong-nghiep',
      finish: 'Light Birch',
      price_range: '35,000,000 - 55,000,000 VND',
      is_new: true,
    },
    {
      name: 'Urban Noir Textured Melamine',
      slug: 'urban-noir-textured-melamine',
      description: 'Tủ bếp đen nhám cao cấp, bề mặt chống bám vân tay.',
      category: 'tu-bep-melamine',
      material_type: 'melamine',
      finish: 'Matte Black Textured',
      price_range: '30,000,000 - 50,000,000 VND',
      is_new: false,
    },
  ]

  for (const p of products) {
    const [existing] = await ds.query(
      'SELECT id FROM products WHERE slug = ? AND deleted_at IS NULL',
      [p.slug],
    )
    if (existing) continue

    const id = generateUlid()
    await ds.query(
      `INSERT INTO products (id, name, slug, description, category_id, material_type, \`finish\`, price_range,
        status, published_at, is_new, is_featured, display_order, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), ?, 0, 0, ?, NOW(), NOW())`,
      [id, p.name, p.slug, p.description, catIds[p.category], p.material_type, p.finish, p.price_range, p.is_new ? 1 : 0, adminId],
    )
    console.log(`  Product: ${p.name}`)
  }

  // ── Articles ────────────────────────────────────────────────
  const articles = [
    {
      title: 'Xu hướng thiết kế nội thất 2025: Tối giản bền vững',
      slug: 'xu-huong-thiet-ke-noi-that-2025',
      excerpt: 'Khám phá những xu hướng thiết kế nội thất mới nhất với trọng tâm là vật liệu bền vững và phong cách tối giản.',
    },
    {
      title: 'Cách chọn vật liệu tủ bếp phù hợp với ngân sách',
      slug: 'cach-chon-vat-lieu-tu-bep',
      excerpt: 'So sánh chi tiết các loại vật liệu phổ biến: gỗ tự nhiên, Acrylic, Melamine, Laminate — ưu nhược điểm và chi phí.',
    },
    {
      title: '5 sai lầm thường gặp khi thiết kế bếp',
      slug: '5-sai-lam-thiet-ke-bep',
      excerpt: 'Tránh những lỗi thiết kế phổ biến để có không gian bếp vừa đẹp vừa tiện dụng cho gia đình Việt.',
    },
  ]

  for (const a of articles) {
    const [existing] = await ds.query(
      'SELECT id FROM articles WHERE slug = ? AND deleted_at IS NULL',
      [a.slug],
    )
    if (existing) continue

    const id = generateUlid()
    await ds.query(
      `INSERT INTO articles (id, title, slug, excerpt, status, published_at, display_order, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'published', NOW(), 0, ?, NOW(), NOW())`,
      [id, a.title, a.slug, a.excerpt, adminId],
    )
    console.log(`  Article: ${a.title}`)
  }

  // ── Settings ────────────────────────────────────────────────
  const settings = [
    { key: 'site_name', value: 'VietNet Interior', group: 'general' },
    { key: 'site_description', value: 'Thiết kế & thi công nội thất cao cấp', group: 'general' },
    { key: 'contact_phone', value: '+84 28 1234 5678', group: 'contact' },
    { key: 'contact_email', value: 'info@bhquan.site', group: 'contact' },
    { key: 'contact_address', value: '123 Nguyễn Huệ, Quận 1, TP.HCM', group: 'contact' },
  ]

  for (const s of settings) {
    const [existing] = await ds.query(
      'SELECT id FROM settings WHERE setting_key = ?',
      [s.key],
    )
    if (existing) continue

    const id = generateUlid()
    await ds.query(
      `INSERT INTO settings (id, setting_key, setting_value, setting_group, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [id, s.key, s.value, s.group],
    )
    console.log(`  Setting: ${s.key}`)
  }

  // ── Homepage page config ────────────────────────────────────
  const [existingPage] = await ds.query(
    "SELECT id FROM page_configs WHERE page_slug = 'homepage'",
  )
  if (!existingPage) {
    const id = generateUlid()
    const config = JSON.stringify({
      sections: [
        { type: 'hero', order: 1, visible: true, config: { title: 'Crafting Silent Elegance', subtitle: 'Thiết kế nội thất cao cấp cho không gian sống đẳng cấp' } },
        { type: 'about', order: 2, visible: true, config: {} },
        { type: 'featured_projects', order: 3, visible: true, config: { limit: 3 } },
        { type: 'testimonials', order: 4, visible: true, config: {} },
        { type: 'contact_cta', order: 5, visible: true, config: { show_form: true } },
      ],
    })
    await ds.query(
      `INSERT INTO page_configs (id, page_slug, config_published, config_draft, version, published_at, created_at, updated_at)
       VALUES (?, 'homepage', ?, ?, 1, NOW(), NOW(), NOW())`,
      [id, config, config],
    )
    console.log('  PageConfig: homepage')
  }

  console.log('\nSeed completed successfully!')
  await ds.destroy()
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
