# MISA DESIGN SYSTEM
## Tài liệu quy chuẩn thiết kế giao diện Web Platform

**Copyright © 1994 - 2025 MISA JSC. All Rights Reserved.**

---

# PHẦN 1: NGUYÊN TẮC CHUNG

## 1.1 Nguyên tắc chung khi thiết kế

### Dễ học, dễ nhớ (Thiết kế)

1. Các chức năng được sắp xếp theo thứ tự tác nghiệp của người dùng trong thực tế.
2. Các chức năng chính, hay được sử dụng cần đặt tại vị trí dễ nhận biết, không phải thao tác qua nhiều bước để tìm đến.
3. Biểu tượng (Icon) của các chức năng giống nhau phải đồng nhất.
4. Phím tắt dễ nhớ, có tooltip, dễ thực hiện, phím tắt cho các chức năng giống nhau phải đồng nhất trong toàn bộ chương trình.
5. Các chức năng phức tạp cần có thông tin hướng dẫn ngay trên form.

### Dễ dàng nhập liệu (Thiết kế - Thi công)

1. Các thông tin cần nhập liệu được sắp xếp theo thứ tự phù hợp với thói quen thao tác của người dùng.
2. Có giá trị mặc định hợp lý.
3. Có các hướng dẫn nhập liệu ngay trên màn hình thao tác (ví dụ: real-time cho biết số ký tự còn được nhập trên các ô Text, chỉ ra các phím tắt để nhập nhanh, tìm nhanh...).
4. Tự động nhập liệu thay người dùng khi có thể (ví dụ điền mã khách hàng chương trình tự động điền các thông tin liên quan từ danh mục hoặc nhập đơn giá, số lượng tự động tính thành tiền...).

**Đối với ComboBox:** các thông tin người dùng hay nhập/chọn sẽ xuất hiện trên cùng.

**Quy tắc chọn control nhập liệu:**

| Số bản ghi | Control phù hợp |
|---|---|
| 2–3 bản ghi | Radio / Checkbox |
| 4–8 bản ghi | Dropdown (chỉ chọn, không gõ tìm) |
| >8 bản ghi | ComboBox (có gõ tìm) |

**Khuyến nghị nhập liệu:**

- ComboBox dùng LoadOnDemand để đảm bảo hiệu năng với danh mục > 40 bản ghi (5 lần cuộn × 8).
- Đối với các TextBox, ComboBox cần có AutoComplete một cách hợp lý.
- Nên có chức năng nhân bản hoặc sinh từ bản ghi có sẵn.
- Hạn chế phải dùng cả chuột và bàn phím mới có thể nhập liệu được.
- Cho phép thêm nhanh các danh mục liên quan tại giao diện nhập liệu nghiệp vụ.
- Cho phép ẩn hiện những chức năng người dùng không sử dụng.

### Kiểm soát được thao tác người dùng (Thi công)

1. Chương trình phải phản hồi lại với mỗi thao tác của người dùng: Đổi màu khi Hover/Click, Disable các button hoặc có Busy Indicator sau khi Click để không bị thực hiện nhiều lần ngoài ý muốn.
2. Chức năng xử lý lâu cần có thông báo trước khi thực hiện. Các chức năng xử lý lâu hơn 5s cần có thanh tiến trình hiển thị % thực hiện, chuyển biểu tượng con trỏ chuột sang chế độ chờ.

### Kiểm soát được lỗi

- Có cảnh báo khi người dùng thao tác sai, nội dung cảnh báo dễ hiểu.
- Focus vào ô nhập liệu bị lỗi đầu tiên.

---

## 1.2 Yêu cầu tiện dụng chung

### Tab Order, Focus nhập liệu

- Khi mở form nhập liệu phải focus vào ô nhập số liệu đầu tiên.
- Thiết lập TabOrder giữa các control phải đặt chế độ SelectAll khi focus vào ô nhập liệu.
- Sử dụng phím **Tab** để di chuyển.
- Sử dụng tổ hợp phím **Shift+Tab** để di chuyển ngược trở về Control trước.

**TabIndex:** Theo thứ tự **Trái → Phải**, tiếp đến **Trên → Dưới**.

- Trường hợp gom nhóm thông tin: các thông tin trong cùng 1 nhóm sẽ được chuyển tab bên trong nhóm trước, sau đó mới chuyển sang nhóm khác.

### Phím tắt

- Tất cả các hoạt động trên sản phẩm đều có thể sử dụng phím tắt.
- Với tất cả những chức năng và tiện ích có sử dụng phím tắt thì phải show cho người dùng thấy được phải dùng phím tắt gì, có thể show bằng cách dùng tooltip hoặc status.
- Quy định chi tiết: xem mục 7.2.

### Tooltip

- Tất cả các từ viết tắt phải có Tooltip.
- Phải diễn giải đầy đủ một chức năng, một thông tin mà tên của nó không thể hiện được đầy đủ.

