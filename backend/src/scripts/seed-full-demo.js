/**
 * Seed 20 Categories + 20 Projects + 20 Articles via API
 * Moi project/article co noi dung 400-1000 ky tu + 10 hinh anh noi that
 * Chay: node backend/src/scripts/seed-full-demo.js
 */

const BASE = 'https://bhquan.store/api';

// Hinh anh noi that tu picsum (random, khong bi CORS)
const img = (id, w = 800, h = 500) =>
  `https://picsum.photos/id/${id}/${w}/${h}`;

// 10 hinh cho moi bai — moi bai dung 1 set 10 ID khac nhau
const imgSets = [];
for (let i = 0; i < 40; i++) {
  const base = 10 + i * 11;
  imgSets.push(
    Array.from({ length: 10 }, (_, j) => base + j)
  );
}

function makeGalleryHtml(setIndex) {
  const ids = imgSets[setIndex % imgSets.length];
  return ids
    .map(
      (id, i) =>
        `<figure><img src="${img(id)}" alt="Hình ${i + 1}" loading="lazy" style="width:100%;border-radius:8px;margin-bottom:16px"/></figure>`
    )
    .join('\n');
}

// ============ CATEGORIES ============
const categories = [
  // Project categories (7)
  { name: 'Căn Hộ Chung Cư', type: 'project', description: 'Thiết kế nội thất căn hộ chung cư cao cấp và trung cấp' },
  { name: 'Biệt Thự', type: 'project', description: 'Nội thất biệt thự sang trọng, phong cách đa dạng' },
  { name: 'Nhà Phố', type: 'project', description: 'Thiết kế tối ưu không gian cho nhà phố Việt Nam' },
  { name: 'Văn Phòng', type: 'project', description: 'Không gian làm việc hiện đại, sáng tạo' },
  { name: 'Khách Sạn & Resort', type: 'project', description: 'Thiết kế hospitality đẳng cấp quốc tế' },
  { name: 'Nhà Hàng & Café', type: 'project', description: 'Không gian F&B ấn tượng, thu hút khách hàng' },
  { name: 'Showroom', type: 'project', description: 'Trưng bày sản phẩm chuyên nghiệp, nổi bật thương hiệu' },
  // Article categories (7)
  { name: 'Xu Hướng Thiết Kế', type: 'article', description: 'Cập nhật xu hướng nội thất mới nhất' },
  { name: 'Kiến Thức Vật Liệu', type: 'article', description: 'Tìm hiểu về các loại vật liệu nội thất' },
  { name: 'Mẹo Trang Trí', type: 'article', description: 'Bí quyết trang trí nhà đẹp, tiết kiệm' },
  { name: 'Phong Thủy', type: 'article', description: 'Phong thủy trong thiết kế nội thất' },
  { name: 'Câu Chuyện Dự Án', type: 'article', description: 'Behind the scenes các dự án nổi bật' },
  { name: 'Thiết Kế Bếp', type: 'article', description: 'Chuyên sâu về thiết kế và vật liệu bếp' },
  { name: 'Thiết Kế Xanh', type: 'article', description: 'Giải pháp nội thất bền vững, thân thiện môi trường' },
  // Product categories (6)
  { name: 'Tủ Bếp Laminate', type: 'product', description: 'Tủ bếp phủ Laminate bền đẹp, giá tốt' },
  { name: 'Tủ Áo', type: 'product', description: 'Tủ quần áo đa năng, tiết kiệm không gian' },
  { name: 'Kệ Tivi', type: 'product', description: 'Kệ tivi hiện đại, tích hợp lưu trữ' },
  { name: 'Bàn Làm Việc', type: 'product', description: 'Bàn làm việc tại nhà, ergonomic' },
  { name: 'Giường Ngủ', type: 'product', description: 'Giường ngủ gỗ công nghiệp và gỗ tự nhiên' },
  { name: 'Nội Thất Phòng Tắm', type: 'product', description: 'Tủ lavabo, kệ phòng tắm chống nước' },
];

