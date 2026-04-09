/**
 * Generate SQL for seed demo data.
 * Run: node src/scripts/gen-seed-sql.js > seed-demo.sql
 */
const { ulid } = require('ulid');

const PHOTO_IDS = [
  '1502672260266-1c1ef2d93688','1618221195710-dd6b41faaea6','1600210492486-724fe5c67fb3',
  '1560448204771-d60f0e1a26c0','1616486338812-3dadae4b4ace','1600607687939-ce8a6c25118c',
  '1615529182904-14819c35db37','1631679706909-1844bbd07221','1556909114-f6e7ad7d3136',
  '1600585154340-be6161a56a0c','1586023492125-27b2012f8222','1583847268964-b28dc8f51f92',
  '1600566753190-17f0baa2a6c3','1600573472592-401b489a3cdc','1565182999561-18d7dc61c393',
  '1600121848594-d8644e57abab','1555041469-a586c61ea9bc','1600566753086-00f18fb6b03d',
  '1600210491369-e753d80a41f3','1560185127-6ed189bf02f4','1507089947017-82a3e86e0df3',
  '1484154218962-a197022b5858','1540518614846-7eded433c457','1571624436279-b272aff752b5',
  '1513694203232-719a280e022f','1560185007-cde436f6670d','1505693416388-ac5ce068fe85',
  '1560440021-5f092f8aa458','1536437075651-01d7a4e4a3b7','1560184897-ae75f418493e',
  '1556761175-b413da4baf72','1560185893-39b5c0ef5a1a','1574739782594-db4ead022697',
  '1600607687644-aac5c9cced2d','1600607688969-a5bfcd646154','1595526114035-0d45ed16cfbf',
  '1600047509807-ba8f99d2cdde','1560184990-de6fdf71e5e7','1600566752355-35792bedcfea',
  '1598928506311-aab7ecc834e0','1556909212-d5b604d0c90d','1596900779744-2bdc4a90509a',
  '1560185009-5bf9f2ce0d03','1560185008-b033106af763','1600585153490-76fb20a32601',
  '1615874694520-41b8fbb0d1ba','1618219908412-a29a1bb7b86c','1556909078-e5b2e5d0d342',
  '1600047508788-786f3865b4b7','1560185007-5f0bb1866cab','1600563438749-a0e77bd2afab',
  '1617103996702-96ff29b1c467','1600210491892-bc01cff441e9','1594026112284-02bb6f3352fe',
  '1560184611-c0e94e4cc498','1600210492493-b930ee81dbf5','1597218868981-1b68e15f0065',
  '1560185008-a33f5c7a8e09','1615873968403-f9e601145c1d','1618219740975-d40978bb7378',
];

function photoUrl(i, w, h) {
  w = w || 1200; h = h || 800;
  const id = PHOTO_IDS[i % PHOTO_IDS.length];
  return 'https://images.unsplash.com/photo-' + id + '?w=' + w + '&h=' + h + '&fit=crop&q=80&auto=format';
}