### HotTrack

- Khi di chuyển chuột qua thì đối tượng được đổi màu để người dùng dễ quan sát.
- Các đối tượng cần sử dụng HotTrack: Tab, Sidebar, Toolbar, Button, Combo...
- Các action mà người dùng có thể bấm được thì icon chuột phải là hình bàn tay.

### Label

- Tất cả các Label chỉ được viết tắt khi có từ 4 từ trở lên.
- Khi viết tắt bắt buộc phải có tooltip để giải thích ý nghĩa đầy đủ.

---

# PHẦN 2: STYLES

## 2.1 Màu sắc (Color)

Mô tả quy chuẩn về các màu sắc sử dụng thường xuyên, phân chia theo từng loại màu, từng thành phần sử dụng.

### Nhóm Base – Nhóm màu cấp 1

| Tên màu | Mô tả | Sử dụng |
|---|---|---|
| **Brand** | Màu chính của app | Nút chính, liên kết, trạng thái active |
| **Accent** | Màu nhấn mạnh (ít sử dụng) | Điểm nhấn đặc biệt |
| **Info** | Màu thông tin hướng dẫn | Toast info, inline notification |
| **Warning** | Màu cảnh báo | Toast warning, inline warning |
| **Danger** | Màu nguy hiểm | Xóa, hủy dữ liệu, lỗi |
| **Success** | Màu thành công | Toast success, trạng thái hoàn tất |
| **Neutral** | Màu trung tính | Text, border, background |
| **Alpha White** | Màu trắng có opacity | Text, border, background trên nền đậm |
| **Alpha Black** | Màu đen có opacity | Text, border, background trên nền trắng |

- Các ứng dụng có thể tùy chỉnh màu của nhóm Base theo ứng dụng của mình.
- Công cụ sinh màu dựa vào mã màu chính: https://uicolors.app/generate/1f1f1f

### Nhóm cấp 2: Text, Icon, Stroke, Bg

- Đây là nhóm màu không khai báo trực tiếp biến màu mà gọi link tới màu đã khai báo tại nhóm Base cấp 1.
- Dự án không cần chỉnh màu ở đây — khi màu ở nhóm Base được chỉnh sẽ tự ăn màu của nhóm này.

---

## 2.2 Kiểu chữ (Typography)

MISA thống nhất sử dụng font chữ **Inter** cho tất cả các ứng dụng.

Font chữ Inter là một font sans-serif hiện đại, được thiết kế tối ưu cho giao diện số và đọc trên màn hình. Chi tiết: https://rsms.me/inter/

**Kích thước font chữ tiêu chuẩn hiển thị: 13px.**

### Text Styles

| Style | Sử dụng |
|---|---|
| **H1 – Banner Title** | Tiêu đề lớn trên các banner |
| **H2 – App, Page Title** | Tiêu đề app, tiêu đề page |
| **H3 – Form, Card, Section, Group Title** | Tiêu đề form, popup, dialog, section, group. Thông tin cần nhấn mạnh hơn chữ tiêu chuẩn |
| **Body Regular** | Font size tiêu chuẩn, sử dụng thường xuyên nhất |
| **Body Large** | Đoạn văn bản lớn, Rich Text, nội dung bài viết |

### Body Regular — Các biến thể

| Biến thể | Sử dụng |
|---|---|
| **Regular** | Label, dữ liệu trên bảng, mô tả, toàn bộ dữ liệu thông thường |
| **Medium** | Chữ trong Button, Tag, Header bảng, Navigation text |
| **Semi Bold** | Nội dung cần phân cấp mạnh hơn medium (VD: Tên người) |
| **Bold** | Data number cần nhấn mạnh |

---

## 2.3 Icons

MISA sử dụng bộ icon dạng **stroke, nét 1.5px**. Bao gồm các kích thước phổ biến: **16px, 20px, 24px, 32px**.

Bộ icon sử dụng nét 1.5px nhằm tạo sự cân bằng giữa độ rõ và độ tinh tế. So với nét 2px truyền thống, nét 1.5px giúp giao diện trông thoáng hơn, chuyên nghiệp hơn, đặc biệt phù hợp cho web app, dashboard và các hệ thống nhiều dữ liệu.

Nguồn icon chính: **Tabler Icons** — https://tabler.io/icons

### Kích thước

| Kích thước | Mô tả |
|---|---|
| 16px | Nhỏ — trong các control nhỏ, inline text |
| 20px | Trung bình nhỏ — toolbar, navigation |
| **24px (Mặc định)** | Trung bình — phổ biến nhất |
| 32px | Lớn — tiêu đề, điểm nhấn |

### Bố cục

- Các icon được tạo trên lưới (grid) dựa trên các hình dạng cơ bản (tròn, vuông, chữ nhật).
- Giữ được độ nặng thị giác tương đương giữa các icon có tỷ lệ khác nhau.