// ============ PROJECTS (20) ============
const projects = [
  {
    title: 'Penthouse Vinhomes Central Park',
    description: 'Thiết kế nội thất penthouse 200m² phong cách Contemporary tại Vinhomes Central Park, Bình Thạnh.',
    style: 'Contemporary', area: '200m²', location: 'Bình Thạnh, TP.HCM', year_completed: 2025,
    catIdx: 0,
    content: `<h2>Penthouse Đẳng Cấp Giữa Lòng Sài Gòn</h2>
<p>Dự án penthouse tại Vinhomes Central Park là sự kết hợp hoàn hảo giữa phong cách đương đại và nét sang trọng Á Đông. Không gian mở 200m² được quy hoạch thông minh với phòng khách liền bếp, tạo cảm giác rộng rãi và thoáng đãng. Vật liệu chủ đạo là gỗ óc chó Mỹ kết hợp đá marble Ý, mang lại vẻ đẹp vượt thời gian.</p>
<p>Hệ thống chiếu sáng được thiết kế theo concept "ánh sáng tự nhiên", với cửa kính lớn từ sàn đến trần, cho phép ánh nắng tràn ngập khắp căn hộ. Phòng ngủ master được trang bị walk-in closet và phòng tắm spa riêng với bồn tắm freestanding nhìn ra toàn cảnh thành phố.</p>`
  },
  {
    title: 'Biệt Thự Lucasta Quận 9',
    description: 'Nội thất biệt thự song lập phong cách Indochine hiện đại tại Lucasta.',
    style: 'Indochine', area: '350m²', location: 'Quận 9, TP.HCM', year_completed: 2025,
    catIdx: 1,
    content: `<h2>Indochine Hiện Đại — Hơi Thở Việt Nam Đương Đại</h2>
<p>Biệt thự Lucasta là dự án tiêu biểu cho phong cách Indochine hiện đại — nơi truyền thống Việt Nam gặp gỡ thiết kế đương đại. Tổng diện tích sử dụng 350m² trải trên 3 tầng, mỗi không gian đều kể một câu chuyện riêng. Sảnh chính với trần cao 6m, trang trí bằng hệ lam gỗ thông theo motif hoa sen cách điệu.</p>
<p>Phòng khách sử dụng gam màu trầm ấm — nâu đất, xanh rêu, và vàng đồng. Nội thất được đặt làm riêng bởi các nghệ nhân Việt Nam: bàn trà gỗ hương, đèn lồng tre hiện đại, và tranh sơn mài đặt hàng theo kích thước. Khu vực bếp-ăn mở ra sân vườn với hồ cá Koi, tạo không gian sống gần gũi thiên nhiên.</p>`
  },
  {
    title: 'Nhà Phố Liền Kề Mega Village',
    description: 'Cải tạo nhà phố 3 tầng phong cách Scandinavian ấm áp.',
    style: 'Scandinavian', area: '120m²', location: 'Quận 9, TP.HCM', year_completed: 2024,
    catIdx: 2,
    content: `<h2>Scandinavia Giữa Sài Gòn — Tối Giản Mà Ấm Cúng</h2>
<p>Nhà phố Mega Village được cải tạo toàn diện theo phong cách Scandinavian — nơi sự tối giản gặp gỡ sự ấm áp. Với diện tích 120m², thách thức lớn nhất là tối ưu mọi mét vuông cho gia đình 4 người. Giải pháp: tường trắng kết hợp gỗ sồi tự nhiên, tạo nền sáng và sạch cho toàn bộ không gian.</p>
<p>Cầu thang gỗ với lan can thép đen trở thành điểm nhấn kiến trúc. Tầng 1 mở hoàn toàn cho phòng khách - bếp - ăn, với cửa kính lùa ra sân sau nhỏ trồng cây xanh. Phòng ngủ các tầng trên dùng nội thất thông minh: giường có ngăn kéo, bàn học gắn tường, tủ áo âm tường toàn bộ.</p>`
  },
  {
    title: 'Văn Phòng Startup The Crest',
    description: 'Không gian co-working 300m² phong cách Industrial tại The Crest, Quận 2.',
    style: 'Industrial Modern', area: '300m²', location: 'Thủ Đức, TP.HCM', year_completed: 2025,
    catIdx: 3,
    content: `<h2>Không Gian Làm Việc Truyền Cảm Hứng</h2>
<p>Văn phòng startup tại The Crest được thiết kế theo concept "Open & Connected" — phá bỏ mọi rào cản vật lý để khuyến khích sáng tạo và hợp tác. Trần bê tông lộ kết hợp hệ thống ống kỹ thuật sơn đen tạo nên DNA Industrial đặc trưng. Sàn bê tông đánh bóng phản chiếu ánh sáng tự nhiên từ hệ cửa kính panorama.</p>
<p>Khu vực làm việc chia thành 3 zone: Focus (bàn cá nhân), Collaborate (bàn nhóm 4-8 người), và Relax (bean bag, sofa, bar cà phê). Phòng họp kính cách âm đặt xen kẽ, trang bị công nghệ AV hiện đại. Điểm nhấn là bức tường xanh sống 15m² tại sảnh chính, lọc không khí và tạo cảm giác thư giãn.</p>`
  },
  {
    title: 'Boutique Hotel Hội An',
    description: 'Thiết kế 12 phòng boutique hotel mang hơi thở phố cổ Hội An.',
    style: 'Heritage Contemporary', area: '800m²', location: 'Hội An, Quảng Nam', year_completed: 2024,
    catIdx: 4,
    content: `<h2>Di Sản Phố Cổ Trong Thiết Kế Đương Đại</h2>
<p>Boutique hotel 12 phòng giữa lòng phố cổ Hội An — nơi mỗi căn phòng là một tác phẩm nghệ thuật kể câu chuyện về di sản văn hóa miền Trung. Kiến trúc giữ nguyên khung nhà gỗ truyền thống 3 gian, tái tạo hoàn toàn nội thất với ngôn ngữ đương đại. Gạch lát Bát Tràng nung thủ công, gỗ mít tái chế từ nhà cổ, và vải thổ cẩm Chăm Pa.</p>
<p>Mỗi phòng được đặt tên theo một nghề truyền thống Hội An: phòng Lụa, phòng Gốm, phòng Đèn Lồng. Phòng tắm mở bán lộ thiên với bồn đá nguyên khối và cây xanh nhiệt đới. Sân trong trồng mai vàng và bonsai, tạo không gian thiền định yên tĩnh giữa phố thị nhộn nhịp.</p>`
  },
  {
    title: 'Nhà Hàng Gạo Restaurant',
    description: 'Thiết kế nhà hàng Việt Nam fine dining 150 chỗ ngồi.',
    style: 'Vietnamese Modern', area: '400m²', location: 'Quận 1, TP.HCM', year_completed: 2025,
    catIdx: 5,
    content: `<h2>Fine Dining Việt Nam — Ẩm Thực Là Nghệ Thuật</h2>
<p>Nhà hàng Gạo tọa lạc tại trung tâm Quận 1, mang sứ mệnh nâng tầm ẩm thực Việt lên đẳng cấp fine dining quốc tế. Thiết kế lấy cảm hứng từ ruộng bậc thang và dòng chảy sông Mekong — tường cong uốn lượn, ánh sáng vàng ấm mô phỏng hoàng hôn đồng quê. Trần nhà treo hệ đèn tre thủ công với 500 chiếc đèn kích thước khác nhau.</p>
<p>Khu vực chính chia 3 cấp độ sàn, tạo cảm giác bậc thang tự nhiên. VIP room riêng biệt với cửa trượt gỗ khắc hoa văn trống đồng. Bếp mở cho phép thực khách theo dõi nghệ thuật chế biến. Vật liệu: đá ong, gạch thất cổ, gỗ lim tái chế và thép Corten patina tự nhiên.</p>`
  },
  {
    title: 'Showroom VietNet Quận 7',
    description: 'Showroom trưng bày tủ bếp và nội thất 250m² tại Phú Mỹ Hưng.',
    style: 'Modern Luxury', area: '250m²', location: 'Quận 7, TP.HCM', year_completed: 2025,
    catIdx: 6,
    content: `<h2>Trải Nghiệm Nội Thất Đỉnh Cao</h2>
<p>Showroom VietNet tại Phú Mỹ Hưng là không gian trưng bày mới nhất, nơi khách hàng được trải nghiệm trực tiếp sản phẩm tủ bếp và nội thất trong bối cảnh thực tế. 250m² được chia thành 6 zone trưng bày, mỗi zone mô phỏng một phong cách sống khác nhau: Modern, Scandinavian, Industrial, Indochine, Japandi, và Luxury.</p>
<p>Hệ thống chiếu sáng track-light chuyên nghiệp highlight từng sản phẩm. Khu vực tư vấn trang bị màn hình 3D để khách hàng xem mô phỏng nội thất trong chính căn nhà của mình. Material library trưng bày hơn 200 mẫu vật liệu từ gỗ, đá, kim loại đến vải, giúp khách hàng chọn lựa dễ dàng.</p>`
  },
  {
    title: 'Căn Hộ Masteri Thảo Điền',
    description: 'Thiết kế căn 2PN+1 phong cách Japandi tinh tế.',
    style: 'Japandi', area: '85m²', location: 'Thủ Đức, TP.HCM', year_completed: 2024,
    catIdx: 0,
    content: `<h2>Japandi — Khi Nhật Bản Gặp Bắc Âu</h2>
<p>Căn hộ 85m² tại Masteri Thảo Điền là minh chứng cho triết lý "less is more" của phong cách Japandi — sự giao thoa giữa tối giản Nhật Bản và ấm áp Scandinavian. Gam màu chủ đạo: trắng kem, be tự nhiên, và nâu gỗ nhạt. Mọi đồ nội thất đều có đường nét mềm mại, bo tròn, tạo cảm giác an toàn và thư thái.</p>
<p>Phòng khách sử dụng sofa bọc vải linen tự nhiên, bàn trà gỗ ash thấp kiểu Nhật. Bếp chữ L với mặt đá Caesarstone trắng và tủ bếp gỗ veneer sồi. Phòng ngủ master có giường platform thấp, đèn Noguchi và rèm linen mỏng lọc sáng dịu nhẹ. Phòng trẻ em thiết kế linh hoạt — bàn học gấp, giường tầng tích hợp tủ đồ.</p>`
  },
  {
    title: 'Villa FLC Sầm Sơn',
    description: 'Nội thất villa nghỉ dưỡng 4 phòng ngủ bên bờ biển.',
    style: 'Coastal Modern', area: '280m²', location: 'Sầm Sơn, Thanh Hóa', year_completed: 2025,
    catIdx: 1,
    content: `<h2>Nghỉ Dưỡng Ven Biển — Hòa Mình Cùng Sóng Gió</h2>
<p>Villa FLC Sầm Sơn mang phong cách Coastal Modern — nơi thiên nhiên biển cả là nguồn cảm hứng chủ đạo. Gam màu xanh navy, trắng cát, và be tự nhiên xuyên suốt toàn bộ không gian. Vật liệu chịu ẩm: gỗ teak xử lý nhiệt, đá thạch anh nhân tạo, và inox 316 chống gỉ.</p>
<p>Phòng khách tầng trệt với trần cao 5m, cửa kính lùa toàn bộ mở ra hồ bơi riêng và view biển. Bếp ngoài trời trang bị BBQ station và bar counter cho tiệc ngoài trời. 4 phòng ngủ đều có ban công riêng, phòng tắm với vòi sen rainfall và bồn tắm đá. Tầng thượng là sky lounge với ghế tanning và jacuzzi nhìn ra biển.</p>`
  },
  {
    title: 'Townhouse Lakeview City',
    description: 'Cải tạo nhà phố 3 tầng phong cách Mid-Century Modern.',
    style: 'Mid-Century Modern', area: '150m²', location: 'Quận 2, TP.HCM', year_completed: 2024,
    catIdx: 2,
    content: `<h2>Retro Chic — Phong Cách Không Bao Giờ Lỗi Thời</h2>
<p>Townhouse tại Lakeview City được cải tạo theo phong cách Mid-Century Modern — phong cách thịnh hành từ thập niên 50-60 nhưng vẫn cực kỳ hiện đại ngày nay. Đường nét hình học, chân ghế hairpin, và gam màu mustard-teal-olive tạo nên bản sắc riêng cho ngôi nhà. Sàn gạch terrazzo pha lẫn đá cẩm thạch nhiều màu.</p>
<p>Nội thất mix giữa đồ vintage tìm được và sản phẩm thiết kế mới: ghế Eames lounge chair, đèn Sputnik, sideboard walnut chân cao. Kệ sách built-in chạy suốt cầu thang, biến hành lang thành thư viện mini. Sân thượng trồng vườn rau hữu cơ và khu vực BBQ nhỏ cho cuối tuần gia đình.</p>`
  },
  {
    title: 'Headquarters TechViet Corp',
    description: 'Văn phòng trụ sở 600m² cho công ty công nghệ 80 nhân viên.',
    style: 'Tech Modern', area: '600m²', location: 'Quận 1, TP.HCM', year_completed: 2025,
    catIdx: 3,
    content: `<h2>Văn Phòng Công Nghệ Thế Hệ Mới</h2>
<p>Trụ sở TechViet được thiết kế theo tiêu chuẩn WELL Building — không chỉ đẹp mà còn tối ưu sức khỏe và năng suất cho 80 nhân viên. Bố cục Activity-Based Working: không có chỗ ngồi cố định, nhân viên chọn khu vực phù hợp với công việc đang làm. 40% diện tích dành cho khu vực cộng đồng và nghỉ ngơi.</p>
<p>Phòng họp đa dạng: từ phone booth 1 người, huddle room 4 người đến boardroom 20 chỗ. Khu pantry thiết kế như café boutique với máy pha cà phê chuyên nghiệp. Gaming room có bàn bi-a, PlayStation, và ghế massage cho giờ giải lao. Vật liệu acoustic panel và thảm hút âm giảm tiếng ồn xuống dưới 45dB.</p>`
  },
  {
    title: 'Mövenpick Resort Phú Quốc Suite',
    description: 'Thiết kế nội thất 20 suite tại Mövenpick Resort Phú Quốc.',
    style: 'Tropical Luxury', area: '1200m²', location: 'Phú Quốc, Kiên Giang', year_completed: 2024,
    catIdx: 4,
    content: `<h2>Suite Nghỉ Dưỡng Nhiệt Đới Đẳng Cấp</h2>
<p>Dự án thiết kế 20 suite cho Mövenpick Resort Phú Quốc, mỗi suite rộng 60m² với concept "Rừng Gặp Biển". Bảng màu lấy từ thiên nhiên đảo ngọc: xanh rừng nhiệt đới, be cát biển, cam san hô, và nâu gỗ driftwood. Nội thất kết hợp mây tre đan thủ công của nghệ nhân Phú Quốc với đồ ngoại nhập cao cấp.</p>
<p>Giường kingsize khung gỗ teak với màn baldachin linen trắng. Phòng tắm nửa ngoài trời với bồn đá cuội river stone và vườn nhiệt đới mini. Minibar trang bị tủ rượu vang và máy pha nespresso. Mỗi suite có hammock ngoài hiên và ghế daybed nhìn ra biển hoặc rừng tràm. Chất liệu xuyên suốt: gỗ keo tràm xử lý, rattan, linen, và đồng patina.</p>`
  },
  {
    title: 'Café Noir Specialty Coffee',
    description: 'Quán cà phê specialty 80 chỗ phong cách Wabi-Sabi.',
    style: 'Wabi-Sabi', area: '180m²', location: 'Quận 3, TP.HCM', year_completed: 2025,
    catIdx: 5,
    content: `<h2>Wabi-Sabi — Vẻ Đẹp Của Sự Không Hoàn Hảo</h2>
<p>Café Noir là không gian specialty coffee nơi triết lý Wabi-Sabi Nhật Bản được diễn giải qua lăng kính Việt Nam. Tường tô tay bằng vữa đất sét pha rơm, cố tình giữ nguyên vân tay thợ. Bàn ghế gỗ me tây nguyên khối — mỗi chiếc một hình dáng khác nhau, tôn vinh vẻ đẹp tự nhiên của thớ gỗ.</p>
<p>Quầy bar pha chế là tâm điểm: bê tông đúc tại chỗ kết hợp mặt đồng đánh patina xanh. Hệ thống kệ trưng bày cà phê bằng sắt rèn thủ công. Ánh sáng tự nhiên qua giếng trời trung tâm, bổ sung bởi đèn gốm handmade từ Bát Tràng. Sân vườn nhỏ trồng cà phê Arabica và thảo mộc cho menu đồ uống.</p>`
  },
  {
    title: 'Showroom Nội Thất Đà Nẵng',
    description: 'Showroom kết hợp workshop trải nghiệm 200m².',
    style: 'Minimalist Industrial', area: '200m²', location: 'Hải Châu, Đà Nẵng', year_completed: 2025,
    catIdx: 6,
    content: `<h2>Showroom Trải Nghiệm Thế Hệ Mới</h2>
<p>Showroom Đà Nẵng không chỉ là nơi trưng bày — đây là không gian trải nghiệm nơi khách hàng có thể chạm, cảm nhận, và thậm chí tham gia workshop làm đồ nội thất. Thiết kế Minimalist Industrial với sàn bê tông mài, tường gạch trần, và hệ kệ thép modular có thể tái bố trí linh hoạt theo từng đợt trưng bày.</p>
<p>Khu vực workshop trang bị bàn làm việc gỗ lớn, dụng cụ cơ bản, và nguyên liệu mẫu. Khách hàng đăng ký tham gia buổi "DIY Interior" hàng tuần — tự tay làm kệ treo, khay gỗ, hoặc chậu bê tông. Studio chụp ảnh sản phẩm tích hợp, giúp cập nhật hình ảnh catalog thường xuyên. VR corner cho phép khách hàng xem mô phỏng 3D nội thất.</p>`
  },
  {
    title: 'Duplex Diamond Island',
    description: 'Căn duplex 160m² view sông Sài Gòn, phong cách Art Deco.',
    style: 'Art Deco Modern', area: '160m²', location: 'Quận 2, TP.HCM', year_completed: 2024,
    catIdx: 0,
    content: `<h2>Art Deco Bên Dòng Sông Sài Gòn</h2>
<p>Duplex tại Diamond Island là dự án đặc biệt cho cặp vợ chồng yêu nghệ thuật — phong cách Art Deco được tái hiện với chất liệu đương đại. Hoa văn hình học đối xứng xuất hiện trên gạch sàn, khung gương, và rèm cửa. Gam màu emerald green, gold, navy và cream tạo nên palette sang trọng nhưng không hề lỗi thời.</p>
<p>Cầu thang nội bộ với lan can đồng thau uốn Art Deco là tác phẩm điêu khắc trung tâm. Tầng dưới cho sinh hoạt chung: phòng khách sunken, bếp đảo, và khu vực ăn formal. Tầng trên gồm master suite với vanity area riêng và phòng đọc sách nhìn ra sông. Bộ sưu tập tranh và tượng được chiếu sáng gallery-style.</p>`
  },
  {
    title: 'Biệt Thự Ecopark Grand',
    description: 'Biệt thự đơn lập 500m² phong cách Neoclassical tại Ecopark.',
    style: 'Neoclassical', area: '500m²', location: 'Hưng Yên', year_completed: 2025,
    catIdx: 1,
    content: `<h2>Cổ Điển Châu Âu Giữa Đồng Bằng Bắc Bộ</h2>
<p>Biệt thự Ecopark Grand là dự án nội thất quy mô lớn nhất năm 2025 — 500m² thiết kế theo phong cách Neoclassical châu Âu. Sảnh chính với cầu thang đôi uốn cong, tay vịn gỗ sồi chạm trổ, và đèn chùm pha lê Swarovski đường kính 1.5m. Sàn đá marble Calacatta Gold nhập khẩu trực tiếp từ Ý.</p>
<p>Phòng khách formal với trần phào chỉ PU mạ vàng, sofa Chesterfield da thật, và lò sưởi giả đá cẩm thạch. Phòng ăn 12 người với bàn gỗ mahogany và ghế bọc nhung. Thư phòng ốp gỗ walnut toàn bộ với hệ kệ sách cao đến trần. 5 phòng ngủ, mỗi phòng một theme màu khác nhau, đều có phòng tắm en-suite với bồn tắm clawfoot.</p>`
  },
  {
    title: 'Nhà Phố Cityland Park Hills',
    description: 'Thiết kế nhà phố 4 tầng phong cách Modern Farmhouse.',
    style: 'Modern Farmhouse', area: '180m²', location: 'Gò Vấp, TP.HCM', year_completed: 2024,
    catIdx: 2,
    content: `<h2>Farmhouse Giữa Phố Thị — Mộc Mạc Và Hiện Đại</h2>
<p>Nhà phố Cityland được thiết kế theo phong cách Modern Farmhouse — xu hướng đang rất được ưa chuộng tại Mỹ, nay được Việt hóa cho phù hợp khí hậu nhiệt đới. Shiplap trắng kết hợp dầm gỗ giả trên trần, cửa barn door, và hardware đen matte tạo nên DNA farmhouse đặc trưng.</p>
<p>Bếp là trái tim của ngôi nhà: đảo bếp lớn với mặt butcher block, tủ bếp shaker style trắng, và apron-front sink. Phòng khách với lò sưởi điện ốp đá tự nhiên, sofa vải bố, và rổ mây trang trí. Sân thượng thiết kế như farmhouse patio: pergola gỗ, ghế swing, và khu vực trồng rau thảo mộc trong chậu galvanized.</p>`
  },
  {
    title: 'Co-working Space District 7',
    description: 'Không gian co-working 450m² cho freelancer và startup.',
    style: 'Biophilic Design', area: '450m²', location: 'Quận 7, TP.HCM', year_completed: 2025,
    catIdx: 3,
    content: `<h2>Biophilic Co-working — Làm Việc Giữa Thiên Nhiên</h2>
<p>Co-working Space tại Quận 7 áp dụng Biophilic Design — đưa thiên nhiên vào mọi ngóc ngách không gian làm việc. Hơn 300 cây xanh từ dương xỉ, monstera đến cọ areca được bố trí khắp 450m². Tường rêu sống, chậu treo trần, và partition cây leo tạo ranh giới tự nhiên giữa các khu vực.</p>
<p>Ánh sáng circadian — hệ đèn LED thay đổi nhiệt độ màu theo giờ trong ngày, hỗ trợ nhịp sinh học. Âm thanh white noise pha tiếng suối và chim hót qua hệ loa âm trần. Vật liệu thô mộc: bàn gỗ nguyên cạnh live-edge, ghế cork, và thảm jute. Khu vực meditation room với sàn tatami và ánh sáng mờ cho 15 phút thư giãn giữa giờ.</p>`
  },
  {
    title: 'Rooftop Bar Skyline',
    description: 'Bar rooftop 200m² trên tầng 25 với view 360° thành phố.',
    style: 'Glamorous Modern', area: '200m²', location: 'Quận 1, TP.HCM', year_completed: 2025,
    catIdx: 5,
    content: `<h2>Skyline — Nơi Sài Gòn Lộng Lẫy Nhất</h2>
<p>Rooftop bar Skyline trên tầng 25 là điểm đến nightlife mới của Sài Gòn — thiết kế Glamorous Modern với view 360° toàn thành phố. Quầy bar trung tâm hình bán nguyệt, mặt onyx translucent chiếu sáng từ bên trong, tỏa ánh vàng hổ phách huyền ảo. Ghế bar bọc nhung xanh teal và chân đồng mạ vàng.</p>
<p>Khu lounge ngoài trời với sofa module chống thời tiết, lò sưởi gas, và infinity pool cạnh nông tạo hiệu ứng nước tràn bờ. Trần pergola gỗ với hệ rèm tự động che mưa nắng. LED strip chạy dọc mọi cạnh kiến trúc, đổi màu theo nhạc DJ. Khu VIP riêng biệt với jacuzzi nóng và champagne locker cá nhân. Sàn terrazzo pha mảnh gương và đồng vụn lấp lánh dưới ánh đèn.</p>`
  },
  {
    title: 'Căn Hộ Studio Vinhomes Grand Park',
    description: 'Studio 35m² tối ưu không gian cho người trẻ độc thân.',
    style: 'Smart Compact', area: '35m²', location: 'Quận 9, TP.HCM', year_completed: 2025,
    catIdx: 0,
    content: `<h2>35m² — Nhỏ Nhưng Có Tất Cả</h2>
<p>Studio 35m² tại Vinhomes Grand Park là thách thức thiết kế thú vị: làm sao để một không gian nhỏ trở thành nơi sống tiện nghi cho người trẻ năng động? Giải pháp: nội thất đa năng và phân vùng bằng ánh sáng, không bằng tường. Giường Murphy gấp lên tường, biến phòng ngủ thành phòng khách ban ngày. Bàn ăn gắn tường 2 chỗ gập xuống khi cần.</p>
<p>Bếp mini chữ I dài 2.4m nhưng đầy đủ: bếp từ, lò vi sóng tích hợp, và tủ lạnh âm. Phòng tắm 3m² với bồn cầu treo, vòi sen rainfall, và gương tủ có đèn. Tủ quần áo dạng closet mở với rèm vải thay cửa. Gam màu sáng — trắng, xám nhạt, gỗ bạch dương — phản chiếu ánh sáng, tạo cảm giác rộng hơn thực tế.</p>`
  },
];

