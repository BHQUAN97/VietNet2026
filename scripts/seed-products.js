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
function mkC(ps) { return JSON.stringify({ type: 'doc', content: ps.map(t => ({ type: 'paragraph', content: [{ type: 'text', text: t }] })) }); }

const P = [
  {t:'Sofa Góc L Scandinavian',c:'Sofa & Ghế',ps:['Sofa góc L Scandinavian bán chạy nhất VietNet 2025. Khung gỗ sồi, đệm foam HR bọc vải linen Bỉ. 2.8m x 1.7m phù hợp phòng khách từ 15m². Tay vịn mỏng tiết kiệm diện tích, chân gỗ cao 15cm dễ vệ sinh.','Đệm khóa kéo tháo giặt. Màu: Oat Cream, Sage Green, Warm Grey. Bảo hành khung 5 năm, đệm 2 năm.']},
  {t:'Ghế Ăn Eames Replica',c:'Sofa & Ghế',ps:['Eames DSW replica — PP nguyên sinh chịu 120kg, chân gỗ sồi Châu Âu, giằng thép chrome. Ergonomic ôm lưng, ngồi thoải mái 2 giờ.','12 màu classic đến trendy. Stackable. Phù hợp bàn ăn, bàn việc, quán café. Combo 4 giảm 10%.']},
  {t:'Bàn Ăn Gỗ Sồi 6 Chỗ',c:'Bàn & Kệ',ps:['Gỗ sồi FAS nhập Nga — hạng cao nhất. 160x80x75cm cho 6 người. Mặt 30mm phủ dầu linseed tự nhiên.','Chân thang chữ A vững chắc. Scandinavian, Japandi, Minimalist. Kết hợp Eames hoặc bench. Bảo hành 3 năm.']},
  {t:'Kệ Sách Tường Modular',c:'Bàn & Kệ',ps:['6 khối hộp gắn tường rail nhôm. MDF chống ẩm melamine vân sồi. Chịu tải 15kg/khối. Tổng 180x120cm.','Sắp xếp tự do: đối xứng, zigzag. Đèn LED strip tích hợp. Lắp đặt 2 giờ bởi VietNet.']},
  {t:'Tủ Quần Áo Âm Tường 2.4m',c:'Tủ & Lưu trữ',ps:['2.4m rộng x 2.6m cao. 3 cánh trượt An Cường E1. Ray Blum Áo êm ái chịu 80kg/cánh. Tận dụng tối đa chiều cao trần.','Nội thất tùy chỉnh: thanh treo, ngăn kéo, kệ giày. Phụ kiện Hafele: giá cravat, khay trang sức, đèn LED cảm ứng.']},
  {t:'Tủ Giày Thông Minh Xoay 360°',c:'Tủ & Lưu trữ',ps:['Xoay 360° chứa 40 đôi trong 60x60cm. Bearing thép chịu 80kg, xoay êm. 6 tầng nghiêng 15° giữ giày.','MDF acrylic trắng hoặc vân gỗ. Phiên bản gương toàn thân 2 trong 1. Lắp đặt đơn giản.']},
  {t:'Đèn Thả Bàn Ăn Đồng Thau',c:'Đèn & Phụ kiện',ps:['Đồng thau 100% patina tự nhiên theo thời gian. 3 bóng E27 LED warm 2700K. Thanh ngang 90cm cho bàn 120-180cm.','Dây treo 50-120cm. Mid-Century, Industrial, Scandinavian. Kèm 3 bóng Edison filament.']},
  {t:'Đèn Sàn Arc Chân Marble',c:'Đèn & Phụ kiện',ps:['Cảm hứng Arco huyền thoại. Chân marble Carrara 8kg vững chắc. Cần chrome vươn 1.5m chiếu sáng sofa.','Chao linen khuếch tán mềm. Bóng E27 12W warm. Foot pedal switch. Cao tổng 2.1m.']},
  {t:'Gương Tròn Khung Gỗ Sồi',c:'Đèn & Phụ kiện',ps:['Focal point cho hành lang, khách, tắm. Khung sồi dày 3cm phủ dầu. Gương Bỉ 5mm không méo. Đường kính 80cm.','3 size: 60, 80, 100cm. Tạo rộng hơn 30%. Phụ kiện treo chịu lực đi kèm.']},
  {t:'Thảm Jute Tự Nhiên 160x230',c:'Đèn & Phụ kiện',ps:['Jute 100% dệt thủ công Ấn Độ — phân hủy sinh học. 160x230cm. Braid weave texture đẹp mắt.','Golden-beige phù hợp mọi phong cách. Chống tĩnh điện. Máy hút bụi vệ sinh, tránh giặt nước.']},
  {t:'Ghế Accent Velvet Ý',c:'Sofa & Ghế',ps:['Điểm nhấn màu sắc phòng khách. Velvet Ý chống bụi, khung sồi, foam HR 40kg/m³. Chân đồng đúc 20cm.','5 màu: Emerald, Navy, Burnt Orange, Dusty Rose, Charcoal. 75x80x85cm. Bảo hành 3 năm.']},
  {t:'Bàn Coffee Óc Chó Epoxy',c:'Bàn & Kệ',ps:['Óc chó nguyên tấm — mỗi chiếc độc bản nhờ vân gỗ. Epoxy trong suốt bảo vệ tạo hiệu ứng sâu. 100x60x40cm.','Chân thép sơn tĩnh điện hoặc brass. Live edge hoang sơ. Kèm certificate gỗ hợp pháp.']},
  {t:'Kệ TV Floating Gỗ Sồi 180cm',c:'Bàn & Kệ',ps:['180x30x25cm floating thoáng sàn. Gỗ sồi phủ dầu. Ống luồn dây ẩn — chỉ lộ 1 dây nguồn duy nhất.','Chịu 40kg TV 65 inch + soundbar. Ngăn kéo ẩn đựng remote. Lắp đặt 1 giờ kèm luồn dây.']},
  {t:'Tủ Bếp Chữ L Trọn Bộ',c:'Tủ & Lưu trữ',ps:['Trọn bộ tủ trên dưới + countertop đá thạch anh. An Cường E1 acrylic/laminate. Blum Clip Top, Tandembox.','Chậu Blanco, vòi Grohe, rổ pull-out, thùng rác phân loại, kệ xoay góc. 3D render trước sản xuất.']},
  {t:'LED Panel Âm Trần 60x60',c:'Đèn & Phụ kiện',ps:['60x60cm 40W thay tuýp truyền thống. LGP khuếch tán đều. CRI>90. 3 nhiệt độ màu tùy chọn.','Tiết kiệm 60% điện. 50.000 giờ tuổi thọ (11 năm). Bảo hành 3 năm đổi mới.']},
  {t:'Rèm Linen Blackout 2 Lớp',c:'Đèn & Phụ kiện',ps:['Voan lọc sáng + linen blackout cản 95%. Cho cửa 2m x 2.5m bao gồm ray Somfy silent và lắp đặt.','Linen polyester blend bền giặt máy. 8 màu tự nhiên. Kéo rèm không tiếng ồn.']},
  {t:'Bàn Standing Desk Điện',c:'Bàn & Kệ',ps:['Motor đôi 65-125cm, lưu 4 vị trí. Mặt bamboo 140x70cm chống cong. Khung thép chịu 80kg.','3.5cm/s, dưới 45dB yên lặng. Cable management, hook, USB tích hợp. Motor bảo hành 5 năm.']},
  {t:'Gối Tựa Lưng Ergonomic',c:'Sofa & Ghế',ps:['Memory foam ôm sát cột sống thắt lưng. Vỏ mesh thoáng khí tháo giặt. Dây elastic cố định ghế.','35x32x12cm. Đen, xám, beige. Combo 2 giảm 15%. Bảo hành 1 năm đổi mới.']},
  {t:'Hộp Tissue Gỗ Óc Chó Handmade',c:'Đèn & Phụ kiện',ps:['CNC và hoàn thiện thủ công. 25x13x9cm. Tung oil food-safe. Mỗi hộp vân gỗ khác — độc bản.','Đáy silicone chống trượt. Quà tặng premium doanh nghiệp. Set 3 giảm 20%.']},
  {t:'Bộ Chén Ceramic Bát Tràng',c:'Đèn & Phụ kiện',ps:['Men lửa thủ công Bát Tràng. Bộ 4 chén 12cm. Mỗi chén glaze tự nhiên khác nhau — wabi-sabi.','An toàn vi sóng, máy rửa chén. 4 men: Celadon, Ash, Rust, Indigo. Hộp kraft cao cấp.']},
];

async function main() {
  const lr = await req('POST', '/auth/login', { email: 'admin@vietnet.local', password: 'Admin@123' });
  TOKEN = lr.body.data?.accessToken;
  const cr = await req('GET', '/categories?limit=100');
  const CATS = {};
  for (const c of (cr.body.data || [])) CATS[c.name] = c.id;

  let ok = 0;
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    const data = { name: p.t, description: mkC(p.ps), category_id: CATS[p.c], is_featured: i < 6 };
    const res = await req('POST', '/products', data);
    if (res.status === 201) {
      await req('PATCH', `/products/${res.body.data.id}/publish`);
      ok++;
      console.log(`  [${ok}] ${p.t}`);
    } else {
      console.error(`  FAIL ${p.t}: ${res.body.message}`);
    }
  }
  console.log(`\nProducts: ${ok}/20`);
}
main().catch(console.error);