### Khoảng cách

- Icon cần có khoảng trống xung quanh để đảm bảo tính dễ đọc và dễ thao tác.
- Vùng chạm tối thiểu **40px** cho icon tương tác độc lập.
- Kích thước icon nên khớp với chiều cao dòng (line height) của văn bản đi kèm.

### Stroke và Radius

- Nét vẽ đồng nhất **1.5px** cho cả đường nét bên trong và bên ngoài.
- Kết thúc bằng đầu tròn (rounded terminus) hoặc đầu phẳng (butt-cap).
- **Radius ngoài:** 3px (mềm mại, thân thiện).
- **Chi tiết phức tạp:** 2px (gọn gàng, rõ nét).

### Màu sắc Icon

- Thay đổi tùy theo nền hiển thị, mức độ quan trọng, và chủ đề màu (color theme) đang sử dụng.

### Fill Icon

Sử dụng icon dạng đặc (filled) trong 2 trường hợp:

1. **Trạng thái active/inactive:** Icon đặc cho active, icon viền cho inactive.
2. **Icon đứng một mình trên nền phức tạp:** Tạo độ tương phản cao hơn (VD: location pin trên bản đồ).

---

## 2.4 Bố cục trang (Layout)

### Màn hình tổng quan

- Cho phép tạo nhiều màn hình giao diện, mỗi giao diện chứa nhiều loại biểu đồ khác nhau theo nhu cầu.
- Có thể kéo thả vị trí, điều chỉnh độ rộng.
- Đồng nhất nút **Lưu**, **Hủy** phía cuối trang.

### Màn hình danh sách

- Màu nền xám, có khoảng cách giữa bảng và lề xung quanh.
- Bấm vào dòng để chuyển vào trang chi tiết hoặc bật popup.

**Quy tắc sắp xếp toolbar:**

- **Bên trái:** Tiêu đề bảng.
- **Bên phải:** Các chức năng thao tác.
  - Nút chính: ngoài cùng bên phải.
  - Nút phụ: bên trái nút chính.
  - Nút "More": bên phải nút chính.

### Các dạng màn hình danh sách

| Dạng | Đặc điểm | Phù hợp với |
|---|---|---|
| **Nhiều tab** | Mỗi tab là một danh sách khác nhau | Phân hệ có nhiều loại dữ liệu |
| **Master trái rộng, Detail phải nhỏ** | Bảng lớn bên trái, preview bên phải | Quản lý khối lượng lớn bản ghi, duyệt nhanh |
| **Master trái nhỏ, Detail phải rộng** | Tóm tắt bên trái, chi tiết bên phải | Làm việc sâu với từng bản ghi (CRM, hợp đồng) |
| **Master trên, Detail dưới** | Bảng trên, chi tiết dưới (có thể dạng tab) | Dashboard, so sánh/cập nhật liên tục nhiều bản ghi |
| **Master + Drawer** | Danh sách + drawer bên phải đè lên | Xem nhanh nội dung chi tiết, kéo co độ rộng |
| **Dạng Card** | Sắp xếp hiện đại, trực quan, đẹp mắt | Task, tuyển dụng, ticket, sản phẩm, thông báo |

### Màn hình thêm và sửa

**Quy tắc chung:** Nút **Lưu** và **Hủy** luôn ghim ở vị trí cuối cùng của trang.

| Dạng | Áp dụng |
|---|---|
| **Dạng page** | Form không quá nhiều trường, mở rộng full trang |
| **Popup nhỏ** | Màn hình danh mục, thông tin đơn giản |
| **Popup full màn hình** | Rất nhiều thông tin, cần tối ưu không gian |

### Màn hình chi tiết

**Tách màn hình xem riêng (cho giao diện phức tạp):**

- Giao diện xem cần bố trí thông tin khác biệt hẳn so với view sửa.
- Luôn ghim các phím chức năng thao tác ở góc trên bên phải.
- Hover vào từng trường cho phép chỉnh sửa inline.

**Không tách mode xem riêng (cho form đơn giản):**

- Bấm xem đồng thời sửa luôn.
- Phù hợp khi thao tác cập nhật là chính, rủi ro thấp.

**Lưu ý:** Nút **Primary** và **More** (icon 3 chấm) luôn nằm phía ngoài cùng bên phải. Nút More luôn nằm phía bên phải của nút Primary.

---

# PHẦN 3: COMMUNICATION

## 3.1 Nội dung (Contents)

Nội dung thông báo, hiển thị cho người dùng trên ứng dụng phải **rõ ràng, chính xác và ngắn gọn**.

### Ngắn gọn, đơn giản, rõ ràng, liên quan trực tiếp