// ============ ARTICLES (20) ============
const articles = [
  {
    title: '10 Xu Hướng Thiết Kế Nội Thất 2026 Không Thể Bỏ Qua',
    excerpt: 'Từ Japandi đến Biophilic Design — những phong cách định hình năm mới.',
    catIdx: 7,
    content: `<h2>Xu Hướng Nội Thất Nổi Bật Năm 2026</h2>
<p>Năm 2026 đánh dấu sự trỗi dậy mạnh mẽ của thiết kế bền vững và gần gũi thiên nhiên. Japandi — sự kết hợp giữa tối giản Nhật Bản và ấm áp Scandinavian — tiếp tục dẫn đầu xu hướng. Biophilic Design không còn là lựa chọn mà trở thành tiêu chuẩn: tường cây xanh, vật liệu tự nhiên, và ánh sáng circadian xuất hiện trong mọi dự án cao cấp.</p>
<p>Curvilinear Design — đường cong mềm mại thay thế góc vuông cứng nhắc — lan từ nội thất ra kiến trúc. Sofa cong, gương tròn, bàn kidney-shape trở thành must-have. Maximalism có dấu hiệu trở lại: pha trộn pattern, texture, và màu sắc bạo dạn nhưng có kiểm soát. Vật liệu tái chế và upcycled nâng tầm từ trend thành mainstream.</p>`
  },
  {
    title: 'Hướng Dẫn Chọn Gỗ Công Nghiệp Cho Tủ Bếp',
    excerpt: 'So sánh MDF, HDF, Plywood — ưu nhược điểm và giá thành chi tiết.',
    catIdx: 8,
    content: `<h2>Gỗ Công Nghiệp — Lựa Chọn Thông Minh Cho Tủ Bếp Hiện Đại</h2>
<p>Gỗ công nghiệp ngày nay đã vượt xa định kiến "rẻ tiền, kém bền". Với công nghệ sản xuất tiên tiến, các loại MDF chống ẩm, HDF siêu cứng, và Plywood marine grade có tuổi thọ 15-20 năm trong điều kiện bếp Việt Nam. Bài viết này so sánh chi tiết 5 loại gỗ công nghiệp phổ biến nhất cho tủ bếp.</p>
<p>MDF (Medium Density Fiberboard): mặt phẳng tuyệt đối, dễ sơn và phủ PVC/Acrylic. Giá: 350-450K/m². Nhược điểm: trương nở khi ngấm nước trực tiếp. HDF (High Density Fiberboard): cứng hơn MDF 30%, chịu nước tốt hơn, thích hợp làm cánh tủ. Giá: 500-650K/m². Plywood: chịu lực tốt nhất, không cong vênh, tuổi thọ cao nhất. Giá: 600-900K/m² tùy loại gỗ mặt.</p>`
  },
  {
    title: '7 Mẹo Trang Trí Phòng Khách Dưới 10 Triệu Đồng',
    excerpt: 'Biến phòng khách nhàm chán thành không gian ấn tượng với ngân sách nhỏ.',
    catIdx: 9,
    content: `<h2>Thay Đổi Lớn, Chi Phí Nhỏ</h2>
<p>Bạn không cần hàng trăm triệu để có phòng khách đẹp. Với 10 triệu đồng và 7 mẹo sau đây, không gian sống của bạn sẽ thay đổi hoàn toàn. Mẹo 1: Sơn lại accent wall — chỉ 1 bức tường với màu đậm hơn hoặc wallpaper điểm nhấn tạo chiều sâu cho cả căn phòng. Chi phí: 500K-2 triệu.</p>
<p>Mẹo 2: Thay vỏ gối và thêm throw blanket — cách rẻ nhất để thay đổi bảng màu phòng khách theo mùa. Mẹo 3: Đặt cây xanh lớn — monstera hoặc fiddle leaf fig trong chậu đẹp ngay góc sofa. Mẹo 4: Gallery wall — in và đóng khung 5-7 bức ảnh gia đình hoặc art print. Mẹo 5: Thay đèn — đèn sàn hoặc đèn bàn với ánh sáng ấm biến đổi mood hoàn toàn. Chi phí ước tính toàn bộ: 7-10 triệu.</p>`
  },
  {
    title: 'Phong Thủy Phòng Ngủ: 12 Nguyên Tắc Vàng',
    excerpt: 'Bố trí phòng ngủ theo phong thủy để có giấc ngủ ngon và vận khí tốt.',
    catIdx: 10,
    content: `<h2>Phong Thủy Phòng Ngủ — Ngủ Ngon, Vận Tốt</h2>
<p>Phòng ngủ là nơi bạn dành 1/3 cuộc đời, nên phong thủy phòng ngủ ảnh hưởng trực tiếp đến sức khỏe, tinh thần, và vận mệnh. Nguyên tắc 1: Giường không đối diện cửa ra vào — vị trí "quan tài" trong phong thủy. Đầu giường tựa tường vững chắc, không đặt dưới dầm ngang hoặc xà nhà.</p>
<p>Nguyên tắc 2: Gương không phản chiếu giường ngủ — gây mất ngủ và bất an. Nguyên tắc 3: Đèn ngủ đặt thành cặp đối xứng hai bên — biểu tượng hài hòa âm dương. Nguyên tắc 4: Không đặt cây xanh lớn trong phòng ngủ — ban đêm cây hấp thụ oxy. Nguyên tắc 5: Màu sắc nhẹ nhàng — trắng kem, be, hồng phấn, xanh pastel hỗ trợ giấc ngủ. Tránh đỏ, cam, vàng chói.</p>`
  },
  {
    title: 'Behind The Scenes: Dự Án Penthouse Vinhomes',
    excerpt: 'Hành trình 6 tháng từ concept đến bàn giao — thử thách và giải pháp.',
    catIdx: 11,
    content: `<h2>6 Tháng — Từ Ý Tưởng Đến Hiện Thực</h2>
<p>Dự án penthouse Vinhomes Central Park là một trong những dự án phức tạp nhất của VietNet trong năm 2025. Bài viết này chia sẻ hành trình 6 tháng từ buổi brief đầu tiên đến ngày bàn giao — với tất cả thử thách, sai lầm, và giải pháp sáng tạo đằng sau không gian hoàn hảo mà bạn nhìn thấy.</p>
<p>Tháng 1-2: Concept và thiết kế. Khách hàng muốn "sang trọng nhưng không phô trương" — brief mơ hồ nhưng đầy thách thức. Đội thiết kế đã tạo 3 moodboard khác nhau trước khi khách chọn hướng Contemporary Luxury. Tháng 3-4: Sản xuất nội thất. Bàn ăn đá marble nguyên khối nặng 300kg cần cần cẩu đặc biệt. Tháng 5-6: Lắp đặt và hoàn thiện — 15 thợ làm việc liên tục 45 ngày.</p>`
  },
  {
    title: 'Tủ Bếp Acrylic vs Laminate: Đâu Là Lựa Chọn Tốt Hơn?',
    excerpt: 'Phân tích chi tiết 2 vật liệu phổ biến nhất cho cánh tủ bếp.',
    catIdx: 12,
    content: `<h2>Acrylic vs Laminate — Cuộc Chiến Vật Liệu Tủ Bếp</h2>
<p>Acrylic và Laminate là 2 vật liệu phủ cánh tủ bếp phổ biến nhất tại Việt Nam. Cả hai đều có ưu điểm riêng và phù hợp với những nhu cầu khác nhau. Acrylic: bề mặt bóng gương, sang trọng, phản chiếu ánh sáng tạo cảm giác rộng rãi. Giá: 1.8-3 triệu/m² cánh. Ưu điểm: không thấm nước, dễ lau chùi, màu sắc đa dạng, độ bền 15-20 năm.</p>
<p>Laminate: bề mặt nhám hoặc vân gỗ tự nhiên, giá thành phải chăng hơn. Giá: 800K-1.5 triệu/m² cánh. Ưu điểm: chống trầy xước tốt hơn Acrylic, đa dạng vân gỗ, chịu nhiệt đến 180°C. Nhược điểm: không thể sửa chữa nếu bong tróc, cạnh dễ bong sau 7-10 năm. Kết luận: Acrylic cho bếp hiện đại, sang trọng. Laminate cho bếp ấm cúng, ngân sách vừa phải.</p>`
  },
  {
    title: 'Thiết Kế Bếp Chữ L, Chữ U, Song Song — Chọn Layout Nào?',
    excerpt: 'Hướng dẫn chọn layout bếp phù hợp với diện tích và thói quen nấu nướng.',
    catIdx: 12,
    content: `<h2>Layout Bếp — Quyết Định Quan Trọng Nhất</h2>
<p>Layout bếp ảnh hưởng trực tiếp đến hiệu quả nấu nướng hàng ngày. Tam giác hoạt động (bồn rửa - bếp nấu - tủ lạnh) cần được tối ưu trong mọi layout. Bếp chữ L: phổ biến nhất, phù hợp diện tích 8-15m². Hai cạnh vuông góc tạo tam giác hoạt động tự nhiên. Có thể thêm đảo bếp nếu không gian cho phép.</p>
<p>Bếp chữ U: lý tưởng cho không gian 12-20m², bao quanh 3 mặt, tối đa diện tích lưu trữ. Nhược điểm: có thể cảm thấy chật nếu diện tích dưới 12m². Bếp song song (galley): hai dãy tủ đối diện, phù hợp nhà phố hẹp rộng 2-3m. Hiệu quả cao nhất cho người nấu ăn chuyên nghiệp. Bếp đảo: xu hướng hiện đại, cần tối thiểu 15m², đảo kết hợp bếp nấu hoặc bồn rửa và bar ăn sáng.</p>`
  },
  {
    title: 'Nội Thất Xanh: Vật Liệu Tái Chế Trong Thiết Kế',
    excerpt: 'Gỗ pallet, container, vải organic — giải pháp nội thất bền vững.',
    catIdx: 13,
    content: `<h2>Thiết Kế Xanh — Trách Nhiệm Với Tương Lai</h2>
<p>Ngành nội thất tiêu thụ lượng lớn tài nguyên thiên nhiên. Thiết kế xanh không chỉ là trend — đó là trách nhiệm. Gỗ pallet tái chế: nguồn gỗ miễn phí hoặc rất rẻ, có thể làm kệ sách, bàn coffee, headboard giường. Sau khi xử lý mối mọt và chà nhám, gỗ pallet mang vẻ đẹp rustic độc đáo không thể tìm thấy ở vật liệu mới.</p>
<p>Container cũ: xu hướng toàn cầu biến container thành nhà ở, quán café, văn phòng. Chi phí thấp hơn xây dựng truyền thống 40-60%. Vải organic: cotton hữu cơ, linen, hemp cho rèm, bọc ghế, gối trang trí — không chứa hóa chất độc hại, phân hủy sinh học. Sơn VOC-free: sơn không chứa hợp chất hữu cơ bay hơi, an toàn cho sức khỏe gia đình.</p>`
  },
  {
    title: 'Cách Bố Trí Ánh Sáng Trong Nhà Đúng Chuẩn',
    excerpt: 'Layer ánh sáng — ambient, task, accent — cho từng không gian.',
    catIdx: 9,
    content: `<h2>Ánh Sáng — Linh Hồn Của Không Gian</h2>
<p>Chiếu sáng đúng cách biến căn nhà bình thường thành không gian sống đẳng cấp. Nguyên tắc 3 lớp ánh sáng: Ambient (ánh sáng nền) — đèn trần, đèn ốp, downlight tạo ánh sáng đều cho toàn phòng, nhiệt độ màu 3000-4000K. Task (ánh sáng chức năng) — đèn bàn đọc sách, đèn bếp dưới tủ trên, đèn gương phòng tắm.</p>
<p>Accent (ánh sáng điểm nhấn) — đèn rọi tranh, LED strip dưới kệ, đèn sàn chiếu tường. Quy tắc: mỗi phòng cần ít nhất 2 lớp ánh sáng. Phòng khách: ambient + accent + task (đèn đọc). Bếp: ambient mạnh + task dưới tủ. Phòng ngủ: ambient dịu + task (đèn đầu giường) + accent (LED strip sau headboard). Mẹo: dùng dimmer cho mọi đèn để điều chỉnh mood theo hoạt động.</p>`
  },
  {
    title: 'Phong Cách Wabi-Sabi — Vẻ Đẹp Của Sự Không Hoàn Hảo',
    excerpt: 'Triết lý Nhật Bản đang thay đổi cách chúng ta nghĩ về nội thất.',
    catIdx: 7,
    content: `<h2>Wabi-Sabi — Triết Lý Sống Trong Thiết Kế</h2>
<p>Wabi-Sabi không đơn thuần là phong cách nội thất — đó là triết lý sống của người Nhật, tôn vinh vẻ đẹp trong sự không hoàn hảo, vô thường, và chưa hoàn thiện. Trong thiết kế nội thất, Wabi-Sabi thể hiện qua: vật liệu thô mộc — gỗ nguyên khối có vân nứt, gốm thủ công có vết ngón tay, bê tông có vết bọt khí.</p>
<p>Gam màu trung tính tự nhiên: be, nâu đất, xám đá, trắng ngà. Không có màu neon hay pattern rực rỡ. Handmade over machine-made: mỗi món đồ đều có "linh hồn" riêng, không hai chiếc bát giống hệt nhau. Cây cối tự nhiên: cành khô, rêu, hoa đồng nội thay vì hoa cắt cành hoàn hảo. Không gian thở: khoảng trống có chủ đích — không phải mọi góc đều cần đồ nội thất.</p>`
  },
  {
    title: 'Hướng Dẫn Chọn Đá Ốp Bếp Từ A-Z',
    excerpt: 'Granite, thạch anh, marble, sintered stone — so sánh toàn diện.',
    catIdx: 8,
    content: `<h2>Đá Ốp Bếp — Đầu Tư Đáng Giá Nhất</h2>
<p>Mặt đá bếp chịu tác động hàng ngày: dao cắt, nồi nóng, nước, dầu mỡ, axit từ chanh/giấm. Chọn đúng loại đá = 20 năm yên tâm. Granite tự nhiên: cứng 6-7 Mohs, chịu nhiệt đến 300°C, mỗi tấm một vân duy nhất. Giá: 2-5 triệu/m². Cần seal 1 lần/năm để chống thấm.</p>
<p>Thạch anh nhân tạo (Quartz): 93% thạch anh + 7% resin, cứng 7 Mohs, KHÔNG cần seal, đa dạng màu sắc. Giá: 2.5-8 triệu/m². Nhược điểm: không chịu nhiệt trên 150°C. Marble: đẹp nhất nhưng mềm (3-4 Mohs), dễ trầy và ố. Chỉ phù hợp khu vực ít sử dụng hoặc chấp nhận patina. Sintered Stone: vật liệu mới, siêu cứng, chịu nhiệt, chống trầy tuyệt đối. Giá cao: 5-15 triệu/m².</p>`
  },
  {
    title: 'Phong Thủy Bàn Thờ Gia Tiên: Vị Trí và Cách Bố Trí',
    excerpt: 'Chuẩn phong thủy cho bàn thờ trong nhà phố và căn hộ hiện đại.',
    catIdx: 10,
    content: `<h2>Bàn Thờ — Nơi Linh Thiêng Nhất Trong Nhà</h2>
<p>Bàn thờ gia tiên là nét văn hóa đặc trưng của người Việt, cần được bố trí đúng phong thủy để gia đình bình an, làm ăn thuận lợi. Vị trí tốt nhất: phòng riêng hoặc vị trí cao nhất trong nhà, tầng trên cùng. Hướng bàn thờ: quay ra cửa chính hoặc hướng Đông/Nam. Tuyệt đối không đặt bàn thờ phía trên/dưới toilet, bếp, hoặc phòng ngủ.</p>
<p>Trong căn hộ chung cư: đặt bàn thờ treo tường ở vị trí cao, sạch sẽ, yên tĩnh — thường là phòng khách hoặc phòng riêng. Vật liệu bàn thờ: gỗ tự nhiên (gỗ hương, gỗ gụ) là tốt nhất. Không dùng gỗ tạp hoặc nhựa. Kích thước theo thước Lỗ Ban: chiều dài, rộng, cao đều phải rơi vào cung tốt. Đồ thờ cúng: lư hương, bát hương, chân nến đặt cân đối, đối xứng.</p>`
  },
  {
    title: 'Behind The Scenes: Cải Tạo Nhà Phố 20 Năm Tuổi',
    excerpt: 'Hành trình biến nhà phố cũ kỹ thành không gian sống hiện đại.',
    catIdx: 11,
    content: `<h2>Tái Sinh Nhà Phố — Khi Cũ Hóa Mới</h2>
<p>Nhà phố 20 năm tuổi tại Bình Thạnh — 4 tầng, 60m² đất, layout cũ kỹ với phòng tối, cầu thang chật, và sàn gạch bông hoa cũ. Chủ nhà muốn giữ ký ức (gạch bông, cửa sắt cũ) nhưng cần không gian sống hiện đại cho gia đình 5 người. Thách thức: ngân sách giới hạn 800 triệu cho toàn bộ cải tạo nội thất.</p>
<p>Giải pháp: giữ gạch bông cũ ở tầng trệt làm điểm nhấn heritage, kết hợp sàn gỗ công nghiệp cho các tầng trên. Cầu thang xây lại rộng hơn với lan can kính tạo cảm giác thoáng. Giếng trời mở ở giữa nhà giải quyết vấn đề thiếu sáng. Tầng thượng biến thành sân vườn mini với mái polycarbonate che mưa. Kết quả: ngôi nhà cũ trở thành không gian sống mới mẻ mà vẫn giữ được hồn cũ.</p>`
  },
  {
    title: 'Cẩm Nang Chọn Rèm Cửa Theo Phong Cách Nội Thất',
    excerpt: 'Rèm vải, rèm cuốn, rèm gỗ — phối hợp đúng phong cách.',
    catIdx: 9,
    content: `<h2>Rèm Cửa — Chi Tiết Nhỏ, Tác Động Lớn</h2>
<p>Rèm cửa chiếm diện tích thị giác lớn nhưng thường bị xem nhẹ. Chọn rèm sai có thể phá hỏng toàn bộ concept thiết kế. Nguyên tắc chung: rèm treo cao hơn khung cửa 15-20cm và rộng hơn khung cửa mỗi bên 15-25cm, tạo cảm giác cửa sổ lớn hơn và trần cao hơn thực tế.</p>
<p>Phong cách Modern/Minimalist: rèm cuốn (roller blind) hoặc rèm vải trơn màu neutral, ray kín. Scandinavian: rèm linen tự nhiên, trắng hoặc be, buông nhẹ. Industrial: rèm kim loại hoặc không rèm, dùng film dán kính. Indochine: rèm mành tre, rèm vải thêu hoa văn truyền thống. Classic/Neoclassical: rèm vải gấm có pelmet, swag và tails, tông vàng/đỏ/xanh đậm. Budget tip: rèm vải cotton đơn giản + cây treo đồng hoặc gỗ = hiệu quả tốt với giá dưới 1 triệu/cửa.</p>`
  },
  {
    title: 'Tối Ưu Không Gian Nhỏ: 15 Giải Pháp Nội Thất Thông Minh',
    excerpt: 'Nội thất đa năng, gương, màu sáng — tất cả mẹo cho nhà nhỏ.',
    catIdx: 9,
    content: `<h2>Nhà Nhỏ Không Có Nghĩa Là Chật Chội</h2>
<p>Với giá bất động sản ngày càng cao, căn hộ nhỏ 30-60m² trở thành xu hướng. Nhưng nhỏ không có nghĩa là thiếu tiện nghi. 15 giải pháp sau đây giúp tối ưu mọi mét vuông. Giải pháp 1: Giường gấp Murphy — ban ngày là tủ sách, ban đêm là giường ngủ. Giải pháp 2: Bàn ăn gắn tường hoặc bàn mở rộng — 2 chỗ thường ngày, 4 chỗ khi có khách.</p>
<p>Giải pháp 3: Gương lớn trên tường đối diện cửa sổ — nhân đôi ánh sáng và không gian thị giác. Giải pháp 4: Tủ kịch trần — tận dụng chiều cao, không bỏ phí khoảng trống phía trên. Giải pháp 5: Bậc thang kéo tích hợp ngăn kéo. Giải pháp 6: Kệ góc tường hình tam giác — tận dụng góc chết. Giải pháp 7: Rèm thay cửa tủ áo — tiết kiệm không gian mở cửa. Gam màu: trắng, be nhạt, xám nhạt giúp phòng trông rộng hơn.</p>`
  },
  {
    title: 'Phong Thủy Cửa Chính: Hướng Tốt Cho Từng Tuổi',
    excerpt: 'Tra cứu hướng cửa chính tốt nhất theo năm sinh và mệnh.',
    catIdx: 10,
    content: `<h2>Cửa Chính — Khẩu Khí Của Ngôi Nhà</h2>
<p>Trong phong thủy, cửa chính là "miệng" của ngôi nhà — nơi đón khí vào. Hướng cửa tốt mang lại tài lộc, sức khỏe; hướng xấu gây xui rủi, bệnh tật. Theo Bát Trạch, mỗi người có 4 hướng tốt và 4 hướng xấu dựa trên năm sinh. Đông Tứ Mệnh (Khảm, Ly, Chấn, Tốn): hướng tốt là Đông, Đông Nam, Nam, Bắc.</p>
<p>Tây Tứ Mệnh (Càn, Đoài, Cấn, Khôn): hướng tốt là Tây, Tây Bắc, Đông Bắc, Tây Nam. Nếu vợ chồng khác mệnh: ưu tiên hướng tốt của trụ cột gia đình, hoặc chọn hướng trung hòa. Kích thước cửa: theo thước Lỗ Ban, rộng 81-100cm, cao 205-215cm. Cửa không nên đối thẳng cầu thang, toilet, hoặc góc nhọn nhà đối diện. Giải pháp: đặt bình phong, cây xanh, hoặc gương bát quái hóa giải.</p>`
  },
  {
    title: 'Xu Hướng Bếp 2026: Smart Kitchen Và Tủ Bếp Tích Hợp IoT',
    excerpt: 'Bếp thông minh với cảm ứng, voice control, và quản lý từ smartphone.',
    catIdx: 12,
    content: `<h2>Smart Kitchen — Bếp Của Tương Lai Đã Ở Đây</h2>
<p>Smart Kitchen không còn là khái niệm xa vời — năm 2026, nhiều gia đình Việt Nam đã tích hợp công nghệ IoT vào tủ bếp. Tủ bếp thông minh với đèn LED cảm ứng tự động bật khi mở cánh, khóa an toàn điện tử cho ngăn chứa dao và hóa chất, và cảm biến rò rỉ nước gửi thông báo đến smartphone.</p>
<p>Bếp từ kết nối app: điều khiển nhiệt độ từ xa, hẹn giờ nấu, và nhận công thức nấu ăn trực tiếp trên mặt bếp. Tủ lạnh AI: nhận diện thực phẩm, gợi ý món ăn, và tự động thêm vào danh sách mua sắm khi hết hàng. Hệ thống hút mùi thông minh tự điều chỉnh tốc độ theo mức độ khói/mùi. Chi phí upgrade smart kitchen: từ 30-100 triệu tùy mức độ tích hợp.</p>`
  },
  {
    title: 'Cây Xanh Trong Nhà: Top 20 Loại Cây Dễ Chăm Cho Nội Thất',
    excerpt: 'Monstera, pothos, snake plant — cây nào hợp phòng nào?',
    catIdx: 13,
    content: `<h2>Cây Xanh — Decor Sống Động Nhất</h2>
<p>Cây xanh trong nhà không chỉ trang trí — chúng lọc không khí, giảm stress, và tăng humidity tự nhiên. Nhưng không phải cây nào cũng phù hợp mọi không gian. Phòng khách sáng: Monstera deliciosa (lá xẻ thùy), Bird of Paradise (chuối cảnh), Fiddle Leaf Fig (đa lá violin). Cần ánh sáng gián tiếp mạnh 4-6 giờ/ngày.</p>
<p>Phòng ngủ: Snake Plant (lưỡi hổ) — lọc không khí ban đêm, thải oxy. Peace Lily — chịu bóng tốt, ra hoa trắng đẹp. Phòng tắm ẩm: Pothos (trầu bà), Boston Fern (dương xỉ), ZZ Plant — chịu ẩm và thiếu sáng. Bếp: herbs (húng, kinh giới, rosemary) trong chậu nhỏ trên kệ cửa sổ — vừa trang trí vừa có gia vị tươi. Văn phòng: Rubber Plant, Dracaena — chịu máy lạnh, ít cần chăm sóc.</p>`
  },
  {
    title: 'Sai Lầm Phổ Biến Khi Tự Thiết Kế Nội Thất',
    excerpt: '10 lỗi mà người không chuyên thường mắc phải khi trang trí nhà.',
    catIdx: 7,
    content: `<h2>10 Sai Lầm Bạn Nên Tránh</h2>
<p>Tự thiết kế nội thất là cách tiết kiệm chi phí, nhưng thiếu kiến thức chuyên môn dễ dẫn đến những sai lầm tốn kém. Sai lầm 1: Mua nội thất trước khi có layout — kết quả: sofa quá to cho phòng, bàn ăn không vừa góc bếp. Luôn đo kỹ và vẽ layout trước. Sai lầm 2: Đặt tất cả nội thất dọc tường — tạo khoảng trống giữa phòng vô nghĩa.</p>
<p>Sai lầm 3: Dùng quá nhiều màu — giới hạn 3-4 màu chính cho toàn bộ nhà. Sai lầm 4: Bỏ qua tỉ lệ — đèn chùm nhỏ trong phòng trần cao, tranh nhỏ trên tường lớn. Sai lầm 5: Quên ánh sáng — chỉ dùng 1 đèn trần cho cả phòng. Sai lầm 6: Chạy theo trend mù quáng — terrazzo, arches, rattan có thể lỗi thời sau 3 năm. Sai lầm 7: Không có focal point — mỗi phòng cần 1 điểm nhấn thu hút mắt.</p>`
  },
  {
    title: 'Vật Liệu Chống Ẩm Cho Nhà Tắm: Giải Pháp Toàn Diện',
    excerpt: 'Gạch men, epoxy, PVC — vật liệu nào bền nhất cho phòng tắm Việt?',
    catIdx: 8,
    content: `<h2>Phòng Tắm Việt Nam — Cuộc Chiến Với Độ Ẩm</h2>
<p>Khí hậu nhiệt đới ẩm Việt Nam là thử thách lớn cho vật liệu phòng tắm. Độ ẩm 80-95%, nước bắn liên tục, và thiếu thông gió — điều kiện lý tưởng cho nấm mốc. Gạch men ceramic: giải pháp kinh điển, chống thấm 100%, dễ vệ sinh. Chọn gạch có hệ số chống trượt R10-R11 cho sàn. Giá: 150-500K/m².</p>
<p>Kính cường lực: thay thế rèm phòng tắm, ngăn nước bắn, dễ lau. Dày 8-10mm, chịu lực tốt. Tấm PVC ốp tường: thay thế gạch men cho phòng tắm nhỏ, lắp đặt nhanh, không cần thi công ướt. Giá: 200-350K/m². Sơn epoxy: chống thấm tuyệt đối cho trần và tường trên. Keo chống thấm silicon: chèn khe gạch, mối nối lavabo, bồn tắm — thay mới 2-3 năm/lần.</p>`
  },
  {
    title: 'Năng Lượng Mặt Trời Cho Nội Thất: Đèn Solar Và Pin Dự Phòng',
    excerpt: 'Giải pháp chiếu sáng sân vườn, ban công bằng năng lượng mặt trời.',
    catIdx: 13,
    content: `<h2>Solar Interior — Xanh Từ Bên Ngoài Vào Trong</h2>
<p>Năng lượng mặt trời không chỉ dành cho mái nhà — nhiều giải pháp solar đã có thể tích hợp vào thiết kế nội thất và ngoại thất. Đèn sân vườn solar: lắp đặt không cần dây điện, tự sạc ban ngày và chiếu sáng 8-12 giờ ban đêm. Giá: 200-800K/bộ. Phù hợp: lối đi, hàng rào, bậc thang ngoài trời.</p>
<p>Đèn ban công solar: clamp-on hoặc railing mount, không cần khoan tường. Quạt solar: quạt thông gió tích hợp pin solar cho nhà kho, gác mái, nhà vệ sinh — giảm ẩm tự nhiên không tốn điện. Rèm solar: tấm pin mỏng tích hợp vào rèm cửa sổ, vừa che nắng vừa phát điện. Công nghệ BIPV (Building Integrated Photovoltaics) đang phát triển nhanh, hứa hẹn nội thất tự cung cấp năng lượng trong tương lai gần.</p>`
  },
];