function esc(s) {
  if (!s) return '';
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function tiptapDoc(paragraphs, imageUrls) {
  const content = [];
  paragraphs.forEach(function(text, i) {
    content.push({ type: 'paragraph', content: [{ type: 'text', text: text }] });
    if (imageUrls[i]) {
      content.push({ type: 'image', attrs: { src: imageUrls[i], alt: 'Hinh minh hoa ' + (i + 1) } });
    }
  });
  for (var i = paragraphs.length; i < imageUrls.length; i++) {
    content.push({ type: 'image', attrs: { src: imageUrls[i], alt: 'Hinh minh hoa ' + (i + 1) } });
  }
  return JSON.stringify({ type: 'doc', content: content });
}

var out = [];
function sql(s) { out.push(s); }

sql('SET NAMES utf8mb4;');
sql("SET @admin_id = (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1);");
sql('');

// ── CATEGORIES ──
var CATEGORIES = [
  { name: 'Residential', slug: 'residential', type: 'project', order: 1 },
  { name: 'Commercial', slug: 'commercial', type: 'project', order: 2 },
  { name: 'Hospitality', slug: 'hospitality', type: 'project', order: 3 },
  { name: 'Căn Hộ Chung Cư', slug: 'can-ho-chung-cu', type: 'project', order: 4 },
  { name: 'Biệt Thự', slug: 'biet-thu', type: 'project', order: 5 },
  { name: 'Văn Phòng', slug: 'van-phong', type: 'project', order: 6 },
  { name: 'Showroom', slug: 'showroom', type: 'project', order: 7 },
  { name: 'Tủ bếp gỗ', slug: 'tu-bep-go', type: 'product', order: 1 },
  { name: 'Tủ bếp Acrylic', slug: 'tu-bep-acrylic', type: 'product', order: 2 },
  { name: 'Tủ bếp Melamine', slug: 'tu-bep-melamine', type: 'product', order: 3 },
  { name: 'Tủ Quần Áo', slug: 'tu-quan-ao', type: 'product', order: 4 },
  { name: 'Kệ TV & Trang Trí', slug: 'ke-tv-trang-tri', type: 'product', order: 5 },
  { name: 'Bàn Làm Việc', slug: 'ban-lam-viec', type: 'product', order: 6 },
  { name: 'Giường Ngủ', slug: 'giuong-ngu', type: 'product', order: 7 },
  { name: 'Xu Hướng Thiết Kế', slug: 'xu-huong-thiet-ke', type: 'article', order: 1 },
  { name: 'Kiến Thức Nội Thất', slug: 'kien-thuc-noi-that', type: 'article', order: 2 },
  { name: 'Phong Thủy Nhà Ở', slug: 'phong-thuy-nha-o', type: 'article', order: 3 },
  { name: 'Mẹo Trang Trí', slug: 'meo-trang-tri', type: 'article', order: 4 },
  { name: 'Vật Liệu & Chất Liệu', slug: 'vat-lieu-chat-lieu', type: 'article', order: 5 },
  { name: 'Câu Chuyện Dự Án', slug: 'cau-chuyen-du-an', type: 'article', order: 6 },
];

sql('-- CATEGORIES');
CATEGORIES.forEach(function(cat) {
  var id = ulid();
  sql("INSERT INTO categories (id, name, slug, type, display_order, is_active, created_by, created_at, updated_at) SELECT '" + id + "', '" + esc(cat.name) + "', '" + cat.slug + "', '" + cat.type + "', " + cat.order + ", 1, @admin_id, NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug='" + cat.slug + "' AND type='" + cat.type + "' AND deleted_at IS NULL);");
});
sql('');

// ── PROJECTS (20) ──
var PROJECTS = [
  { title: 'Saigon Serenity Villa', slug: 'saigon-serenity-villa', desc: 'Biệt thự sang trọng mang phong cách Zen hiện đại tại Quận 2, TP.HCM. Không gian mở tối đa hóa ánh sáng tự nhiên, kết hợp vật liệu gỗ óc chó nhập khẩu và đá marble Ý. Hệ thống ánh sáng thông minh được tích hợp đồng bộ, tạo nên bầu không khí thư thái cho gia chủ. Khu vực bếp đảo trung tâm sử dụng mặt đá granite nguyên khối.', cat: 'biet-thu', style: 'Modern Zen', area: '280m²', loc: 'Quận 2, TP.HCM', year: 2025, feat: 1, ps: 0 },
  { title: 'Grand Oak Executive Suite', slug: 'grand-oak-executive-suite', desc: 'Văn phòng giám đốc điều hành với nội thất gỗ sồi nguyên khối. Thiết kế tối giản nhưng sang trọng, phản ánh đẳng cấp doanh nhân. Bàn làm việc 2.4m bằng gỗ walnut, tủ sách dọc tường cao 3m với đèn LED tích hợp. Khu vực tiếp khách riêng biệt với sofa da Ý, bàn trà đá cẩm thạch.', cat: 'van-phong', style: 'Executive Minimalist', area: '150m²', loc: 'Quận 1, TP.HCM', year: 2024, feat: 1, ps: 10 },
  { title: 'Emerald Lake Kitchen', slug: 'emerald-lake-kitchen', desc: 'Nhà bếp resort cao cấp bên hồ với tầm nhìn panorama tuyệt đẹp. Sử dụng đá tự nhiên và hệ tủ bếp gỗ walnut nhập từ Bắc Mỹ. Thiết bị nhà bếp thương hiệu Miele và Sub-Zero tích hợp ẩn sau panel gỗ. Quầy bar mini với hệ thống rượu vang điều khiển nhiệt độ tự động.', cat: 'hospitality', style: 'Resort Contemporary', area: '120m²', loc: 'Đà Lạt, Lâm Đồng', year: 2025, feat: 1, ps: 20 },
  { title: 'Vintage Loft Master', slug: 'vintage-loft-master', desc: 'Căn hộ duplex phong cách vintage công nghiệp tại Phú Mỹ Hưng. Tường gạch trần nguyên bản kết hợp hệ thống ống thép lộ thiên sơn đen. Cầu thang xoắn sắt rèn nghệ thuật nối hai tầng, lan can kính cường lực trong suốt. Phòng ngủ tầng lửng với trần dốc và cửa sổ mái lấy sáng tự nhiên.', cat: 'can-ho-chung-cu', style: 'Industrial Vintage', area: '95m²', loc: 'Quận 7, TP.HCM', year: 2024, feat: 0, ps: 30 },
  { title: 'Riverside Penthouse', slug: 'riverside-penthouse', desc: 'Penthouse đẳng cấp tầng 35 với view sông Sài Gòn 270 độ. Phòng khách double-height 7m, tường kính floor-to-ceiling. Nội thất Art Deco đương đại với chất liệu vàng đồng và velvet xanh ngọc. Phòng tắm master sử dụng đá onyx nguyên khối, bồn tắm freestanding Villeroy & Boch.', cat: 'can-ho-chung-cu', style: 'Art Deco Modern', area: '320m²', loc: 'Bình Thạnh, TP.HCM', year: 2025, feat: 1, ps: 40 },
  { title: 'Coastal Retreat House', slug: 'coastal-retreat-house', desc: 'Nhà nghỉ dưỡng ven biển phong cách Địa Trung Hải, tọa lạc trên đồi nhìn ra Vịnh Nha Trang. Tường sơn trắng kết hợp gỗ teak chống mặn, mái ngói đất nung thủ công. Hiên ngoài rộng 40m² với bể bơi tràn bờ infinity pool. Nội thất chất liệu tự nhiên: mây tre đan, vải lanh Bỉ.', cat: 'biet-thu', style: 'Mediterranean Coastal', area: '350m²', loc: 'Nha Trang, Khánh Hòa', year: 2024, feat: 0, ps: 50 },
  { title: 'Urban Micro Studio', slug: 'urban-micro-studio', desc: 'Giải pháp thiết kế thông minh cho căn hộ studio 35m² tại Quận 3. Hệ thống nội thất đa năng: giường Murphy gấp gọn, bàn ăn mở rộng từ kệ TV, bếp ẩn sau cánh cửa trượt. Gương lớn và tông màu sáng tạo cảm giác rộng rãi gấp đôi. Mỗi góc nhỏ được tận dụng với ngăn kéo âm tường.', cat: 'can-ho-chung-cu', style: 'Smart Compact', area: '35m²', loc: 'Quận 3, TP.HCM', year: 2025, feat: 0, ps: 0 },
  { title: 'Japanese Tea House', slug: 'japanese-tea-house', desc: 'Trà thất phong cách Nhật Bản giữa Thủ Đức, thiết kế theo triết lý Wabi-sabi. Vật liệu thô mộc: gỗ thông tự nhiên, đá suối, giấy shoji truyền thống. Không gian tatami với bàn trà thấp, hốc tường tokonoma trưng bày cắm hoa ikebana. Vườn đá Zen bao quanh với rêu và sỏi trắng xếp hình sóng.', cat: 'hospitality', style: 'Japanese Wabi-sabi', area: '60m²', loc: 'Thủ Đức, TP.HCM', year: 2025, feat: 1, ps: 10 },
  { title: 'Luxury Spa Resort', slug: 'luxury-spa-resort', desc: 'Khu spa nghỉ dưỡng 5 sao với 12 phòng trị liệu riêng biệt. Mỗi phòng thiết kế theo chủ đề thiên nhiên: rừng nhiệt đới, đại dương, sa mạc, hoa anh đào. Vật liệu đá bazan núi lửa và gỗ tràm Phú Quốc. Bể ngâm onsen ngoài trời nhìn ra rừng dừa, aromatherapy tinh dầu Việt Nam.', cat: 'hospitality', style: 'Tropical Wellness', area: '800m²', loc: 'Phú Quốc, Kiên Giang', year: 2024, feat: 1, ps: 20 },
  { title: 'Startup Creative Hub', slug: 'startup-creative-hub', desc: 'Không gian coworking sáng tạo cho startup công nghệ. Khu hot desk với bàn nâng hạ điện, phòng họp kính cách âm, phone booth cá nhân. Góc nghỉ ngơi với ghế treo macramé và cây xanh tropical. Bếp chung kiểu café với máy pha espresso chuyên nghiệp. Tường bảng phấn cho brainstorming.', cat: 'van-phong', style: 'Creative Industrial', area: '500m²', loc: 'Quận 4, TP.HCM', year: 2025, feat: 0, ps: 30 },
  { title: 'Heritage Boutique Hotel', slug: 'heritage-boutique-hotel', desc: 'Khách sạn boutique 15 phòng trong biệt thự Pháp cổ thế kỷ 19. Giữ nguyên kiến trúc gốc: trần stucco hoa văn, cửa sổ vòm, sàn gạch bông Sài Gòn xưa. Nội thất kết hợp cổ điển và đương đại: đèn chùm crystal Murano bên cạnh ghế Scandinavian. Mỗi phòng mang tên nhân vật lịch sử.', cat: 'hospitality', style: 'Heritage Contemporary', area: '600m²', loc: 'Quận 3, TP.HCM', year: 2024, feat: 0, ps: 40 },
  { title: 'Eco Garden Villa', slug: 'eco-garden-villa', desc: 'Biệt thự xanh đạt chuẩn LEED Gold với năng lượng mặt trời tích hợp. Thiết kế passive cooling giảm 60% tiêu thụ điện. Vật liệu tái chế và gỗ FSC certified. Vườn thẳng đứng 3 tầng với hệ thống tưới tiết kiệm nước. Bể bơi tự nhiên lọc bằng cây thủy sinh thay vì hóa chất.', cat: 'biet-thu', style: 'Sustainable Modern', area: '400m²', loc: 'Thảo Điền, TP.HCM', year: 2025, feat: 1, ps: 50 },
  { title: 'Luxury Car Showroom', slug: 'luxury-car-showroom', desc: 'Showroom ô tô hạng sang 3 tầng lấy cảm hứng từ đường cong khí động học. Sàn epoxy đen bóng phản chiếu, trần LED matrix tạo hiệu ứng bầu trời sao. Khu VIP lounge với whisky bar, ghế massage Technogel. Phòng cấu hình xe tương tác với màn LED cong 180 độ.', cat: 'showroom', style: 'Futuristic Luxury', area: '1200m²', loc: 'Quận 2, TP.HCM', year: 2025, feat: 0, ps: 0 },
  { title: 'Minimalist Duplex', slug: 'minimalist-duplex', desc: 'Căn hộ duplex theo triết lý less-is-more với palette trắng-xám-đen. Mọi thiết bị được thiết kế âm tường hoặc ẩn sau panel. Bếp không tay nắm với push-to-open Blum. Phòng ngủ với giường platform gỗ ash Nhật, đèn đọc sách Artemide recessed. Nhà vệ sinh toilet treo tường, lavabo âm bàn đá Corian.', cat: 'can-ho-chung-cu', style: 'Extreme Minimalist', area: '110m²', loc: 'Quận 1, TP.HCM', year: 2024, feat: 0, ps: 10 },
  { title: 'Mountain Lodge', slug: 'mountain-lodge', desc: 'Nhà nghỉ trên đồi Sa Pa hòa mình vào sườn núi. Khung thép kết hợp tường đá granite địa phương và gỗ thông rừng già. Mái dốc phủ cỏ xanh tự nhiên. Lò sưởi đá giữa phòng khách, sàn gỗ ấm với sưởi underfloor heating. Cửa kính panorama khung sắt đen nhìn ra ruộng bậc thang Mường Hoa.', cat: 'residential', style: 'Alpine Rustic', area: '200m²', loc: 'Sa Pa, Lào Cai', year: 2025, feat: 1, ps: 20 },
  { title: 'Fashion Concept Store', slug: 'fashion-concept-store', desc: 'Cửa hàng thời trang concept với thiết kế gallery-like. Hệ thống ray treo quần áo di động, bố cục thay đổi theo mùa collection. Phòng thử đồ rộng rãi với gương LED 3 mặt và ánh sáng studio. Khu VIP riêng tư với sofa và champagne bar. Vật liệu: bê tông đánh bóng và kính acid-etched.', cat: 'showroom', style: 'Gallery Minimal', area: '250m²', loc: 'Quận 1, TP.HCM', year: 2024, feat: 0, ps: 30 },
  { title: 'Smart Family Home', slug: 'smart-family-home', desc: 'Nhà phố 3 tầng cho gia đình trẻ với smart home toàn diện. Điều khiển giọng nói qua Google Home, camera AI nhận diện gia đình. Phòng trẻ em an toàn với góc bo tròn, sơn kháng khuẩn. Khu vực học tập parent-child với bàn đôi. Sân thượng BBQ với vườn rau hữu cơ mini và tưới IoT.', cat: 'residential', style: 'Smart Contemporary', area: '180m²', loc: 'Quận 9, TP.HCM', year: 2025, feat: 0, ps: 40 },
  { title: 'Dental Clinic Premium', slug: 'dental-clinic-premium', desc: 'Phòng khám nha khoa cao cấp thiết kế giảm stress. Không gian tiếp đón như hotel lobby với tông ấm wood và green. Phòng điều trị riêng biệt, cách âm, trần LED mô phỏng bầu trời xanh. TV trần cho bệnh nhân xem trong lúc điều trị. Khu vực khử trùng chuẩn quốc tế.', cat: 'commercial', style: 'Medical Wellness', area: '300m²', loc: 'Quận 7, TP.HCM', year: 2024, feat: 0, ps: 50 },
  { title: 'Rooftop Sky Bar', slug: 'rooftop-sky-bar', desc: 'Sky bar tầng thượng thiết kế mở 360 độ, view toàn cảnh thành phố. Quầy bar bán nguyệt bằng đá onyx backlit phát sáng. Ghế ngoài trời chống thời tiết Kettal. Mái che retractable tự động. Bể phản chiếu shallow pool tạo gương phản chiếu skyline. Khu VIP cabana riêng tư.', cat: 'hospitality', style: 'Urban Luxe', area: '450m²', loc: 'Quận 1, TP.HCM', year: 2025, feat: 1, ps: 0 },
  { title: 'Scandinavian Townhouse', slug: 'scandinavian-townhouse', desc: 'Nhà phố phong cách Bắc Âu với palette trắng-gỗ-pastel. Sàn gỗ sồi trắng rộng bản, tường trắng sữa, chi tiết gỗ birch nhạt. Nội thất Đan Mạch: ghế Wishbone, đèn PH5 Louis Poulsen, kệ String System. Bếp mở với đảo bếp lớn kiêm bàn ăn sáng cho cả gia đình.', cat: 'residential', style: 'Scandinavian Hygge', area: '160m²', loc: 'Quận 2, TP.HCM', year: 2024, feat: 0, ps: 10 },
];

sql('-- PROJECTS');
PROJECTS.forEach(function(p, pi) {
  sql('-- Project: ' + p.title);
  sql("SET @proj_exists = (SELECT COUNT(*) FROM projects WHERE slug='" + p.slug + "' AND deleted_at IS NULL);");

  var mediaIds = [];
  for (var i = 0; i < 10; i++) {
    var mid = ulid();
    mediaIds.push(mid);
    var pidx = p.ps + i;
    sql("INSERT INTO media (id, original_filename, mime_type, file_size, original_url, thumbnail_url, preview_url, width, height, alt_text, processing_status, uploaded_by, created_at) SELECT '" + mid + "', 'demo-" + pidx + ".jpg', 'image/jpeg', 150000, '" + esc(photoUrl(pidx)) + "', '" + esc(photoUrl(pidx, 300, 300)) + "', '" + esc(photoUrl(pidx, 800, 600)) + "', 1200, 800, '" + esc(p.title + ' - Hinh ' + (i+1)) + "', 'completed', @admin_id, NOW() FROM DUAL WHERE @proj_exists = 0;");
  }

  var imgs = [];
  for (var i = 0; i < 5; i++) imgs.push(photoUrl(p.ps + i));
  var content = tiptapDoc([p.desc], imgs);
  var projId = ulid();
  var catRef = "(SELECT id FROM categories WHERE slug='" + p.cat + "' AND deleted_at IS NULL LIMIT 1)";
  var views = Math.floor(Math.random() * 500) + 50;

  sql("INSERT INTO projects (id, title, slug, description, content, category_id, style, area, location, year_completed, cover_image_id, status, published_at, is_featured, display_order, view_count, created_by, created_at, updated_at) SELECT '" + projId + "', '" + esc(p.title) + "', '" + p.slug + "', '" + esc(p.desc) + "', '" + esc(content) + "', " + catRef + ", '" + esc(p.style) + "', '" + p.area + "', '" + esc(p.loc) + "', " + p.year + ", '" + mediaIds[0] + "', 'published', NOW(), " + p.feat + ", " + pi + ", " + views + ", @admin_id, NOW(), NOW() FROM DUAL WHERE @proj_exists = 0;");

  for (var gi = 0; gi < mediaIds.length; gi++) {
    var gid = ulid();
    sql("INSERT INTO project_gallery (id, project_id, media_id, display_order, caption, created_at) SELECT '" + gid + "', '" + projId + "', '" + mediaIds[gi] + "', " + gi + ", '" + esc(p.title + ' - Goc nhin ' + (gi+1)) + "', NOW() FROM DUAL WHERE @proj_exists = 0;");
  }
  sql('');
});

// ── ARTICLES (20) ──
var ARTICLES = [
  { title: 'Xu Hướng Nội Thất 2025: Thiên Nhiên Trong Nhà', slug: 'xu-huong-noi-that-2025-thien-nhien-trong-nha', excerpt: 'Khám phá xu hướng biophilic design đưa thiên nhiên vào không gian sống.', cat: 'xu-huong-thiet-ke', feat: 1, ps: 0, paras: ['Năm 2025 đánh dấu sự trỗi dậy mạnh mẽ của thiết kế biophilic — triết lý đưa thiên nhiên vào trong nhà. Không chỉ đơn thuần đặt vài chậu cây cảnh, biophilic design là sự tích hợp có hệ thống giữa yếu tố tự nhiên và kiến trúc, từ vật liệu gỗ thô, đá tự nhiên đến hệ thống cây xanh living wall quy mô lớn.','Các kiến trúc sư Việt Nam đang áp dụng nguyên tắc này vào mọi loại hình công trình. Từ căn hộ chung cư đến biệt thự, yếu tố xanh xuất hiện: sân vườn trong nhà, giếng trời, mặt tiền dây leo, bể cá koi tích hợp nội thất.','Vật liệu được ưa chuộng nhất: gỗ tái chế, đá sa thạch, tre ép và rattan. Màu sắc chủ đạo: terracotta, sage green, warm beige. Xu hướng "perfectly imperfect" đang thay thế phong cách bóng bẩy hoàn mỹ.'] },
  { title: 'Cách Chọn Gỗ Tự Nhiên Cho Nội Thất', slug: 'cach-chon-go-tu-nhien-cho-noi-that', excerpt: 'Hướng dẫn phân biệt các loại gỗ phổ biến và ứng dụng phù hợp.', cat: 'vat-lieu-chat-lieu', feat: 0, ps: 5, paras: ['Gỗ tự nhiên là vật liệu nội thất được ưa chuộng nhất tại Việt Nam nhờ vẻ đẹp ấm áp và độ bền cao. Với hàng chục loại gỗ trên thị trường, việc lựa chọn đúng loại phù hợp nhu cầu và ngân sách không hề đơn giản.','Gỗ óc chó (walnut): vân đẹp, tông nâu sẫm, giá 25-45 triệu/m³. Gỗ sồi (oak): cứng chắc, vân thẳng, 15-30 triệu/m³. Gỗ teak: chống nước tuyệt vời, phù hợp ngoài trời.','Gỗ ash nhẹ và dẻo, lý tưởng cho đồ cong uốn. Ngân sách hạn chế thì gỗ cao su, gỗ keo là lựa chọn kinh tế. Mẹo: luôn kiểm tra chứng nhận FSC đảm bảo khai thác bền vững.'] },
  { title: 'Phong Thủy Phòng Khách: 7 Nguyên Tắc Vàng', slug: 'phong-thuy-phong-khach-7-nguyen-tac-vang', excerpt: 'Bố trí phòng khách theo phong thủy để đón tài lộc cho gia đình.', cat: 'phong-thuy-nha-o', feat: 1, ps: 10, paras: ['Phòng khách là trung tâm năng lượng ngôi nhà theo phong thủy. Bố trí đúng cách không chỉ mang lại thẩm mỹ mà còn thu hút tài lộc, sức khỏe cho gia chủ. Đây là 7 nguyên tắc vàng.','Nguyên tắc 1: Sofa tựa vào tường chắc chắn. Nguyên tắc 2: Cửa chính không đối diện cửa sau. Nguyên tắc 3: Bàn trà hình oval hoặc tròn tạo hài hòa. Nguyên tắc 4: Gương phản chiếu bàn ăn nhân đôi tài lộc.','Nguyên tắc 5: Cây xanh góc Đông Nam kích hoạt vượng khí. Nguyên tắc 6: Ánh sáng tự nhiên càng nhiều càng tốt. Nguyên tắc 7: Tránh góc nhọn hướng vào vị trí ngồi thường xuyên.'] },
  { title: '10 Mẹo Trang Trí Phòng Ngủ Nhỏ', slug: '10-meo-trang-tri-phong-ngu-nho', excerpt: 'Biến phòng ngủ nhỏ thành không gian ấm cúng với mẹo thiết kế thông minh.', cat: 'meo-trang-tri', feat: 0, ps: 15, paras: ['Phòng ngủ nhỏ là thách thức chung của nhiều gia đình Việt. Nhưng với 10 mẹo trang trí thông minh, bạn có thể biến căn phòng 10-15m² thành sanctuary ấm cúng và tiện nghi mà không tốn kém.','Gương lớn đối diện cửa sổ nhân đôi ánh sáng. Giường có ngăn kéo tối ưu lưu trữ. Kệ treo tường thay tủ đầu giường giải phóng diện tích sàn đáng kể.','Tông sáng bắt buộc: trắng, kem, pastel. Rèm treo sát trần tạo cảm giác cao ráo. Đèn LED dây sau đầu giường vừa lãng mạn vừa tiết kiệm không gian. Giữ phòng gọn gàng là mẹo hiệu quả nhất.'] },
  { title: 'Tủ Bếp Acrylic vs Melamine: So Sánh', slug: 'tu-bep-acrylic-vs-melamine-so-sanh', excerpt: 'Phân tích ưu nhược điểm hai vật liệu tủ bếp phổ biến nhất.', cat: 'vat-lieu-chat-lieu', feat: 0, ps: 20, paras: ['Trong phân khúc tủ bếp hiện đại, Acrylic và Melamine là hai vật liệu được chọn nhiều nhất. Mỗi loại có ưu nhược điểm riêng, phù hợp nhu cầu và ngân sách khác nhau.','Acrylic bóng gương sang trọng, chống ẩm tốt, dễ vệ sinh nhưng giá cao hơn 30-50% và dễ trầy. Melamine đa dạng vân gỗ, giá hợp lý, chịu nhiệt tốt nhưng kém chống ẩm ở mối ghép.','Trên 50 triệu + thẩm mỹ cao: chọn Acrylic. Ngân sách 25-40 triệu + thực dụng: Melamine chất lượng cao. Quan trọng: chọn nhà sản xuất uy tín với phụ kiện Blum hoặc Hettich.'] },
  { title: 'Thiết Kế Bếp Đảo: Xu Hướng Hiện Đại', slug: 'thiet-ke-bep-dao-xu-huong-hien-dai', excerpt: 'Cách thiết kế bếp đảo phù hợp không gian gia đình Việt.', cat: 'xu-huong-thiet-ke', feat: 1, ps: 25, paras: ['Bếp đảo đã trở thành biểu tượng nhà bếp hiện đại, kết hợp nấu nướng, ăn uống và giao tiếp trong không gian mở. Tại Việt Nam, xu hướng này đang bùng nổ cùng sự phát triển của căn hộ thiết kế mở.','Cần tối thiểu 10m² diện tích bếp và khoảng cách lưu thông 90-120cm quanh đảo. Mặt đảo nên dùng đá thạch anh hoặc granite dày 20mm. Tích hợp bếp từ hoặc bồn rửa tùy thói quen nấu nướng.','Bếp đảo còn là quầy bar và bàn ăn sáng khi có phần overhang 30cm. Phía dưới tận dụng tủ chứa gia vị, rổ kéo, thùng rác phân loại. Đèn pendant phía trên tạo điểm nhấn thẩm mỹ.'] },
  { title: 'Ánh Sáng Trong Thiết Kế Nội Thất', slug: 'anh-sang-trong-thiet-ke-noi-that', excerpt: 'Nghệ thuật sử dụng ánh sáng tạo không gian sống đẹp.', cat: 'kien-thuc-noi-that', feat: 0, ps: 30, paras: ['Ánh sáng là yếu tố thiết kế mạnh mẽ nhất nhưng thường bị xem nhẹ. Một căn phòng hoàn hảo về nội thất nhưng thiếu sáng sẽ mất 70% giá trị thẩm mỹ. Chiếu sáng đúng cách biến không gian bình thường trở nên phi thường.','3 lớp ánh sáng cần thiết: ambient (tổng thể) từ đèn âm trần, task (chức năng) cho bàn bếp/bàn học, accent (điểm nhấn) như đèn rọi tranh hay LED dải dưới tủ.','Nhiệt độ màu khuyến nghị: 2700K-3000K cho phòng ngủ/khách (ấm), 4000K-5000K cho bếp/làm việc (trắng trung tính). Luôn lắp dimmer cho phòng khách và phòng ngủ.'] },
  { title: 'Phong Thủy Phòng Ngủ Vợ Chồng', slug: 'phong-thuy-phong-ngu-vo-chong', excerpt: 'Bí quyết bố trí phòng ngủ vợ chồng theo phong thủy.', cat: 'phong-thuy-nha-o', feat: 0, ps: 35, paras: ['Phòng ngủ vợ chồng trong phong thủy là "cung phu thê" — nuôi dưỡng tình cảm và gắn kết. Bố trí sai ảnh hưởng hòa khí gia đình, sức khỏe và tài vận.','Giường đặt đối xứng: hai bên đều có tủ đầu giường và đèn, tượng trưng cân bằng âm dương. Đầu giường tựa tường chắc, không đặt dưới dầm hoặc đối diện cửa toilet.','Tông ấm nhẹ: hồng pastel, be ấm, lavender nhạt. Đặt cặp vật phẩm phong thủy ở góc Tây Nam phòng tăng tình duyên. Tuyệt đối không trưng tranh phong cảnh cô đơn.'] },
  { title: 'Biến Nhà Cũ 30 Năm Thành Biệt Thự', slug: 'bien-nha-cu-30-nam-thanh-biet-thu-hien-dai', excerpt: 'Hành trình cải tạo ngôi nhà ống 30 tuổi tại Quận 3.', cat: 'cau-chuyen-du-an', feat: 1, ps: 40, paras: ['Ngôi nhà ống 4x18m tại Quận 3 đã xuống cấp nghiêm trọng sau 30 năm. Trần thấp, tường ẩm mốc, hệ thống điện nước cũ kỹ. Thách thức: giữ kết cấu chịu lực gốc, thay đổi toàn bộ bên trong.','Phá tường ngăn không chịu lực tạo không gian mở. Giếng trời mở rộng gấp đôi. Cầu thang thép nhẹ với bậc gỗ lơ lửng tạo cảm giác bay bổng.','Sau 4 tháng: phòng khách nối liền sân vườn mini, bếp mở kiểu Nhật với quầy bar walnut. Chi phí 1.8 tỷ — tiết kiệm 40% so với xây mới, giá trị thẩm mỹ không thua kém.'] },
  { title: 'Đá Thạch Anh vs Granite: Chọn Mặt Bếp', slug: 'da-thach-anh-vs-granite-chon-mat-bep-nao', excerpt: 'So sánh hai loại đá phổ biến nhất cho mặt bếp.', cat: 'vat-lieu-chat-lieu', feat: 0, ps: 45, paras: ['Mặt bếp chịu tác động nhiều nhất: nhiệt độ cao, hóa chất, va đập dao kéo. Đá thạch anh và granite là hai lựa chọn hàng đầu, mỗi loại có ưu thế riêng.','Granite tự nhiên 100%, vân hoa độc nhất. Nhưng có lỗ khí cần trám sealant định kỳ, dễ thấm dầu mỡ. Giá 3-8 triệu/m² tùy loại.','Thạch anh nhân tạo cứng hơn, không cần sealant, kháng khuẩn. Nhưng không chịu nhiệt trực tiếp trên 150°C, giá cao hơn granite 20-30%. Granite cho classic, quartz cho hiện đại.'] },
  { title: 'Trang Trí Nhà Với Cây Xanh Indoor', slug: 'trang-tri-nha-voi-cay-xanh-indoor', excerpt: '15 loại cây cảnh indoor dễ chăm, phù hợp khí hậu Việt Nam.', cat: 'meo-trang-tri', feat: 1, ps: 50, paras: ['Cây xanh indoor không chỉ trang trí mà còn lọc không khí và giảm stress. Khí hậu nhiệt đới Việt Nam giúp nhiều loại cây indoor phát triển rất tốt mà không cần quá nhiều chăm sóc.','Top 5 dễ sống: Lưỡi hổ chịu bóng tối, ít tưới. Trầu bà leo giàn đẹp, lọc formaldehyde. Monstera lá to statement piece. Kim tiền chịu khô, hợp phong thủy. Đuôi công lá đẹp nghệ thuật.','Mẹo: chậu có lỗ thoát nước, đất trộn perlite. Khay sỏi ẩm trong phòng máy lạnh. Xoay chậu 90 độ mỗi tuần. Bón phân hữu cơ pha loãng 2 tuần/lần mùa tăng trưởng.'] },
  { title: 'Kiến Thức Cơ Bản Về Sàn Gỗ', slug: 'kien-thuc-co-ban-ve-san-go', excerpt: 'Phân biệt sàn gỗ tự nhiên, engineered và laminate.', cat: 'kien-thuc-noi-that', feat: 0, ps: 55, paras: ['Sàn gỗ mang vẻ đẹp ấm áp cho mọi không gian. Ba loại chính: gỗ tự nhiên, engineered wood và laminate — mỗi loại có đặc điểm riêng.','Gỗ tự nhiên: nguyên khối 100%, vân đẹp, mài lại được, giá 800k-2.5 triệu/m² nhưng dễ cong vênh ẩm. Engineered: lớp mặt gỗ thật trên nền HDF, ổn định, giá 500k-1.5 triệu/m².','Laminate: nhân tạo, in vân gỗ, giá 200-500k/m² nhưng không mài lại được. Khuyến nghị: sàn engineered tối ưu cho khí hậu Việt Nam — đẹp tự nhiên, ổn định, giá hợp lý.'] },
  { title: 'Phong Thủy Cửa Chính: Đón Tài Lộc', slug: 'phong-thuy-cua-chinh-don-tai-loc', excerpt: 'Hướng cửa, kích thước, màu sắc phù hợp cho cửa chính.', cat: 'phong-thuy-nha-o', feat: 0, ps: 0, paras: ['Cửa chính trong phong thủy là "miệng" ngôi nhà — nơi thu nhận khí lực bên ngoài. Cửa chính bố trí đúng sẽ đón nhiều vượng khí, tài lộc và sức khỏe cho gia chủ.','Hướng cửa tối ưu phụ thuộc mệnh gia chủ. Nguyên tắc chung: cửa mở vào trong (đón khí), không đối diện thang máy, cầu thang hay cột điện. Kích thước theo thước Lỗ Ban.','Màu cửa: đỏ sậm cho hướng Nam, trắng/vàng kim hướng Tây, xanh lá hướng Đông. Trước cửa có không gian mở (minh đường) để khí tụ. Cây xanh hai bên cửa thu hút tài khí.'] },
  { title: 'DIY: Tự Làm Kệ Gỗ Treo Tường', slug: 'diy-tu-lam-ke-go-treo-tuong', excerpt: 'Hướng dẫn làm kệ gỗ treo tường đẹp và đơn giản.', cat: 'meo-trang-tri', feat: 0, ps: 5, paras: ['Kệ gỗ treo tường là item DIY dễ nhất cho người mới. Chi phí 200-500k và vài giờ cuối tuần, bạn có thể tạo ra kệ độc đáo, cá tính cho góc nhà yêu thích.','Vật liệu: gỗ thông 15x2cm dài 60-80cm, bát sắt L, vít nở tường, giấy nhám P120-P240, sơn lót và sơn phủ. Dụng cụ: khoan pin, thước thủy, bút chì.','Bước: 1) Cắt gỗ, nhám mịn. 2) Sơn lót, khô 2h, sơn phủ 2 lớp. 3) Đo và đánh dấu trên tường. 4) Khoan lỗ, đặt nở, vặn bát L. 5) Đặt kệ và cố định. Mẹo: 3 bát L cho kệ trên 70cm.'] },
  { title: 'Penthouse Trên Mây: Câu Chuyện Dự Án', slug: 'cau-chuyen-penthouse-tren-may', excerpt: 'Thách thức đưa 200 món nội thất lên tầng 35.', cat: 'cau-chuyen-du-an', feat: 0, ps: 10, paras: ['Penthouse Riverside 320m² tầng 35 — toàn bộ nội thất phải qua thang máy cabin 2.1x1.5m. Sofa 3m, bàn ăn 2.4m, tủ 2.8m — không món nào lọt thang. Thử thách lớn nhất của VietNet.','Giải pháp: nội thất modular — mọi món lớn chia thành module lắp ráp tại chỗ. Sofa 3 khối ghép, bàn ăn 2 tấm nối khớp cam ẩn. Tủ flat-pack với hệ thống chốt chính xác.','Sau 6 tuần: 247 món lắp ráp hoàn hảo. Gia chủ: "Không thể tin là nội thất lắp ráp — mọi mối nối khít như nguyên bản." Mở hướng mới cho VietNet ở phân khúc cao tầng.'] },
  { title: 'Xu Hướng Màu Sắc Nội Thất 2025-2026', slug: 'xu-huong-mau-sac-noi-that-2025-2026', excerpt: 'Earth Tones, Moody Blues và Warm Metallics lên ngôi.', cat: 'xu-huong-thiet-ke', feat: 0, ps: 15, paras: ['Pantone công bố màu năm 2025 "Mocha Mousse" — nâu kem ấm áp, phản ánh xu hướng quay về thiên nhiên trong nội thất. Gam màu này dẫn đầu Earth Tones đang thống lĩnh thiết kế.','Ba palette chủ đạo: 1) Earth Tones — terracotta, olive, warm beige — ấm cúng, kết nối thiên nhiên. 2) Moody Blues — navy, teal, dusty blue — chiều sâu và sang trọng.','3) Warm Metallics — brushed brass, copper rose — thay thế chrome lạnh. Phối: 60-30-10 rule — 60% nền trung tính, 30% phụ, 10% accent. Tối đa 3 màu chính một không gian.'] },
  { title: 'Thiết Kế Home Office Hiệu Quả', slug: 'thiet-ke-home-office-hieu-qua', excerpt: 'Không gian làm việc tại nhà vừa năng suất vừa đẹp.', cat: 'kien-thuc-noi-that', feat: 1, ps: 20, paras: ['Làm việc từ xa là bình thường mới. Home office thiết kế bài bản tăng năng suất 20-30% theo nghiên cứu, đồng thời bảo vệ sức khỏe khi ngồi nhiều giờ.','Bàn cao 72-76cm, rộng tối thiểu 120x60cm. Ghế ergonomic mesh, tay vịn điều chỉnh, hỗ trợ lumbar — đầu tư quan trọng nhất. Standing desk cho phép thay đổi tư thế.','Đèn bàn LED 4000K bên tay không thuận. Màn hình cách mắt 50-70cm, đỉnh ngang tầm mắt. Tường phía sau sạch cho video call — panel gỗ hoặc kệ sách gọn tạo background chuyên nghiệp.'] },
  { title: 'Bí Quyết Chọn Rèm Cửa Đẹp', slug: 'bi-quyet-chon-rem-cua-dep', excerpt: 'Chọn chất liệu, màu sắc và kiểu dáng rèm phù hợp.', cat: 'meo-trang-tri', feat: 0, ps: 25, paras: ['Rèm cửa chiếm diện tích thị giác lớn nhất trong phòng — chọn sai phá hỏng thiết kế. Rèm đẹp phù hợp nâng tầm không gian kỳ diệu mà không cần thay đồ nội thất nào.','Quy tắc vàng: treo sát trần, rèm chạm sàn hoặc dài hơn 2-3cm. Chiều rộng gấp 1.5-2 lần cửa sổ cho nếp gấp đẹp. Kiểu puddle cho sang trọng.','Linen cho tự nhiên, velvet cho sang trọng, voile cho nhẹ nhàng. Rèm gỗ cho phòng làm việc. Màu rèm đậm hơn 1-2 shade so với tường để tạo chiều sâu.'] },
  { title: 'Smart Home: Nhà Thông Minh Cho Mọi Nhà', slug: 'smart-home-nha-thong-minh-cho-moi-nha', excerpt: 'Xây dựng smart home từ 5-15 triệu, phù hợp ngân sách.', cat: 'kien-thuc-noi-that', feat: 0, ps: 30, paras: ['Smart home không còn xa xỉ — 5-15 triệu đủ tự động hóa nhiều chức năng. Bật đèn bằng giọng nói, điều khiển điều hòa từ xa, kiểm tra camera an ninh mọi lúc mọi nơi.','Google Home phổ biến nhất Việt Nam nhờ hỗ trợ tiếng Việt. Bắt đầu đèn thông minh và ổ cắm WiFi — đơn giản nhất. Thêm camera, rèm điện tử, khóa vân tay.','Quan trọng: WiFi mesh phủ toàn nhà, chọn thiết bị cùng hệ sinh thái. Automation scene: "Về nhà" bật đèn + điều hòa + mở rèm, "Đi ngủ" tắt tất cả + khóa cửa + bật camera.'] },
  { title: 'Quán Café Trong Nhà Máy Cũ', slug: 'cau-chuyen-quan-cafe-trong-nha-may-cu', excerpt: 'Biến nhà máy bỏ hoang thành quán café industrial chic.', cat: 'cau-chuyen-du-an', feat: 1, ps: 35, paras: ['Nhà máy dệt An Phú bỏ hoang 15 năm tại Bình Dương. Chủ đầu tư muốn giữ "hồn" công nghiệp nhưng biến thành F&B hấp dẫn giới trẻ. Thách thức: ngân sách hạn chế, kết cấu yếu.','Phương châm "giữ tối đa, thêm tối thiểu". Tường gạch giữ nguyên. Kèo thép mái sơn đen nhấn mạnh. Sàn bê tông đánh bóng chi phí 1/3 lát gạch mới.','Nội thất tái chế: bàn ghế pallet, đèn ống nước sắt, quầy bar container cắt đôi. Tổng 2.3 tỷ — tiết kiệm 60% xây mới. 3 tháng lọt top trending Instagram.'] },
];

sql('-- ARTICLES');
ARTICLES.forEach(function(a, ai) {
  sql('-- Article: ' + a.title);
  sql("SET @art_exists = (SELECT COUNT(*) FROM articles WHERE slug='" + a.slug + "' AND deleted_at IS NULL);");

  var mediaIds = [];
  for (var i = 0; i < 10; i++) {
    var mid = ulid();
    mediaIds.push(mid);
    var pidx = a.ps + i;
    sql("INSERT INTO media (id, original_filename, mime_type, file_size, original_url, thumbnail_url, preview_url, width, height, alt_text, processing_status, uploaded_by, created_at) SELECT '" + mid + "', 'demo-art-" + pidx + ".jpg', 'image/jpeg', 120000, '" + esc(photoUrl(pidx)) + "', '" + esc(photoUrl(pidx, 300, 300)) + "', '" + esc(photoUrl(pidx, 800, 600)) + "', 1200, 800, '" + esc(a.title + ' - Hinh ' + (i+1)) + "', 'completed', @admin_id, NOW() FROM DUAL WHERE @art_exists = 0;");
  }

  var imgs = mediaIds.map(function(_, i) { return photoUrl(a.ps + i); });
  var content = tiptapDoc(a.paras, imgs);
  var catRef = "(SELECT id FROM categories WHERE slug='" + a.cat + "' AND deleted_at IS NULL LIMIT 1)";
  var artId = ulid();
  var views = Math.floor(Math.random() * 300) + 20;

  sql("INSERT INTO articles (id, title, slug, excerpt, content, category_id, cover_image_id, status, published_at, is_featured, display_order, view_count, created_by, created_at, updated_at) SELECT '" + artId + "', '" + esc(a.title) + "', '" + a.slug + "', '" + esc(a.excerpt) + "', '" + esc(content) + "', " + catRef + ", '" + mediaIds[0] + "', 'published', NOW(), " + a.feat + ", " + ai + ", " + views + ", @admin_id, NOW(), NOW() FROM DUAL WHERE @art_exists = 0;");
  sql('');
});

// ── Update old records ──
sql('-- UPDATE OLD RECORDS');
for (var i = 0; i < 5; i++) {
  var mid = ulid();
  var pidx = 40 + i;
  sql("SET @old_id = (SELECT id FROM articles WHERE cover_image_id IS NULL AND deleted_at IS NULL LIMIT 1);");
  sql("INSERT INTO media (id, original_filename, mime_type, file_size, original_url, thumbnail_url, preview_url, width, height, alt_text, processing_status, uploaded_by, created_at) SELECT '" + mid + "', 'old-cover-" + i + ".jpg', 'image/jpeg', 120000, '" + esc(photoUrl(pidx)) + "', '" + esc(photoUrl(pidx, 300, 300)) + "', '" + esc(photoUrl(pidx, 800, 600)) + "', 1200, 800, 'Article cover', 'completed', @admin_id, NOW() FROM DUAL WHERE @old_id IS NOT NULL;");
  sql("UPDATE articles SET cover_image_id = IF(@old_id IS NOT NULL, '" + mid + "', cover_image_id), content = COALESCE(content, '" + esc(tiptapDoc(['Noi dung mau se duoc cap nhat sau.'], [photoUrl(pidx)])) + "') WHERE id = @old_id;");
}
for (var i = 0; i < 5; i++) {
  var mid = ulid();
  var pidx = 50 + i;
  sql("SET @old_pid = (SELECT id FROM projects WHERE cover_image_id IS NULL AND deleted_at IS NULL LIMIT 1);");
  sql("INSERT INTO media (id, original_filename, mime_type, file_size, original_url, thumbnail_url, preview_url, width, height, alt_text, processing_status, uploaded_by, created_at) SELECT '" + mid + "', 'old-proj-cover-" + i + ".jpg', 'image/jpeg', 150000, '" + esc(photoUrl(pidx)) + "', '" + esc(photoUrl(pidx, 300, 300)) + "', '" + esc(photoUrl(pidx, 800, 600)) + "', 1200, 800, 'Project cover', 'completed', @admin_id, NOW() FROM DUAL WHERE @old_pid IS NOT NULL;");
  sql("UPDATE projects SET cover_image_id = IF(@old_pid IS NOT NULL, '" + mid + "', cover_image_id) WHERE id = @old_pid;");
}

console.log(out.join('\n'));