- Người dùng chỉ cần đọc lướt nhanh là có thể xác định được mình sẽ làm gì và chuyện gì sẽ xảy ra.
- ✅ **Nên:** Cố gắng viết ít chữ nhất mà vẫn truyền tải được đúng nội dung.
- ❌ **Không nên:** Nội dung giải thích dài dòng khiến người dùng khó đọc.

### Xưng hô

- Ngôi thứ nhất: **tôi**, **của tôi**.
- Ngôi thứ hai: **bạn**, **của bạn**.
- Nhấn mạnh nội dung do người dùng sở hữu → dùng ngôi thứ nhất.
- Nội dung truyền đạt trực tiếp → dùng ngôi thứ hai.
- ❌ **Tránh** sử dụng kết hợp cả 2 ngôi trong cùng một thông báo.

### Từ ngữ thông dụng

- Sử dụng từ ngữ phổ thông, quen thuộc với mọi đối tượng người dùng.
- ❌ Tránh sử dụng từ ngữ mang tính kỹ thuật.

### Ký tự số

- ✅ **Nên:** Sử dụng ký tự số (1, 2, 3...) thay vì chữ số (một, hai, ba...).

---

## 3.2 Thông báo (Announcement)

Thông báo hiển thị cho người dùng biết về những thông tin, cảnh báo từ ứng dụng.

### Thông báo kêu gọi hành động

- Hiển thị dạng **dialog** trực tiếp trên màn hình.
- Yêu cầu người dùng phải đưa ra lựa chọn trước khi tiếp tục.
- Chi tiết xem mục 3.3 Dialog.

### Thông báo dạng Toast

Có **4 loại**: Thành công, Lỗi, Cảnh báo, Thông tin.

| Thuộc tính | Quy định |
|---|---|
| Thời gian hiển thị | 5 giây, sau đó tự động đóng |
| Số lượng tối đa | 3 thông báo gần nhất |
| Độ rộng tối đa | 400px |
| Số dòng tối đa | 2 dòng |
| Vị trí | Phía trên, góc phải, dưới header bar |
| Thứ tự | Thông báo mới nhất trên cùng |

**Quy tắc:**
- ✅ Khi dữ liệu ngắn → hiển thị độ rộng theo độ rộng chữ.
- ❌ Không fix-width rộng không cần thiết, che mất dữ liệu bên dưới.
- ❌ Không kéo dài độ rộng vượt 400px.

### Thông báo dạng Notification

Có **4 loại**: Thành công, Lỗi, Cảnh báo, Thông tin.

| Thuộc tính | Quy định |
|---|---|
| Nguồn phát | Hệ thống tự động bắn, không do hành động người dùng |
| Đóng | Không tự động đóng, người dùng bấm X để tắt |
| Độ rộng tối đa | 400px |
| Đồng bộ | Đồng thời bắn cả thông báo trong quả chuông |
| Vị trí | Phía trên, góc phải |

### Thông báo dạng Inline

- Hiển thị trực tiếp bên trong nội dung chính, gần khu vực thao tác/ngữ cảnh liên quan.
- Không nổi lên toàn giao diện.
- Có thể có hoặc không có icon X để tắt.
- Có 4 loại: Thành công, Lỗi, Cảnh báo, Thông tin.
- Tiêu đề ngắn có thể căn nội dung và tiêu đề trên cùng 1 dòng.

### Thông báo dạng Global Inline

- Hiển thị ở trên cùng của app, phía trên thanh header.
- Phù hợp cho: hết thời hạn sử dụng, hệ thống bảo trì, chậm treo.
- Tùy trường hợp có icon X để tắt hoặc không.

---

## 3.3 Dialog

Là thành phần giao diện dùng khi cần thông báo thông tin quan trọng, yêu cầu người dùng đưa ra quyết định hoặc xác nhận trước khi thực hiện hành động.

### Thành phần

**1. Tiêu đề:** Nên là cụm từ hoặc câu hỏi ngắn gọn, rõ ràng thể hiện hành động cần xác nhận.

**2. Mô tả:** Diễn giải kết quả của hành động sau khi xác nhận.

- Dưới 8 từ → 100% người dùng đọc và hiểu hết.
- 14 từ → 90% người dùng đọc.
- 43 từ → chỉ 10% người dùng đọc.

**3. Button:** Tối thiểu 1, tối đa 3 button, sắp xếp trên 1 hàng, ưu tiên từ phải sang trái.

| Button | Mô tả |
|---|---|
| **Primary (ngoài cùng phải)** | Tên thể hiện hành động tiếp theo, hoặc "Đóng" cho dialog thông báo |
| **Secondary** | Mức ưu tiên thấp hơn, khi không dùng sẽ không hiển thị |
| **Hủy** | Cho phép đóng dialog, không thực hiện hành động |

### Quy tắc sử dụng