// ============ MAIN ============
async function main() {
  // Login
  console.log('🔐 Logging in...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vietnet.local', password: 'Admin@123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  const TOKEN = loginData.data.accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  };
  console.log('✅ Logged in');

  // ---- CATEGORIES ----
  console.log('\n📁 Creating categories...');
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
      console.log(`  ✅ [${i + 1}/${categories.length}] ${cat.name} (${cat.type}) → ${data.data.id}`);
    } else {
      console.log(`  ❌ [${i + 1}] ${cat.name}: ${data.message || JSON.stringify(data)}`);
    }
  }

  // Map project category indices (0-6) to new IDs, article category indices (7-13)
  const getProjectCatId = (idx) => categoryIds[idx] || null;
  const getArticleCatId = (idx) => categoryIds[idx] || null;

  // ---- PROJECTS ----
  console.log('\n🏗️ Creating projects...');
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const fullContent = p.content + '\n' + makeGalleryHtml(i);
    const body = {
      title: p.title,
      description: p.description,
      content: fullContent,
      category_id: getProjectCatId(p.catIdx),
      style: p.style,
      area: p.area,
      location: p.location,
      year_completed: p.year_completed,
      status: 'published',
      is_featured: i < 6, // first 6 featured
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
      console.log(`  ✅ [${i + 1}/${projects.length}] ${p.title}`);
    } else {
      console.log(`  ❌ [${i + 1}] ${p.title}: ${data.message || JSON.stringify(data)}`);
    }
  }

  // ---- ARTICLES ----
  console.log('\n📰 Creating articles...');
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const fullContent = a.content + '\n' + makeGalleryHtml(20 + i);
    const body = {
      title: a.title,
      excerpt: a.excerpt,
      content: fullContent,
      category_id: getArticleCatId(a.catIdx),
      status: 'published',
      is_featured: i < 5, // first 5 featured
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

  console.log('\n🎉 Seed complete!');
  console.log(`  Categories: ${Object.keys(categoryIds).length}/${categories.length}`);
  console.log(`  Projects: ${projects.length}`);
  console.log(`  Articles: ${articles.length}`);
}

main().catch(console.error);
