/**
 * Seed du lieu demo day du: 20 categories, 20 projects, 20 articles.
 * Moi bai viet/du an co 10 hinh anh demo noi that tu Unsplash.
 * Content 400-1000 ky tu.
 *
 * Chay: npx ts-node -r tsconfig-paths/register src/scripts/seed-demo-data.ts
 * Yeu cau: da chay migration + seed-admin truoc.
 */
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { ulid } from 'ulid'

dotenv.config()

// ============================================================
// UNSPLASH INTERIOR DESIGN PHOTO POOL (60 anh)
// Format: photo ID => dung voi https://images.unsplash.com/photo-{ID}
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
]

function photoUrl(idx: number, w = 1200, h = 800) {
  const id = PHOTO_IDS[idx % PHOTO_IDS.length]
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`
}
function thumbUrl(idx: number) { return photoUrl(idx, 300, 300) }
function previewUrl(idx: number) { return photoUrl(idx, 800, 600) }

// ============================================================
// TIPTAP JSON HELPERS
// ============================================================
function tiptapDoc(paragraphs: string[], imageUrls: string[]): string {
  const content: any[] = []
  // Xen ke van ban va hinh anh
  paragraphs.forEach((text, i) => {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })
    // Chen hinh sau moi doan van
    if (imageUrls[i]) {
      content.push({
        type: 'image',
        attrs: { src: imageUrls[i], alt: `Hình minh họa ${i + 1}` },
      })
    }
  })
  // Them cac hinh con lai
  for (let i = paragraphs.length; i < imageUrls.length; i++) {
    content.push({
      type: 'image',
      attrs: { src: imageUrls[i], alt: `Hình minh họa ${i + 1}` },
    })
  }
  return JSON.stringify({ type: 'doc', content })
}

// ============================================================
// DATA DEFINITIONS
// ============================================================

// --- CATEGORIES ---
const CATEGORIES = [
  // Project categories (7)
  { name: 'Residential', slug: 'residential', type: 'project', order: 1 },
  { name: 'Commercial', slug: 'commercial', type: 'project', order: 2 },
  { name: 'Hospitality', slug: 'hospitality', type: 'project', order: 3 },
  { name: 'Căn Hộ Chung Cư', slug: 'can-ho-chung-cu', type: 'project', order: 4 },
  { name: 'Biệt Thự', slug: 'biet-thu', type: 'project', order: 5 },
  { name: 'Văn Phòng', slug: 'van-phong', type: 'project', order: 6 },
  { name: 'Showroom', slug: 'showroom', type: 'project', order: 7 },
  // Product categories (7)
  { name: 'Tủ bếp gỗ', slug: 'tu-bep-go', type: 'product', order: 1 },
  { name: 'Tủ bếp Acrylic', slug: 'tu-bep-acrylic', type: 'product', order: 2 },
  { name: 'Tủ bếp Melamine', slug: 'tu-bep-melamine', type: 'product', order: 3 },
  { name: 'Tủ Quần Áo', slug: 'tu-quan-ao', type: 'product', order: 4 },
  { name: 'Kệ TV & Trang Trí', slug: 'ke-tv-trang-tri', type: 'product', order: 5 },
  { name: 'Bàn Làm Việc', slug: 'ban-lam-viec', type: 'product', order: 6 },
  { name: 'Giường Ngủ', slug: 'giuong-ngu', type: 'product', order: 7 },
  // Article categories (6)
  { name: 'Xu Hướng Thiết Kế', slug: 'xu-huong-thiet-ke', type: 'article', order: 1 },
  { name: 'Kiến Thức Nội Thất', slug: 'kien-thuc-noi-that', type: 'article', order: 2 },
  { name: 'Phong Thủy Nhà Ở', slug: 'phong-thuy-nha-o', type: 'article', order: 3 },
  { name: 'Mẹo Trang Trí', slug: 'meo-trang-tri', type: 'article', order: 4 },
  { name: 'Vật Liệu & Chất Liệu', slug: 'vat-lieu-chat-lieu', type: 'article', order: 5 },
  { name: 'Câu Chuyện Dự Án', slug: 'cau-chuyen-du-an', type: 'article', order: 6 },
]

// --- PROJECTS (20) ---
const PROJECTS = [
  {
    title: 'Saigon Serenity Villa',
    slug: 'saigon-serenity-villa',
    desc: 'Biệt thự sang trọng mang phong cách Zen hiện đại tại Quận 2, TP.HCM. Không gian mở tối đa hóa ánh sáng tự nhiên, kết hợp vật liệu gỗ óc chó nhập khẩu và đá marble Ý. Hệ thống ánh sáng thông minh được tích hợp đồng bộ, tạo nên bầu không khí thư thái cho gia chủ. Khu vực bếp đảo trung tâm sử dụng mặt đá granite nguyên khối, phòng khách với trần cao 6m và tường kính panorama nhìn ra sông.',
    category: 'biet-thu', style: 'Modern Zen', area: '280m²', location: 'Quận 2, TP.HCM', year: 2025, featured: true, photoStart: 0,
  },
  {
    title: 'Grand Oak Executive Suite',
    slug: 'grand-oak-executive-suite',
    desc: 'Văn phòng giám đốc điều hành với nội thất gỗ sồi nguyên khối. Thiết kế tối giản nhưng sang trọng, phản ánh đẳng cấp doanh nhân. Bàn làm việc 2.4m bằng gỗ walnut, tủ sách dọc tường cao 3m với đèn LED tích hợp. Khu vực tiếp khách riêng biệt với sofa da Ý, bàn trà đá cẩm thạch. Hệ thống cách âm chuyên dụng đảm bảo không gian làm việc yên tĩnh tuyệt đối.',
    category: 'van-phong', style: 'Executive Minimalist', area: '150m²', location: 'Quận 1, TP.HCM', year: 2024, featured: true, photoStart: 10,
  },
  {
    title: 'Emerald Lake Kitchen',
    slug: 'emerald-lake-kitchen',
    desc: 'Nhà bếp resort cao cấp bên hồ với tầm nhìn panorama tuyệt đẹp ra Hồ Xuân Hương. Sử dụng đá tự nhiên và hệ tủ bếp gỗ walnut nhập từ Bắc Mỹ. Thiết bị nhà bếp thương hiệu Miele và Sub-Zero được tích hợp ẩn mình sau các tấm panel gỗ. Quầy bar mini với hệ thống rượu vang điều khiển nhiệt độ tự động, phục vụ tối ưu nhu cầu nghỉ dưỡng của du khách.',
    category: 'hospitality', style: 'Resort Contemporary', area: '120m²', location: 'Đà Lạt, Lâm Đồng', year: 2025, featured: true, photoStart: 20,
  },
  {
    title: 'Vintage Loft Master',
    slug: 'vintage-loft-master',
    desc: 'Căn hộ duplex phong cách vintage công nghiệp tại khu đô thị Phú Mỹ Hưng. Tường gạch trần nguyên bản kết hợp hệ thống ống thép lộ thiên sơn đen. Cầu thang xoắn sắt rèn nghệ thuật nối hai tầng, lan can kính cường lực trong suốt. Phòng ngủ tầng lửng với trần dốc, cửa sổ mái lấy sáng tự nhiên. Sàn gỗ teak tái chế từ nhà cổ Hội An, mang đậm dấu ấn thời gian.',
    category: 'can-ho-chung-cu', style: 'Industrial Vintage', area: '95m²', location: 'Quận 7, TP.HCM', year: 2024, featured: false, photoStart: 30,
  },
  {
    title: 'Riverside Penthouse',
    slug: 'riverside-penthouse',
    desc: 'Penthouse đẳng cấp tầng 35 với view sông Sài Gòn 270 độ. Phòng khách double-height 7m, tường kính floor-to-ceiling. Nội thất theo phong cách Art Deco đương đại với chất liệu vàng đồng và velvet xanh ngọc. Phòng tắm master sử dụng đá onyx nguyên khối, bồn tắm freestanding Villeroy & Boch. Hệ thống smart home Lutron điều khiển toàn bộ ánh sáng, rèm cửa và nhiệt độ qua ứng dụng di động.',
    category: 'can-ho-chung-cu', style: 'Art Deco Modern', area: '320m²', location: 'Bình Thạnh, TP.HCM', year: 2025, featured: true, photoStart: 40,
  },
  {
    title: 'Coastal Retreat House',
    slug: 'coastal-retreat-house',
    desc: 'Nhà nghỉ dưỡng ven biển phong cách Địa Trung Hải, tọa lạc trên đồi nhìn ra Vịnh Nha Trang. Tường sơn trắng kết hợp gỗ teak chống mặn, mái ngói đất nung thủ công. Hiên ngoài rộng 40m² với bể bơi tràn bờ infinity pool. Nội thất sử dụng chất liệu tự nhiên: mây tre đan, vải lanh Bỉ, đá cuội sông. Phòng ngủ mở ra ban công riêng, đón gió biển và tiếng sóng vỗ.',
    category: 'biet-thu', style: 'Mediterranean Coastal', area: '350m²', location: 'Nha Trang, Khánh Hòa', year: 2024, featured: false, photoStart: 50,
  },
  {
    title: 'Urban Micro Studio',
    slug: 'urban-micro-studio',
    desc: 'Giải pháp thiết kế thông minh cho căn hộ studio 35m² tại trung tâm Quận 3. Hệ thống nội thất đa năng: giường Murphy gấp gọn vào tường, bàn ăn mở rộng từ kệ TV, bếp ẩn sau cánh cửa trượt. Gương lớn và tông màu sáng tạo cảm giác rộng rãi gấp đôi. Mỗi góc nhỏ đều được tận dụng với ngăn kéo âm tường và kệ treo nổi, biến không gian nhỏ thành nơi sống tiện nghi.',
    category: 'can-ho-chung-cu', style: 'Smart Compact', area: '35m²', location: 'Quận 3, TP.HCM', year: 2025, featured: false, photoStart: 0,
  },
  {
    title: 'Japanese Tea House',
    slug: 'japanese-tea-house',
    desc: 'Trà thất phong cách Nhật Bản giữa lòng Thủ Đức, thiết kế theo triết lý Wabi-sabi. Vật liệu thô mộc: gỗ thông tự nhiên chưa qua xử lý, đá suối, giấy shoji truyền thống. Không gian tatami với bàn trà thấp, hốc tường tokonoma trưng bày cắm hoa ikebana. Vườn đá Zen bao quanh với rêu và sỏi trắng xếp hình sóng. Ánh sáng gián tiếp qua rèm tre tạo không gian thiền định.',
    category: 'hospitality', style: 'Japanese Wabi-sabi', area: '60m²', location: 'Thủ Đức, TP.HCM', year: 2025, featured: true, photoStart: 10,
  },
  {
    title: 'Luxury Spa Resort',
    slug: 'luxury-spa-resort',
    desc: 'Khu spa nghỉ dưỡng 5 sao với 12 phòng trị liệu riêng biệt. Mỗi phòng được thiết kế theo một chủ đề thiên nhiên khác nhau: rừng nhiệt đới, đại dương, sa mạc, hoa anh đào. Vật liệu đá bazan núi lửa và gỗ tràm Phú Quốc. Hệ thống âm thanh surround tích hợp nhạc thiên nhiên. Bể ngâm onsen ngoài trời nhìn ra rừng dừa, kết hợp liệu pháp aromatherapy với tinh dầu thiên nhiên Việt Nam.',
    category: 'hospitality', style: 'Tropical Wellness', area: '800m²', location: 'Phú Quốc, Kiên Giang', year: 2024, featured: true, photoStart: 20,
  },
  {
    title: 'Startup Creative Hub',
    slug: 'startup-creative-hub',
    desc: 'Không gian coworking sáng tạo cho startup công nghệ, thiết kế mở linh hoạt. Khu vực hot desk với bàn nâng hạ điện, phòng họp kính cách âm, phone booth cá nhân. Góc nghỉ ngơi với ghế treo macramé và cây xanh tropical. Bếp chung kiểu quán café với máy pha espresso chuyên nghiệp. Tường bảng phấn cho brainstorming, hệ thống đèn circadian rhythm tự động điều chỉnh theo giờ trong ngày.',
    category: 'van-phong', style: 'Creative Industrial', area: '500m²', location: 'Quận 4, TP.HCM', year: 2025, featured: false, photoStart: 30,
  },
  {
    title: 'Heritage Boutique Hotel',
    slug: 'heritage-boutique-hotel',
    desc: 'Khách sạn boutique 15 phòng trong biệt thự Pháp cổ thế kỷ 19 được trùng tu. Giữ nguyên kiến trúc gốc: trần stucco hoa văn, cửa sổ vòm, sàn gạch bông Sài Gòn xưa. Nội thất kết hợp cổ điển và đương đại: đèn chùm crystal Murano bên cạnh ghế thiết kế Scandinavian. Mỗi phòng mang tên một nhân vật lịch sử Việt Nam, trang trí tranh sơn mài và đồ gốm Bát Tràng.',
    category: 'hospitality', style: 'Heritage Contemporary', area: '600m²', location: 'Quận 3, TP.HCM', year: 2024, featured: false, photoStart: 40,
  },
  {
    title: 'Eco Garden Villa',
    slug: 'eco-garden-villa',
    desc: 'Biệt thự xanh đạt chuẩn LEED Gold với hệ thống năng lượng mặt trời tích hợp. Thiết kế passive cooling giảm 60% tiêu thụ điện năng. Vật liệu tái chế và gỗ FSC certified. Vườn thẳng đứng 3 tầng với hệ thống tưới tiết kiệm nước. Nội thất từ các thương hiệu sustainable: gỗ reclaimed, vải organic, sơn không VOC. Bể bơi tự nhiên lọc bằng cây thủy sinh thay vì hóa chất.',
    category: 'biet-thu', style: 'Sustainable Modern', area: '400m²', location: 'Thảo Điền, TP.HCM', year: 2025, featured: true, photoStart: 50,
  },
  {
    title: 'Luxury Car Showroom',
    slug: 'luxury-car-showroom',
    desc: 'Showroom ô tô hạng sang 3 tầng với thiết kế lấy cảm hứng từ đường cong khí động học. Sàn epoxy đen bóng phản chiếu, trần LED matrix tạo hiệu ứng bầu trời sao. Khu vực VIP lounge với rượu whisky bar, ghế massage Technogel và hệ thống giải trí cá nhân. Phòng cấu hình xe tương tác với màn LED cong 180 độ. Hệ thống bãi đậu xe tự động xoay turntable cho khách trải nghiệm.',
    category: 'showroom', style: 'Futuristic Luxury', area: '1200m²', location: 'Quận 2, TP.HCM', year: 2025, featured: false, photoStart: 0,
  },
  {
    title: 'Minimalist Duplex',
    slug: 'minimalist-duplex',
    desc: 'Căn hộ duplex theo triết lý less-is-more với palette đơn sắc trắng-xám-đen. Mọi thiết bị và vật dụng đều được thiết kế âm tường hoặc ẩn sau panel. Bếp không tay nắm với hệ thống push-to-open Blum. Phòng ngủ với giường platform gỗ ash Nhật, đèn đọc sách Artemide recessed. Nhà vệ sinh với toilet treo tường, lavabo âm bàn đá Corian liền mạch không mối nối.',
    category: 'can-ho-chung-cu', style: 'Extreme Minimalist', area: '110m²', location: 'Quận 1, TP.HCM', year: 2024, featured: false, photoStart: 10,
  },
  {
    title: 'Mountain Lodge',
    slug: 'mountain-lodge',
    desc: 'Nhà nghỉ trên đồi Sa Pa với kiến trúc hòa mình vào sườn núi. Khung kết cấu thép kết hợp tường đá granite địa phương và gỗ thông rừng già. Mái dốc phủ cỏ xanh tự nhiên, tạo hiệu ứng ngụy trang giữa núi rừng. Lò sưởi đá giữa phòng khách, sàn gỗ ấm với hệ thống sưởi underfloor heating. Cửa kính panorama khung sắt đen nhìn ra ruộng bậc thang Mường Hoa.',
    category: 'residential', style: 'Alpine Rustic', area: '200m²', location: 'Sa Pa, Lào Cai', year: 2025, featured: true, photoStart: 20,
  },
  {
    title: 'Fashion Concept Store',
    slug: 'fashion-concept-store',
    desc: 'Cửa hàng thời trang concept với thiết kế gallery-like, không gian mở thoáng. Hệ thống ray treo quần áo di động, bố cục thay đổi theo mùa collection. Phòng thử đồ rộng rãi với gương LED 3 mặt và ánh sáng studio chuyên nghiệp. Khu vực VIP riêng tư với sofa và champagne bar. Vật liệu chủ đạo: bê tông đánh bóng, thép không gỉ và kính mờ acid-etched, tạo nền trung tính cho sản phẩm.',
    category: 'showroom', style: 'Gallery Minimal', area: '250m²', location: 'Quận 1, TP.HCM', year: 2024, featured: false, photoStart: 30,
  },
  {
    title: 'Smart Family Home',
    slug: 'smart-family-home',
    desc: 'Nhà phố 3 tầng cho gia đình trẻ với hệ thống smart home toàn diện. Điều khiển giọng nói qua Google Home, camera AI nhận diện thành viên gia đình. Phòng trẻ em an toàn với góc bo tròn, sơn tường kháng khuẩn và hệ thống lọc không khí HEPA. Khu vực học tập chung parent-child với bàn đôi có ngăn chia. Sân thượng BBQ với vườn rau hữu cơ mini và hệ thống tưới tự động IoT.',
    category: 'residential', style: 'Smart Contemporary', area: '180m²', location: 'Quận 9, TP.HCM', year: 2025, featured: false, photoStart: 40,
  },
  {
    title: 'Dental Clinic Premium',
    slug: 'dental-clinic-premium',
    desc: 'Phòng khám nha khoa cao cấp thiết kế giảm stress cho bệnh nhân. Không gian tiếp đón như hotel lobby với tông ấm wood và green. Phòng điều trị riêng biệt, cách âm, với trần LED mô phỏng bầu trời xanh. Hệ thống giải trí cá nhân: TV trần cho bệnh nhân xem trong lúc điều trị. Khu vực khử trùng theo chuẩn quốc tế với vật liệu antibacterial surface. Phòng VIP có sofa massage chờ đợi.',
    category: 'commercial', style: 'Medical Wellness', area: '300m²', location: 'Quận 7, TP.HCM', year: 2024, featured: false, photoStart: 50,
  },
  {
    title: 'Rooftop Sky Bar',
    slug: 'rooftop-sky-bar',
    desc: 'Sky bar tầng thượng với thiết kế mở 360 độ, view toàn cảnh thành phố về đêm. Quầy bar trung tâm hình bán nguyệt bằng đá onyx backlit, phát sáng lung linh. Ghế ngồi ngoài trời chống thời tiết thương hiệu Kettal. Hệ thống mái che retractable tự động đóng mở theo thời tiết. Bể phản chiếu shallow pool tạo hiệu ứng gương phản chiếu skyline. Khu VIP cabana riêng tư với rèm vải outdoor.',
    category: 'hospitality', style: 'Urban Luxe', area: '450m²', location: 'Quận 1, TP.HCM', year: 2025, featured: true, photoStart: 0,
  },
  {
    title: 'Scandinavian Townhouse',
    slug: 'scandinavian-townhouse',
    desc: 'Nhà phố phong cách Bắc Âu với palette tông trắng-gỗ-pastel. Sàn gỗ sồi trắng rộng bản, tường sơn trắng sữa, chi tiết gỗ birch nhạt. Đồ nội thất thiết kế Đan Mạch: ghế Wishbone, đèn PH5 Louis Poulsen, kệ String System. Bếp mở với đảo bếp lớn kiêm bàn ăn sáng cho cả gia đình. Góc đọc sách ấm cúng cạnh cửa sổ lớn với ghế bành sheepskin và chăn len chunky knit.',
    category: 'residential', style: 'Scandinavian Hygge', area: '160m²', location: 'Quận 2, TP.HCM', year: 2024, featured: false, photoStart: 10,
  },
]

// --- ARTICLES (20) ---
const ARTICLES = [
  {
    title: 'Xu Hướng Nội Thất 2025: Thiên Nhiên Trong Nhà',
    slug: 'xu-huong-noi-that-2025-thien-nhien-trong-nha',
    excerpt: 'Khám phá xu hướng biophilic design — đưa thiên nhiên vào không gian sống với cây xanh, vật liệu tự nhiên và ánh sáng.',
    category: 'xu-huong-thiet-ke',
    featured: true,
    paragraphs: [
      'Năm 2025 đánh dấu sự trỗi dậy mạnh mẽ của thiết kế biophilic — triết lý đưa thiên nhiên vào trong nhà. Không chỉ đơn thuần là đặt vài chậu cây cảnh, biophilic design là sự tích hợp có hệ thống giữa yếu tố tự nhiên và kiến trúc, từ vật liệu gỗ thô, đá tự nhiên đến hệ thống cây xanh living wall quy mô lớn.',
      'Các kiến trúc sư hàng đầu Việt Nam đang áp dụng nguyên tắc này vào mọi loại hình công trình. Từ căn hộ chung cư nhỏ đến biệt thự rộng, yếu tố xanh xuất hiện dưới nhiều hình thức: sân vườn trong nhà, giếng trời lấy sáng tự nhiên, mặt tiền phủ dây leo, và bể cá koi tích hợp vào nội thất.',
      'Vật liệu được ưa chuộng nhất năm nay là gỗ tái chế, đá sa thạch, tre ép và rattan. Màu sắc chủ đạo xoay quanh tông đất: terracotta, sage green, warm beige. Đặc biệt, xu hướng "perfectly imperfect" — chấp nhận sự không hoàn hảo tự nhiên — đang dần thay thế phong cách bóng bẩy hoàn mỹ.',
    ],
    photoStart: 0,
  },
  {
    title: 'Cách Chọn Gỗ Tự Nhiên Cho Nội Thất',
    slug: 'cach-chon-go-tu-nhien-cho-noi-that',
    excerpt: 'Hướng dẫn phân biệt các loại gỗ phổ biến: óc chó, sồi, teak, ash — đặc tính, giá thành và ứng dụng phù hợp.',
    category: 'vat-lieu-chat-lieu',
    featured: false,
    paragraphs: [
      'Gỗ tự nhiên là vật liệu nội thất được ưa chuộng nhất tại Việt Nam nhờ vẻ đẹp ấm áp và độ bền cao. Tuy nhiên, với hàng chục loại gỗ khác nhau trên thị trường, việc lựa chọn đúng loại phù hợp với nhu cầu và ngân sách không hề đơn giản. Bài viết này sẽ giúp bạn phân biệt các loại gỗ phổ biến nhất.',
      'Gỗ óc chó (walnut) nổi tiếng với vân gỗ đẹp và tông màu nâu sẫm sang trọng, giá từ 25-45 triệu/m³. Gỗ sồi (oak) cứng chắc, vân thẳng đẹp, giá phải chăng hơn ở mức 15-30 triệu/m³. Gỗ teak chống nước tuyệt vời, phù hợp đồ ngoài trời và phòng tắm.',
      'Gỗ ash (tần bì) nhẹ và dẻo, lý tưởng cho đồ nội thất cong uốn. Với ngân sách hạn chế, gỗ cao su và gỗ keo là lựa chọn kinh tế nhưng vẫn đảm bảo chất lượng. Mẹo nhỏ: luôn kiểm tra chứng nhận FSC để đảm bảo gỗ khai thác bền vững, đồng thời yêu cầu nhà cung cấp cho xem mẫu gỗ thật trước khi quyết định.',
    ],
    photoStart: 5,
  },
  {
    title: 'Phong Thủy Phòng Khách: 7 Nguyên Tắc Vàng',
    slug: 'phong-thuy-phong-khach-7-nguyen-tac-vang',
    excerpt: 'Bố trí phòng khách theo phong thủy để đón tài lộc và năng lượng tích cực cho gia đình.',
    category: 'phong-thuy-nha-o',
    featured: true,
    paragraphs: [
      'Phòng khách là trung tâm năng lượng của ngôi nhà theo quan niệm phong thủy. Bố trí đúng cách không chỉ mang lại thẩm mỹ mà còn thu hút tài lộc, sức khỏe cho gia chủ. Dưới đây là 7 nguyên tắc vàng mà các chuyên gia phong thủy khuyên bạn nên áp dụng khi thiết kế nội thất phòng khách.',
      'Nguyên tắc 1: Sofa phải tựa vào tường chắc chắn, tượng trưng cho sự vững vàng. Nguyên tắc 2: Cửa chính không nên đối diện trực tiếp với cửa sau, tránh khí trường xuyên suốt. Nguyên tắc 3: Bàn trà nên có hình oval hoặc tròn để tạo sự hài hòa.',
      'Nguyên tắc 4: Gương lớn phản chiếu bàn ăn sẽ nhân đôi tài lộc. Nguyên tắc 5: Cây xanh đặt ở góc Đông Nam kích hoạt vượng khí. Nguyên tắc 6: Ánh sáng tự nhiên càng nhiều càng tốt — tránh phòng tối ám. Nguyên tắc 7: Tránh để góc nhọn của tủ, kệ hướng vào vị trí ngồi thường xuyên.',
    ],
    photoStart: 10,
  },
  {
    title: '10 Mẹo Trang Trí Phòng Ngủ Nhỏ',
    slug: '10-meo-trang-tri-phong-ngu-nho',
    excerpt: 'Biến phòng ngủ nhỏ thành không gian ấm cúng với những mẹo thiết kế thông minh, tiết kiệm chi phí.',
    category: 'meo-trang-tri',
    featured: false,
    paragraphs: [
      'Phòng ngủ nhỏ là thách thức chung của nhiều gia đình Việt, đặc biệt ở các căn hộ chung cư. Nhưng với 10 mẹo trang trí sau đây, bạn hoàn toàn có thể biến căn phòng 10-15m² thành một sanctuary ấm cúng và tiện nghi mà không cần tốn kém.',
      'Mẹo đầu tiên là sử dụng gương lớn — đặt đối diện cửa sổ để nhân đôi ánh sáng và tạo chiều sâu. Tiếp theo, chọn giường có ngăn kéo bên dưới để tối ưu lưu trữ. Kệ treo tường thay vì tủ đầu giường sẽ giải phóng diện tích sàn đáng kể.',
      'Tông màu sáng là bắt buộc: trắng, kem, pastel nhẹ giúp phòng rộng hơn. Rèm cửa treo sát trần tạo cảm giác cao ráo. Đèn LED dây ẩn sau đầu giường vừa lãng mạn vừa không chiếm không gian. Cuối cùng, hãy giữ phòng gọn gàng — ít đồ đạc hơn thực tế sẽ làm phòng trông rộng rãi hơn bất kỳ thủ thuật thiết kế nào.',
    ],
    photoStart: 15,
  },
  {
    title: 'Tủ Bếp Acrylic vs Melamine: So Sánh Chi Tiết',
    slug: 'tu-bep-acrylic-vs-melamine-so-sanh',
    excerpt: 'Phân tích ưu nhược điểm của hai vật liệu tủ bếp phổ biến nhất hiện nay để bạn đưa ra quyết định phù hợp.',
    category: 'vat-lieu-chat-lieu',
    featured: false,
    paragraphs: [
      'Trong phân khúc tủ bếp hiện đại, Acrylic và Melamine là hai vật liệu được lựa chọn nhiều nhất. Mỗi loại có ưu nhược điểm riêng, phù hợp với nhu cầu và ngân sách khác nhau. Bài viết này giúp bạn có cái nhìn toàn diện trước khi quyết định đầu tư cho căn bếp gia đình.',
      'Acrylic nổi bật với bề mặt bóng gương sang trọng, khả năng chống ẩm tốt và dễ vệ sinh. Tuy nhiên, giá thành cao hơn 30-50% so với Melamine và dễ trầy xước bề mặt. Melamine có ưu điểm đa dạng vân gỗ, giá thành hợp lý, chịu nhiệt tốt nhưng kém chống ẩm hơn ở các mối ghép.',
      'Khuyến nghị: với ngân sách trên 50 triệu và yêu cầu thẩm mỹ cao, Acrylic là lựa chọn tối ưu. Với ngân sách 25-40 triệu và ưu tiên độ bền thực dụng, Melamine chất lượng cao hoàn toàn đáp ứng nhu cầu. Quan trọng nhất, hãy chọn nhà sản xuất uy tín với phụ kiện bản lề Blum hoặc Hettich.',
    ],
    photoStart: 20,
  },
  {
    title: 'Thiết Kế Bếp Đảo: Xu Hướng Hiện Đại',
    slug: 'thiet-ke-bep-dao-xu-huong-hien-dai',
    excerpt: 'Tìm hiểu cách thiết kế bếp đảo phù hợp với không gian và phong cách sống của gia đình Việt.',
    category: 'xu-huong-thiet-ke',
    featured: true,
    paragraphs: [
      'Bếp đảo (kitchen island) đã trở thành biểu tượng của nhà bếp hiện đại, kết hợp chức năng nấu nướng, ăn uống và giao tiếp trong một không gian mở. Tại Việt Nam, xu hướng bếp đảo đang bùng nổ song song với sự phát triển của các căn hộ và nhà phố thiết kế mở.',
      'Để thiết kế bếp đảo hiệu quả, cần tối thiểu 10m² diện tích bếp và khoảng cách lưu thông 90-120cm xung quanh đảo. Mặt đảo nên sử dụng đá thạch anh (quartz) hoặc granite dày 20mm trở lên. Tích hợp bếp từ hoặc bồn rửa vào đảo tùy thói quen nấu nướng.',
      'Bếp đảo còn đóng vai trò quầy bar và bàn ăn sáng khi kết hợp phần overhang 30cm cho ghế bar. Phía dưới đảo tận dụng làm tủ chứa gia vị, rổ kéo và thùng rác phân loại. Hệ thống đèn pendant treo phía trên đảo vừa tạo điểm nhấn thẩm mỹ vừa cung cấp đủ ánh sáng cho vùng chuẩn bị thức ăn.',
    ],
    photoStart: 25,
  },
  {
    title: 'Ánh Sáng Trong Thiết Kế Nội Thất',
    slug: 'anh-sang-trong-thiet-ke-noi-that',
    excerpt: 'Nghệ thuật sử dụng ánh sáng tự nhiên và nhân tạo để tạo không gian sống đẹp và lành mạnh.',
    category: 'kien-thuc-noi-that',
    featured: false,
    paragraphs: [
      'Ánh sáng là yếu tố thiết kế mạnh mẽ nhất nhưng thường bị xem nhẹ nhất. Một căn phòng hoàn hảo về nội thất nhưng thiếu ánh sáng sẽ mất đi 70% giá trị thẩm mỹ. Ngược lại, chiếu sáng đúng cách có thể biến một không gian bình thường trở nên phi thường.',
      'Có 3 lớp ánh sáng cần thiết trong mọi không gian: ambient (tổng thể), task (chức năng) và accent (điểm nhấn). Ambient lighting từ đèn âm trần hoặc ốp trần cung cấp ánh sáng đều. Task lighting tập trung vào vùng làm việc: bàn bếp, bàn học, gương trang điểm.',
      'Accent lighting là lớp tạo chiều sâu và cảm xúc: đèn rọi tranh, LED dải dưới tủ, đèn sàn hướng tường. Nhiệt độ màu khuyến nghị: 2700K-3000K cho phòng ngủ và phòng khách (ấm), 4000K-5000K cho bếp và phòng làm việc (trắng trung tính). Luôn lắp dimmer cho phòng khách và phòng ngủ.',
    ],
    photoStart: 30,
  },
  {
    title: 'Phong Thủy Phòng Ngủ Vợ Chồng',
    slug: 'phong-thuy-phong-ngu-vo-chong',
    excerpt: 'Bí quyết bố trí phòng ngủ vợ chồng theo phong thủy để gìn giữ hạnh phúc gia đình.',
    category: 'phong-thuy-nha-o',
    featured: false,
    paragraphs: [
      'Phòng ngủ vợ chồng trong phong thủy được xem là "cung phu thê" — nơi nuôi dưỡng tình cảm và sự gắn kết. Bố trí sai có thể ảnh hưởng đến hòa khí gia đình, sức khỏe và cả tài vận. Dưới đây là những nguyên tắc phong thủy quan trọng nhất cho phòng ngủ đôi.',
      'Giường ngủ phải đặt đối xứng: hai bên đều có tủ đầu giường và đèn, tượng trưng cho sự cân bằng âm dương. Đầu giường tựa vào tường chắc, không đặt dưới dầm hoặc đối diện cửa toilet. Gương trong phòng ngủ nên tránh phản chiếu trực tiếp giường nằm.',
      'Màu sắc phòng ngủ vợ chồng nên dùng tông ấm nhẹ: hồng pastel, be ấm, lavender nhạt. Tránh tông quá lạnh như xanh dương đậm hoặc trắng tinh. Đặt một cặp vật phẩm phong thủy (mandarin duck, hình đôi) ở góc Tây Nam phòng để tăng cường tình duyên. Tuyệt đối không trưng bày hình ảnh người thứ ba hoặc tranh phong cảnh cô đơn.',
    ],
    photoStart: 35,
  },
  {
    title: 'Câu Chuyện: Biến Nhà Cũ 30 Năm Thành Biệt Thự Hiện Đại',
    slug: 'bien-nha-cu-30-nam-thanh-biet-thu-hien-dai',
    excerpt: 'Hành trình cải tạo ngôi nhà ống 30 tuổi tại Quận 3 thành không gian sống đương đại đầy bất ngờ.',
    category: 'cau-chuyen-du-an',
    featured: true,
    paragraphs: [
      'Khi anh Minh liên hệ VietNet Interior, ngôi nhà ống 4x18m của anh tại Quận 3 đã xuống cấp nghiêm trọng sau 30 năm sử dụng. Trần thấp, tường ẩm mốc, hệ thống điện nước cũ kỹ. Thách thức lớn nhất: giữ lại kết cấu chịu lực gốc trong khi thay đổi hoàn toàn không gian bên trong.',
      'Đội ngũ kiến trúc sư đã quyết định phá bỏ tường ngăn không chịu lực, tạo không gian mở thông thoáng. Giếng trời được mở rộng gấp đôi, đưa ánh sáng tự nhiên len lỏi đến tầng trệt. Cầu thang cũ thay bằng cầu thang thép nhẹ với bậc gỗ lơ lửng, tạo cảm giác bay bổng.',
      'Sau 4 tháng thi công, ngôi nhà cũ kỹ đã lột xác hoàn toàn. Phòng khách tầng trệt nối liền sân vườn mini với cây xanh và tiểu cảnh nước. Bếp mở kiểu Nhật với quầy bar gỗ walnut. Chi phí cải tạo 1.8 tỷ — tiết kiệm 40% so với xây mới nhưng giá trị thẩm mỹ không hề thua kém.',
    ],
    photoStart: 40,
  },
  {
    title: 'Đá Thạch Anh vs Granite: Chọn Mặt Bếp Nào?',
    slug: 'da-thach-anh-vs-granite-chon-mat-bep-nao',
    excerpt: 'So sánh toàn diện hai loại đá phổ biến nhất cho mặt bếp, giúp bạn chọn đúng cho gian bếp gia đình.',
    category: 'vat-lieu-chat-lieu',
    featured: false,
    paragraphs: [
      'Mặt bếp là yếu tố chịu tác động nhiều nhất trong gian bếp: nhiệt độ cao, hóa chất tẩy rửa, va đập dao kéo. Đá thạch anh (quartz) và granite là hai lựa chọn hàng đầu, mỗi loại có ưu thế riêng mà người tiêu dùng cần cân nhắc kỹ.',
      'Granite là đá tự nhiên 100%, mỗi tấm có vân hoa độc nhất vô nhị — đây là điểm mạnh lớn nhất. Tuy nhiên, granite có lỗ khí nhỏ cần trám sealant định kỳ mỗi 1-2 năm, dễ thấm dầu mỡ nếu không bảo trì. Giá granite tự nhiên dao động 3-8 triệu/m² tùy loại.',
      'Đá thạch anh nhân tạo có độ cứng cao hơn, không cần trám sealant, kháng khuẩn tự nhiên và đa dạng màu sắc đồng nhất. Nhược điểm: không chịu nhiệt trực tiếp quá 150°C và giá cao hơn granite 20-30%. Khuyến nghị: granite cho phong cách classic sang trọng, quartz cho nhà bếp hiện đại và gia đình có trẻ nhỏ.',
    ],
    photoStart: 45,
  },
  {
    title: 'Trang Trí Nhà Với Cây Xanh Indoor',
    slug: 'trang-tri-nha-voi-cay-xanh-indoor',
    excerpt: 'Gợi ý 15 loại cây cảnh trong nhà dễ chăm sóc, phù hợp với khí hậu Việt Nam và đẹp mọi phong cách.',
    category: 'meo-trang-tri',
    featured: true,
    paragraphs: [
      'Cây xanh indoor không chỉ trang trí mà còn lọc không khí, giảm stress và tăng năng suất làm việc theo nhiều nghiên cứu khoa học. Tại Việt Nam với khí hậu nhiệt đới, nhiều loại cây indoor phát triển rất tốt mà không cần quá nhiều chăm sóc.',
      'Top 5 cây dễ sống nhất: Lưỡi hổ (sansevieria) chịu bóng tối, ít tưới. Trầu bà (pothos) leo giàn đẹp, lọc formaldehyde. Monstera lá to bản statement piece cho phòng khách. Kim tiền (ZZ plant) chịu khô, hợp phong thủy. Đuôi công (calathea) lá đẹp nghệ thuật cho phòng ngủ.',
      'Mẹo trồng: dùng chậu có lỗ thoát nước, đất trộn perlite giữ ẩm thoáng khí. Đặt khay sỏi ẩm bên dưới chậu trong phòng máy lạnh để tăng độ ẩm. Xoay chậu 90 độ mỗi tuần để cây phát triển đều. Bón phân hữu cơ pha loãng 2 tuần/lần trong mùa tăng trưởng (tháng 3-10).',
    ],
    photoStart: 50,
  },
  {
    title: 'Kiến Thức Cơ Bản Về Sàn Gỗ',
    slug: 'kien-thuc-co-ban-ve-san-go',
    excerpt: 'Phân biệt sàn gỗ tự nhiên, engineered và laminate — ưu nhược điểm và cách chọn phù hợp.',
    category: 'kien-thuc-noi-that',
    featured: false,
    paragraphs: [
      'Sàn gỗ mang lại vẻ đẹp ấm áp và sang trọng cho mọi không gian. Tuy nhiên, với ba loại chính trên thị trường — gỗ tự nhiên, engineered wood và laminate — nhiều gia chủ vẫn phân vân không biết chọn loại nào phù hợp.',
      'Sàn gỗ tự nhiên: nguyên khối 100% gỗ, vân đẹp tự nhiên, có thể mài lại nhiều lần. Giá 800k-2.5 triệu/m². Nhược điểm: dễ cong vênh trong môi trường ẩm, cần bảo trì định kỳ. Sàn engineered: lớp mặt gỗ thật dày 2-6mm trên nền HDF, ổn định kích thước tốt hơn. Giá 500k-1.5 triệu/m².',
      'Sàn laminate: hoàn toàn nhân tạo, in vân gỗ trên nền HDF, phủ melamine chống trầy. Giá chỉ 200-500k/m² nhưng không thể mài lại và kém chịu ẩm. Khuyến nghị: sàn engineered là lựa chọn tối ưu cho khí hậu Việt Nam — vừa đẹp tự nhiên, vừa ổn định, giá hợp lý.',
    ],
    photoStart: 55,
  },
  {
    title: 'Phong Thủy Cửa Chính: Đón Tài Lộc',
    slug: 'phong-thuy-cua-chinh-don-tai-loc',
    excerpt: 'Hướng cửa, kích thước, màu sắc và vật phẩm phong thủy phù hợp cho cửa chính nhà ở.',
    category: 'phong-thuy-nha-o',
    featured: false,
    paragraphs: [
      'Cửa chính trong phong thủy được ví như "miệng" của ngôi nhà — nơi thu nhận khí lực từ bên ngoài vào. Một cửa chính được bố trí đúng phong thủy sẽ đón nhiều vượng khí, tài lộc và sức khỏe cho gia chủ.',
      'Hướng cửa chính tối ưu phụ thuộc vào mệnh của gia chủ theo Bát Trạch. Tuy nhiên, nguyên tắc chung: cửa nên mở vào trong (đón khí), không đối diện trực tiếp với thang máy, cầu thang hay cột điện. Kích thước cửa theo thước Lỗ Ban — chọn cung Tài hoặc cung Nghĩa.',
      'Màu sắc cửa: đỏ sậm hoặc nâu gỗ cho hướng Nam, trắng hoặc vàng kim cho hướng Tây, xanh lá hoặc nâu cho hướng Đông. Trước cửa nên có không gian mở (minh đường) để khí tụ lại. Đặt chậu cây xanh hai bên cửa hoặc tượng tỳ hưu nhìn ra ngoài để trấn giữ và thu hút tài khí.',
    ],
    photoStart: 0,
  },
  {
    title: 'DIY: Tự Làm Kệ Gỗ Treo Tường',
    slug: 'diy-tu-lam-ke-go-treo-tuong',
    excerpt: 'Hướng dẫn chi tiết cách tự làm kệ gỗ treo tường đẹp mà đơn giản, chỉ cần dụng cụ cơ bản.',
    category: 'meo-trang-tri',
    featured: false,
    paragraphs: [
      'Kệ gỗ treo tường là item trang trí dễ làm nhất cho người mới bắt đầu DIY. Với chi phí chỉ từ 200-500k và vài giờ làm việc cuối tuần, bạn có thể tạo ra những chiếc kệ độc đáo, cá tính cho góc nhà yêu thích.',
      'Vật liệu cần: tấm gỗ thông 15x2cm dài theo ý (thường 60-80cm), bát sắt L hoặc dây thừng, vít nở tường, giấy nhám P120-P240, sơn lót gỗ và sơn phủ màu yêu thích. Dụng cụ: khoan pin, thước thủy, bút chì, giấy nhám.',
      'Bước làm: 1) Cắt gỗ theo kích thước, nhám mịn bề mặt. 2) Sơn lót, đợi khô 2h, nhám nhẹ rồi sơn phủ 2 lớp. 3) Đo và đánh dấu vị trí treo trên tường bằng thước thủy. 4) Khoan lỗ, đặt nở nhựa, vặn vít bát sắt L. 5) Đặt kệ lên bát L, cố định bằng vít nhỏ từ dưới lên. Mẹo: dùng 3 bát L cho kệ dài trên 70cm để tránh võng.',
    ],
    photoStart: 5,
  },
  {
    title: 'Câu Chuyện: Penthouse Trên Mây',
    slug: 'cau-chuyen-penthouse-tren-may',
    excerpt: 'Dự án penthouse tầng 35 với thách thức đưa hơn 200 món nội thất lên đỉnh tòa nhà.',
    category: 'cau-chuyen-du-an',
    featured: false,
    paragraphs: [
      'Dự án penthouse Riverside là một trong những thử thách lớn nhất mà đội ngũ VietNet Interior từng đối mặt. Căn hộ 320m² ở tầng 35, toàn bộ nội thất phải vận chuyển bằng thang máy với cabin chỉ 2.1x1.5m. Sofa 3m, bàn ăn 2.4m, tủ quần áo 2.8m — không món nào lọt thang.',
      'Giải pháp: thiết kế nội thất modular — mọi món đồ lớn đều được chia thành các module có thể lắp ráp tại chỗ. Sofa section 3 khối ghép, bàn ăn mặt 2 tấm nối bằng khớp cam ẩn. Tủ quần áo flat-pack với hệ thống chốt chính xác, lắp đặt không cần keo.',
      'Kết quả sau 6 tuần lắp đặt: 247 món nội thất được đưa lên và lắp ráp hoàn hảo. Gia chủ chia sẻ: "Chúng tôi không thể tin đây là nội thất lắp ráp — mọi mối nối đều khít và chắc chắn như một khối nguyên bản." Dự án này đã mở ra hướng đi mới cho VietNet trong phân khúc nội thất cao tầng.',
    ],
    photoStart: 10,
  },
  {
    title: 'Xu Hướng Màu Sắc Nội Thất 2025-2026',
    slug: 'xu-huong-mau-sac-noi-that-2025-2026',
    excerpt: 'Những gam màu lên ngôi trong thiết kế nội thất: Earth Tones, Moody Blues và Warm Metallics.',
    category: 'xu-huong-thiet-ke',
    featured: false,
    paragraphs: [
      'Pantone đã công bố màu của năm 2025 là "Mocha Mousse" — tông nâu kem ấm áp, phản ánh xu hướng quay về với thiên nhiên. Trong nội thất, gam màu này dẫn đầu làn sóng Earth Tones đang thống lĩnh các dự án thiết kế từ Bắc Âu đến Đông Nam Á.',
      'Ba palette màu chủ đạo: 1) Earth Tones — terracotta, olive, warm beige, chocolate — tạo không gian ấm cúng, kết nối thiên nhiên. 2) Moody Blues — navy, teal, dusty blue — mang lại chiều sâu và sự sang trọng cho phòng ngủ và thư phòng.',
      '3) Warm Metallics — brushed brass, copper rose, antique gold — thay thế chrome lạnh bằng ánh kim ấm áp trên tay nắm, đèn và phụ kiện. Cách phối: dùng 60-30-10 rule — 60% màu nền trung tính, 30% màu phụ và 10% accent color tạo điểm nhấn. Tránh dùng quá 3 màu chính trong một không gian.',
    ],
    photoStart: 15,
  },
  {
    title: 'Thiết Kế Home Office Hiệu Quả',
    slug: 'thiet-ke-home-office-hieu-qua',
    excerpt: 'Tạo không gian làm việc tại nhà vừa năng suất vừa thẩm mỹ — từ chọn bàn ghế đến bố trí ánh sáng.',
    category: 'kien-thuc-noi-that',
    featured: true,
    paragraphs: [
      'Làm việc từ xa đã trở thành bình thường mới, và home office không còn là góc bàn tạm bợ. Một không gian làm việc được thiết kế bài bản sẽ tăng năng suất 20-30% theo nghiên cứu, đồng thời bảo vệ sức khỏe cột sống và mắt khi ngồi nhiều giờ.',
      'Bàn làm việc lý tưởng cao 72-76cm, rộng tối thiểu 120x60cm. Ghế ergonomic với tựa lưng mesh, tay vịn điều chỉnh và hỗ trợ lumbar là đầu tư quan trọng nhất. Bàn nâng hạ (standing desk) cho phép thay đổi tư thế làm việc xuyên suốt ngày.',
      'Ánh sáng: đèn bàn LED 4000K đặt bên tay không thuận để tránh bóng đổ. Màn hình nên đặt cách mắt 50-70cm, đỉnh màn ngang tầm mắt. Tường phía sau nên sạch sẽ cho video call — một tấm panel gỗ hoặc kệ sách gọn gàng tạo background chuyên nghiệp.',
    ],
    photoStart: 20,
  },
  {
    title: 'Bí Quyết Chọn Rèm Cửa Đẹp',
    slug: 'bi-quyet-chon-rem-cua-dep',
    excerpt: 'Từ rèm vải đến rèm gỗ, hướng dẫn chọn chất liệu, màu sắc và kiểu dáng rèm phù hợp.',
    category: 'meo-trang-tri',
    featured: false,
    paragraphs: [
      'Rèm cửa chiếm diện tích thị giác lớn nhất trong phòng — chọn sai rèm có thể phá hỏng toàn bộ thiết kế nội thất. Ngược lại, rèm đẹp và phù hợp sẽ nâng tầm không gian một cách kỳ diệu mà không cần thay đổi bất kỳ đồ nội thất nào khác.',
      'Quy tắc vàng: treo rèm sát trần (không phải sát cửa sổ) để tạo cảm giác cao ráo. Rèm phải chạm sàn hoặc dài hơn sàn 2-3cm (kiểu puddle) cho phong cách sang trọng. Chiều rộng rèm gấp 1.5-2 lần chiều rộng cửa sổ để có nếp gấp đẹp.',
      'Chất liệu: vải linen cho phong cách tự nhiên, velvet cho sang trọng, voile cho nhẹ nhàng thoáng đãng. Rèm gỗ (wooden blinds) phù hợp phòng làm việc và bếp. Rèm cuốn (roller) gọn gàng cho không gian tối giản. Màu rèm nên cùng tông hoặc đậm hơn 1-2 shade so với tường để tạo chiều sâu.',
    ],
    photoStart: 25,
  },
  {
    title: 'Smart Home: Nhà Thông Minh Cho Mọi Nhà',
    slug: 'smart-home-nha-thong-minh-cho-moi-nha',
    excerpt: 'Hướng dẫn xây dựng hệ thống smart home từ cơ bản đến nâng cao, phù hợp ngân sách Việt.',
    category: 'kien-thuc-noi-that',
    featured: false,
    paragraphs: [
      'Smart home không còn là công nghệ xa xỉ — với ngân sách từ 5-15 triệu, bạn đã có thể tự động hóa nhiều chức năng trong nhà. Từ bật tắt đèn bằng giọng nói đến điều khiển điều hòa khi chưa về nhà, smart home mang lại tiện nghi thực sự cho cuộc sống hàng ngày.',
      'Bước 1: Chọn nền tảng — Google Home, Apple HomeKit hoặc Tuya. Google Home phổ biến nhất tại Việt Nam nhờ hỗ trợ tiếng Việt và thiết bị giá rẻ. Bước 2: Bắt đầu với đèn thông minh (Philips Hue hoặc Yeelight) và ổ cắm WiFi — đơn giản nhất để trải nghiệm.',
      'Bước 3: Thêm camera an ninh WiFi và chuông cửa video. Bước 4: Rèm cửa điện tử với motor Dooya hoặc Aqara. Bước 5: Khóa cửa vân tay. Lưu ý quan trọng: đảm bảo WiFi phủ sóng toàn nhà bằng mesh router, và luôn chọn thiết bị cùng hệ sinh thái để tương thích tối ưu.',
    ],
    photoStart: 30,
  },
  {
    title: 'Câu Chuyện: Quán Café Trong Nhà Máy Cũ',
    slug: 'cau-chuyen-quan-cafe-trong-nha-may-cu',
    excerpt: 'Biến nhà máy dệt bỏ hoang thành quán café industrial chic nổi tiếng khắp mạng xã hội.',
    category: 'cau-chuyen-du-an',
    featured: true,
    paragraphs: [
      'Nhà máy dệt An Phú tại Bình Dương bỏ hoang 15 năm, mái tôn rỉ sét, tường gạch nứt nẻ. Chủ đầu tư muốn giữ lại "hồn" công nghiệp nhưng biến nó thành không gian F&B hấp dẫn giới trẻ. Thách thức: ngân sách giới hạn, kết cấu yếu, không có hệ thống cơ điện.',
      'Đội ngũ VietNet quyết định phương châm "giữ tối đa, thêm tối thiểu". Tường gạch giữ nguyên vẻ thô mộc, chỉ chống thấm và phun chất bảo vệ. Kèo thép mái được giữ lộ thiên, sơn đen nhấn mạnh kết cấu. Sàn bê tông đánh bóng tại chỗ, chi phí chỉ bằng 1/3 lát gạch mới.',
      'Nội thất mới thêm vào mang phong cách tái chế: bàn ghế từ pallet gỗ, đèn từ ống nước sắt, quầy bar từ container cũ cắt đôi. Khu vườn xanh giữa nhà máy với cây xanh nhiệt đới và tiểu cảnh nước. Tổng chi phí 2.3 tỷ — tiết kiệm 60% so với xây mới. Quán mở cửa 3 tháng đã lọt top trending trên Instagram.',
    ],
    photoStart: 35,
  },
]

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function seed() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || process.env.DB_USER || 'vietnet',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'vietnet_dev',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'vietnet',
    synchronize: false,
  })

  await ds.initialize()
  console.log('Connected to database.')

  // Get admin user
  const [admin] = await ds.query(
    "SELECT id FROM users WHERE role = 'super_admin' LIMIT 1",
  )
  if (!admin) {
    console.error('No admin user found. Run seed-admin.ts first.')
    await ds.destroy()
    process.exit(1)
  }
  const adminId = admin.id

  // ── CATEGORIES ────────────────────────────────────────────
  console.log('\n=== Seeding Categories ===')
  const catIds: Record<string, string> = {}

  for (const cat of CATEGORIES) {
    const [existing] = await ds.query(
      'SELECT id FROM categories WHERE slug = ? AND type = ? AND deleted_at IS NULL',
      [cat.slug, cat.type],
    )
    if (existing) {
      catIds[cat.slug] = existing.id
      console.log(`  [skip] ${cat.name} (${cat.type})`)
      continue
    }
    const id = ulid()
    await ds.query(
      `INSERT INTO categories (id, name, slug, type, display_order, is_active, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW())`,
      [id, cat.name, cat.slug, cat.type, cat.order, adminId],
    )
    catIds[cat.slug] = id
    console.log(`  [new] ${cat.name} (${cat.type})`)
  }

  // ── HELPER: Insert media record ───────────────────────────
  async function insertMedia(photoIdx: number, altText: string): Promise<string> {
    const id = ulid()
    const url = photoUrl(photoIdx)
    const thumb = thumbUrl(photoIdx)
    const preview = previewUrl(photoIdx)
    await ds.query(
      `INSERT INTO media (id, original_filename, mime_type, file_size, original_url, thumbnail_url, preview_url,
        width, height, alt_text, processing_status, uploaded_by, created_at)
       VALUES (?, ?, 'image/jpeg', 150000, ?, ?, ?, 1200, 800, ?, 'completed', ?, NOW())`,
      [id, `demo-${photoIdx}.jpg`, url, thumb, preview, altText, adminId],
    )
    return id
  }

  // ── PROJECTS ──────────────────────────────────────────────
  console.log('\n=== Seeding Projects (20) ===')

  for (let pi = 0; pi < PROJECTS.length; pi++) {
    const p = PROJECTS[pi]
    const [existing] = await ds.query(
      'SELECT id FROM projects WHERE slug = ? AND deleted_at IS NULL',
      [p.slug],
    )
    if (existing) {
      console.log(`  [skip] ${p.title}`)
      continue
    }

    // Tao 10 media records cho project
    const mediaIds: string[] = []
    for (let i = 0; i < 10; i++) {
      const mid = await insertMedia(p.photoStart + i, `${p.title} - Hình ${i + 1}`)
      mediaIds.push(mid)
    }

    // Tao TipTap content tu description
    const contentParagraphs = p.desc.split('. ').reduce((acc: string[], sent, idx) => {
      const groupIdx = Math.floor(idx / 3)
      if (!acc[groupIdx]) acc[groupIdx] = ''
      acc[groupIdx] += (acc[groupIdx] ? '. ' : '') + sent
      return acc
    }, [])
    const contentImages = mediaIds.slice(0, 5).map((_, i) => photoUrl(p.photoStart + i))
    const content = tiptapDoc(contentParagraphs, contentImages)

    const catSlug = p.category
    const catId = catIds[catSlug] || null
    const projectId = ulid()

    await ds.query(
      `INSERT INTO projects (id, title, slug, description, content, category_id, style, area, location, year_completed,
        cover_image_id, status, published_at, is_featured, display_order, view_count, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), ?, ?, ?, ?, NOW(), NOW())`,
      [projectId, p.title, p.slug, p.desc, content, catId, p.style, p.area, p.location, p.year,
        mediaIds[0], p.featured ? 1 : 0, pi, Math.floor(Math.random() * 500) + 50, adminId],
    )

    // Tao project gallery (10 anh)
    for (let gi = 0; gi < mediaIds.length; gi++) {
      const galleryId = ulid()
      await ds.query(
        `INSERT INTO project_gallery (id, project_id, media_id, display_order, caption, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [galleryId, projectId, mediaIds[gi], gi, `${p.title} - Góc nhìn ${gi + 1}`],
      )
    }

    console.log(`  [new] ${p.title} (${mediaIds.length} images)`)
  }

  // ── ARTICLES ──────────────────────────────────────────────
  console.log('\n=== Seeding Articles (20) ===')

  for (let ai = 0; ai < ARTICLES.length; ai++) {
    const a = ARTICLES[ai]
    const [existing] = await ds.query(
      'SELECT id FROM articles WHERE slug = ? AND deleted_at IS NULL',
      [a.slug],
    )
    if (existing) {
      console.log(`  [skip] ${a.title}`)
      continue
    }

    // Tao 10 media records cho article
    const mediaIds: string[] = []
    for (let i = 0; i < 10; i++) {
      const mid = await insertMedia(a.photoStart + i, `${a.title} - Hình ${i + 1}`)
      mediaIds.push(mid)
    }

    // Tao TipTap content voi hinh anh xen ke
    const contentImages = mediaIds.map((_, i) => photoUrl(a.photoStart + i))
    const content = tiptapDoc(a.paragraphs, contentImages)

    const catSlug = a.category
    const catId = catIds[catSlug] || null
    const articleId = ulid()

    await ds.query(
      `INSERT INTO articles (id, title, slug, excerpt, content, category_id, cover_image_id,
        status, published_at, is_featured, display_order, view_count, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', NOW(), ?, ?, ?, ?, NOW(), NOW())`,
      [articleId, a.title, a.slug, a.excerpt, content, catId, mediaIds[0],
        a.featured ? 1 : 0, ai, Math.floor(Math.random() * 300) + 20, adminId],
    )

    console.log(`  [new] ${a.title} (${mediaIds.length} images)`)
  }

  // ── Update existing articles/projects: them cover image va content neu chua co ──
  console.log('\n=== Updating existing records without content/cover ===')
  const oldArticles = await ds.query(
    "SELECT id, title, slug FROM articles WHERE (content IS NULL OR cover_image_id IS NULL) AND deleted_at IS NULL",
  )
  for (const art of oldArticles) {
    const photoIdx = Math.floor(Math.random() * 40)
    if (!art.cover_image_id) {
      const coverId = await insertMedia(photoIdx, `${art.title} - Cover`)
      await ds.query('UPDATE articles SET cover_image_id = ? WHERE id = ?', [coverId, art.id])
    }
    if (!art.content) {
      const defaultContent = tiptapDoc(
        ['Đây là nội dung mẫu cho bài viết. Nội dung chi tiết sẽ được cập nhật sau.'],
        [photoUrl(photoIdx)],
      )
      await ds.query('UPDATE articles SET content = ? WHERE id = ?', [defaultContent, art.id])
    }
    console.log(`  [updated] ${art.title}`)
  }

  const oldProjects = await ds.query(
    "SELECT id, title, slug FROM projects WHERE cover_image_id IS NULL AND deleted_at IS NULL",
  )
  for (const proj of oldProjects) {
    const photoIdx = Math.floor(Math.random() * 40)
    const coverId = await insertMedia(photoIdx, `${proj.title} - Cover`)
    await ds.query('UPDATE projects SET cover_image_id = ? WHERE id = ?', [coverId, proj.id])
    console.log(`  [updated cover] ${proj.title}`)
  }

  // ── Summary ───────────────────────────────────────────────
  const [catCount] = await ds.query('SELECT COUNT(*) as cnt FROM categories WHERE deleted_at IS NULL')
  const [projCount] = await ds.query('SELECT COUNT(*) as cnt FROM projects WHERE deleted_at IS NULL')
  const [artCount] = await ds.query('SELECT COUNT(*) as cnt FROM articles WHERE deleted_at IS NULL')
  const [mediaCount] = await ds.query('SELECT COUNT(*) as cnt FROM media WHERE deleted_at IS NULL')

  console.log('\n=== Seed Summary ===')
  console.log(`  Categories: ${catCount.cnt}`)
  console.log(`  Projects:   ${projCount.cnt}`)
  console.log(`  Articles:   ${artCount.cnt}`)
  console.log(`  Media:      ${mediaCount.cnt}`)
  console.log('\nSeed completed successfully!')

  await ds.destroy()
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