- ✅ Tiêu đề và nội dung phải đồng nhất nhau.
- ✅ Nội dung nên thể hiện được kết quả sau khi thực hiện hành động.
- ❌ Hạn chế lặp từ giữa tiêu đề và mô tả.
- ❌ Không hỏi lại câu vô nghĩa mà tiêu đề đã thể hiện.
- ❌ Không chồng các dialog lên nhau. Dùng Popup với các bước riêng biệt nếu cần chuỗi hành động.

---

## 3.4 Loading

Trạng thái loading giúp trấn an người dùng rằng hệ thống vẫn đang làm việc.

| Thời gian chờ | Hành động |
|---|---|
| < 1s | Cân nhắc sử dụng loading |
| > 1s | **Bắt buộc** hiển thị trạng thái loading |
| > 4s | Sử dụng **Progress bar** |

### 1. Spinner

- Đường tròn liền khuyết 1 góc, xoay tròn đều.
- Kích thước thông thường: border **3px**.
- Kích thước nhỏ trong control: border **2px**.
- Màu sắc tùy thuộc style ứng dụng.

**Sử dụng:**
- Trong màn hình chi tiết, popup cần chờ.
- Trong các control cần load dữ liệu (button, combobox...).

### 2. Loading Skeleton

- Giúp người dùng hình dung trước bố cục khi dữ liệu tải xong.
- Những thành phần đã có sẵn dữ liệu → hiển thị luôn, không cần skeleton.
- Thiết kế nên thể hiện được đúng layout mà nội dung thật sẽ hiển thị.

**Phù hợp cho:**
- Màn hình tổng quan có nhiều thông tin cùng load.
- Màn hình danh sách, card.
- Biểu đồ (skeleton thể hiện hình dạng biểu đồ).

### 3. Tiến trình dài (> 10s)

- Hiển thị dạng tiến trình ở góc phải màn hình.
- Người dùng có thể làm việc khác trong khi chờ.
- Bấm X ở thanh trên cùng → cảnh báo xác nhận hủy bỏ tất cả.
- Bấm X ở từng dòng → chỉ hủy tiến trình đó.
- Cho phép thu gọn các tiến trình.

---

## 3.5 Empty State

Quy định thiết kế "Trạng thái trống dữ liệu" bao gồm illustration, văn bản và CTA.

### Các yếu tố cấu thành hình hoạ

| Yếu tố | Mô tả | Màu sắc |
|---|---|---|
| **Fog Shape** | Mảng sương, lớp dưới cùng | Neutral/200 |
| **Icon chính** | Icon đại diện nội dung, thành phần lớn nhất | Neutral/800 |
| **Ground line** | Đường cơ sở bên dưới | Neutral/800 |
| **Icon phụ** | Thể hiện hành động/trạng thái dữ liệu | Icon/Brand |
| **Cloud Shape** | Line art mây, yếu tố phụ phía sau | Neutral/400 |
| **Pattern** | Ngôi sao trang trí xung quanh | Neutral/400, 800, Brand |
| **Plane** | Máy bay trang trí + đường bay | Icon/Brand, Neutral/800 |

**Quy định:**
- Độ dày nét: **2px** (line art).
- Khoảng cách Illustration → Title: **16px**.
- Khoảng cách Title → Subtitle: **4px**.
- Khoảng cách Subtitle → Button: **24px**.
- Top Padding: **120px**.

### Trạng thái

**Initial State — Chưa từng phát sinh dữ liệu:**
- Hiển thị màn hình trống với: Thêm mới, Nhập khẩu.
- **Không** chứa: Tìm kiếm, Lọc, Data table.
- Khi đã 1 lần thêm dữ liệu → không còn trạng thái này.

**No Data State — Đã từng có dữ liệu nhưng xóa hết / lọc không có kết quả:**
- Hiển thị hình minh họa đơn giản báo không tìm thấy dữ liệu.
- Áp dụng cả khi xóa không còn bản ghi nào hoặc tìm kiếm/lọc không có kết quả.

---

## 3.6 Cảnh báo thoát trang

*(Trang leave-page-warning — nội dung chi tiết cần tham chiếu từ Figma component)*

Hiển thị cảnh báo khi người dùng rời khỏi trang mà có dữ liệu chưa lưu.

---

## 3.7 Error Page

*(Trang error-page — nội dung chi tiết cần tham chiếu từ Figma component)*

Quy định thiết kế cho các trang lỗi (404, 500, v.v.).

---

# PHẦN 4: COMPONENTS

## 4.1 Button

Button cho phép người dùng thực hiện các hành động và lựa chọn chỉ với 1 lần nhấn.

### Các loại Button

| Loại | Mô tả | Ví dụ sử dụng |
|---|---|---|
| **Nút chính (Primary)** | Dạng đặc, màu Brand, chữ trắng, không có viền | Lưu, Gửi, Đăng nhập, Mua ngay |
| **Nút phụ (Secondary)** | Dạng rỗng có stroke, chữ đen | Hủy, Quay lại |
| **Link Button** | Dạng liên kết chữ bấm được | Chuyển hướng trang/chức năng |
| **Icon Button** | Chỉ hiển thị icon, không chữ | Tìm kiếm, Xóa, Sửa, Đóng |
| **Button Split** | 2 phần: hành động mặc định + mũi tên dropdown | Hành động chính + tùy chọn thêm |

### Bộ màu hỗ trợ (7 màu)

Brand, Info, Warning, Danger, Success, Neutral (tối), Neutral Inverse (sáng).

### Kích thước và quy tắc

- **Min-width:** 80px.
- **Radius:** 8px.
- Text trong nút nên tối đa **khoảng 3 từ**, ngắn gọn mà đầy đủ ý nghĩa.

### Trạng thái

| Trạng thái | Mô tả |
|---|---|
| **Enable** | Phần tử tương tác được |
| **Disable** | Vô hiệu hóa. **Hạn chế sử dụng** — nên enable sẵn, khi bấm mà chưa đủ điều kiện thì thông báo lỗi |
| **Hover** | Khi di chuột dừng trên phần tử |
| **Pressed** | Khi nhấn/chạm bằng con trỏ hoặc bàn phím |
| **Focus** | Viền sáng khi tab tới. Viền ngoài **2px**, cách button **2px** |

### Phân cấp

- Sử dụng loại nút tùy theo mức độ nhấn mạnh.
- Đảm bảo trạng thái khả dụng của một nút không giống trạng thái đã tắt của nút khác.

---

## 4.2 Text Field

Trường văn bản cho phép người dùng nhập và chỉnh sửa văn bản.

### Dạng hiển thị Label

| Dạng | Ưu điểm | Nhược điểm | Khi nào dùng |
|---|---|---|---|
| **Label ngang** | Tiết kiệm diện tích, view/edit không đổi vị trí | Label dài khó hiển thị | Form nhiều trường, label ngắn |
| **Label trên, control dưới** | Dễ nhập liệu, responsive tốt, hiển thị tốt label dài | Form dài phải cuộn nhiều | Form ít trường, label dài, cần responsive |
| **Không dùng label** | Sạch, gọn, tiết kiệm không gian | Dễ mơ hồ, thiếu accessibility | Form cực ngắn (1–3 trường), tác vụ quen thuộc |

> **Lưu ý:** Mỗi form nên chỉ dùng một kiểu label để đảm bảo đồng nhất giao diện.

### Trạng thái

Normal → Hover → Focus → Readonly → Error → Validate → Verifying.

**Lưu ý:**
- Trạng thái **Lỗi:** focus vào ô lỗi → tự động hiển thị tooltip lỗi.
- Khi **focus** vào ô nhập liệu → giá trị tự động bôi đen hết (SelectAll). Bấm lại chuột vào vị trí cần sửa → bỏ bôi đen.

### Khuyến nghị

- ✅ Đánh dấu **tùy chọn** thay vì bắt buộc (vì hầu hết trường là bắt buộc).
- ✅ Không phải lúc nào cũng cần placeholder. Chỉ dùng khi cần định dạng cụ thể.

---

## 4.3 Dropdown

*(Trang dropdownlist — nội dung chi tiết tham chiếu từ Figma component)*

- Dùng với dữ liệu **4–8 bản ghi**, chỉ có chọn, không có gõ tìm.
- Xem quy tắc chọn control ở mục 1.1.

---

## 4.4 ComboBox

*(Trang combobox — nội dung chi tiết tham chiếu từ Figma component)*

- Dùng với dữ liệu **>8 bản ghi**, có gõ tìm.
- Dùng LoadOnDemand với danh mục > 40 bản ghi.
- Các thông tin hay nhập/chọn xuất hiện trên cùng.
- Xem quy tắc chọn control ở mục 1.1.

---

## 4.5 Checkbox

*(Trang checkbox — nội dung chi tiết tham chiếu từ Figma component)*

- Dùng với dữ liệu **2–3 bản ghi**, cho phép chọn nhiều.

---

## 4.6 Radio Button

*(Trang radiobutton — nội dung chi tiết tham chiếu từ Figma component)*

- Dùng với dữ liệu **2–3 bản ghi**, cho phép chọn 1.

---

## 4.7 Date Time Picker

*(Trang datetimepicker — nội dung chi tiết tham chiếu từ Figma component)*

---

## 4.8 Context Menu

*(Trang contextmenu — nội dung chi tiết tham chiếu từ Figma component)*

---

# PHẦN 5: PATTERNS

## 5.1 Data Table

Các bảng dữ liệu cho phép người dùng quét, phân tích, so sánh, lọc, sắp xếp và thao tác để thu được thông tin chi tiết.

### Cấu trúc bảng dữ liệu

1. Ô tìm kiếm dữ liệu trong bảng **(Bắt buộc)**
2. Bộ lọc nhanh *(Tùy chọn)*
3. Các action toàn bảng: Reload, Xuất khẩu, Thiết lập bảng, Lọc
4. Nội dung: Header, Các dòng dữ liệu, Footer
5. Paging phân trang

### Các dạng bảng

- **Bảng đơn giản:** Phổ biến nhất, dùng cho nhiều loại danh sách (danh mục, nhân viên, khách hàng...).
- **Bảng phức tạp có gộp nhóm cột:** Dùng cho bảng phức tạp cần gộp nhiều thông tin cha-con (VD: Bảng lương).

### Căn lề cột dữ liệu

| Loại dữ liệu | Căn lề | Ví dụ |
|---|---|---|
| Dạng văn bản | **Bên trái** | Tên, Mã, Mô tả |
| Số không đổi ký tự | **Bên trái** | Ngày, Số điện thoại |
| Số thay đổi ký tự | **Bên phải** | Số lượng, Phần trăm, Thành tiền |

> Bảng gộp cột: tiêu đề luôn căn giữa, dữ liệu vẫn căn theo quy tắc trên.

### Action trên dòng

- Hover chuột lên dòng → hiển thị action.
- Tối đa **3 icon**. Nhiều hơn 3 → hiển thị icon More cuối cùng.
- Tất cả tiêu đề viết tắt, icon hover phải có **tooltip**.

### Thao tác hàng loạt

- Khi check chọn bản ghi → show action hàng loạt đè lên vùng lọc nhanh và icon action bảng.
- Giữ lại ô tìm kiếm bên trái.
- Tối đa **5 chức năng** hiển thị, chức năng thứ 6+ gom vào nút 3 chấm.
- Chọn tất cả bản ghi ở tất cả trang: chỉ khi có yêu cầu nghiệp vụ (ảnh hưởng hiệu năng).

### Bộ lọc

**Lọc cơ bản:** Tham số thiết lập trước cho tập dữ liệu.

**Tìm kiếm thông minh:** Gõ ngôn ngữ tự nhiên, AI phân tích từ khóa.

**Lọc trên cột:**
- Hover vào cột → hiện icon lọc.
- Bấm icon → popover, tự focus vào ô nhập giá trị, điều kiện mặc định "Chứa".
- Gõ giá trị + Enter = áp dụng.
- Sau khi áp dụng → icon lọc luôn hiển thị màu Brand.
- Đồng thời áp dụng vào bộ lọc nâng cao bên phải.

**Lọc nâng cao:**
- Khi chưa nhập → nút "Áp dụng".
- Sau khi áp dụng → đổi thành nút "Lưu" để lưu bộ lọc.
- Cho phép lưu bộ lọc hay dùng, đặt tên.
- Sửa bộ lọc đã lưu → 2 lựa chọn: Lưu (cập nhật) hoặc Lưu thành bộ lọc mới.

**Lưu ý icon lọc:**
- Chưa lọc + focus → icon outline (rỗng) màu Brand.
- Đang có cột lọc → icon filled (đặc) làm dấu hiệu nhận biết.

### Chức năng trên tiêu đề cột

Bấm tiêu đề cột → Dropdown Menu:
- Sắp xếp: Không / Tăng dần / Giảm dần
- Ghim cột / Bỏ ghim cột
- Đặt làm cột đầu tiên
- Thêm cột bên trái / phải
- Ẩn cột
- Hiển thị nhiều dòng / 1 dòng

Cho phép tùy chỉnh độ rộng từng cột (resize). Cột được ghim hiển thị icon Pin ở đầu tiêu đề.

### Paging

| Loại | Mô tả | Áp dụng |
|---|---|---|
| **Infinite Scroll** | Cuộn đến đâu load đến đó | Mạng xã hội, blog, lịch sử chat |
| **Next/Prev** | Bấm chuyển qua lại giữa các trang | Bảng danh sách thông thường |

> **Không dùng** dạng mỗi page 1 số vì SaaS có rất nhiều dữ liệu, người dùng sẽ tìm kiếm/lọc thay vì lật 20 trang.

### Chỉnh sửa trong bảng

| Dạng | Mô tả | Nút Lưu |
|---|---|---|
| **Sửa tất cả trên bảng** | Hover dòng → sáng viền control, click nhập | Lưu cả form |
| **Sửa từng dòng** | Sửa dữ liệu trên dòng | Lưu từng dòng |
| **Sửa từng cell** | Hover cell → icon sửa cuối cell | Lưu ngay tại cell |

**Lưu ý:**
- Thông báo lỗi trên ô nhập liệu tương tự style ô input ở form.
- Chữ quá dài → khi focus ô nhập liệu tràn ra khỏi cell.
- Trạng thái xem bình thường: chữ dài hiển thị "...".

### Thiết lập bảng

**Tiêu chuẩn:** Drawer full chiều cao, cho phép kéo thả sắp xếp cột, chọn Lấy lại mặc định.

**Nâng cao** (VD: Bảng lương):
- Thiết lập dòng: cấu hình gom nhóm, hiển thị dạng cây.
- Thiết lập cột: tương tự tiêu chuẩn + gộp cột nâng cao.

### Scroll trong bảng

- Cuộn cả page cho đến khi header bảng chạm header bar → **ghim header bảng**.
- Chỉ scroll nội dung bên trong bảng → hiển thị nhiều dòng nhất có thể.

---

## 5.2 Popup

*(Trang popup — nội dung Figma chưa có chi tiết, cần tham chiếu component)*

---

# PHẦN 6: FORM

## 6.1 Side Bar

*(Trang sidebar — nội dung chi tiết tham chiếu từ Figma component)*

---

## 6.2 Header Bar

*(Trang header-bar — nội dung chi tiết tham chiếu từ Figma component)*

---

# PHẦN 7: QUY ĐỊNH KHÁC

## 7.1 Quy tắc chính tả

### Dấu chấm (.)
- Kết thúc một câu hoàn chỉnh.
- Đặt **1 khoảng trống** sau dấu chấm.
- Từ sau dấu chấm **viết hoa**.

### Dấu phẩy (,)
- Phân tách các thành phần trong câu hoặc các câu đơn trong câu ghép.
- Đặt **1 khoảng trống** sau dấu phẩy.
- Không viết hoa đặc biệt.

### Dấu chấm phẩy (;)
- Phân cách các phần tử hoặc ý tưởng liên quan nhưng không tách thành câu riêng.
- Đặt **1 khoảng trống** sau.
- Không viết hoa đặc biệt.

### Dấu chấm than (!)
- Thể hiện cảm xúc mạnh, ngạc nhiên, ra lệnh.
- Đặt **1 khoảng trống** sau.

### Dấu chấm hỏi (?)
- Đặt câu hỏi.
- Đặt **1 khoảng trống** sau.

### Dấu hai chấm (:)
- Giới thiệu danh sách, giải thích, trích dẫn.
- Đặt **1 khoảng trống** sau.
- Viết hoa chữ đầu nếu sau là câu hoặc đoạn trích dẫn.

### Dấu ngoặc đơn () và ngoặc kép ("")
- Bao quanh thông tin bổ sung, giải thích, trích dẫn.
- **Không** cần khoảng trống sau dấu ngoặc.

---

## 7.2 Quy định phím tắt

### Phím tắt trên màn hình danh sách

*(Chi tiết xem bảng phím tắt từ Figma — bao gồm các phím tắt phổ biến cho thêm, sửa, xóa, tìm kiếm, lọc, v.v.)*

### Phím tắt trên màn hình chi tiết

*(Chi tiết xem bảng phím tắt từ Figma — bao gồm Ctrl+S lưu, Ctrl+Insert thêm dòng, Delete xóa dòng, v.v.)*

### Quy tắc đặt phím tắt

**Quy tắc 1: Tránh phím tắt không thể ghi đè.**
- Một số phím tắt trình duyệt (Ctrl+T, Ctrl+N...) không ghi đè được. Cần trao đổi với lập trình.

**Quy tắc 2: Hiển thị hướng dẫn.**
- Phím tắt chỉ hoạt động khi bấm vào đúng đối tượng → hiển thị hướng dẫn phím tắt động khi chọn đối tượng.

**Quy tắc 3: Hiển thị tooltip.**
- Cần hiển thị tooltip trên các chức năng có đặt phím tắt (VD: nút Lưu → tooltip "Ctrl+S").

**Quy tắc 4 (QUAN TRỌNG): Kế thừa.**
- Kiểm tra quy định đã có chưa → tuân thủ.
- Nếu chưa → tham khảo dự án khác cùng tính chất để đồng nhất.
- VD: AMIS Kế toán đặt Ctrl+Insert thêm dòng → Mimosa Online cũng phải giống.
- Nếu phím tắt hay dùng mà chưa có trong quy định → liên hệ QA bổ sung.

---

## 7.3 Quy tắc phân tách số

*(Trang number-separation-rules — nội dung chi tiết tham chiếu từ Figma)*

Quy định cách hiển thị số trên giao diện: dấu phân tách hàng nghìn, dấu thập phân, v.v.

---

## 7.4 Tiêu đề trình duyệt

*(Trang browser-title — nội dung chi tiết tham chiếu từ Figma)*

Quy định cách đặt tiêu đề tab trình duyệt cho các trang trong ứng dụng.

---

## 7.5 Thông tin bản quyền

*(Trang copyright — nội dung chi tiết tham chiếu từ Figma)*

Quy định hiển thị thông tin bản quyền trên ứng dụng.

---

**— HẾT TÀI LIỆU —**

**MISA Design System v2.0 | Web Platform**
**Copyright © 1994 - 2025 MISA JSC. All Rights Reserved.**
