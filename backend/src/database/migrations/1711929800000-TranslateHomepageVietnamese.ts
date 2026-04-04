import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Dich toan bo noi dung homepage page_configs sang tieng Viet.
 * Thay the config_published va config_draft cung luc.
 */
export class TranslateHomepageVietnamese1711929800000
  implements MigrationInterface
{
  name = 'TranslateHomepageVietnamese1711929800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const config = JSON.stringify({
      sections: [
        {
          type: 'hero',
          order: 1,
          visible: true,
          config: {
            label: 'Kiến Trúc & Nghệ Thuật',
            title: 'Kiến Tạo Không Gian Tinh Tế.',
            subtitle:
              'VietNet Interior mang hồn thủ công Việt Nam vào không gian kiến trúc hiện đại, tạo nên những chốn nghỉ ngơi ấm áp và tinh xảo.',
            cta_primary_text: 'Bắt Đầu Dự Án',
            cta_primary_link: '/contact',
            cta_secondary_text: 'Khám Phá Sản Phẩm',
            cta_secondary_link: '/catalog',
          },
        },
        {
          type: 'about',
          order: 2,
          visible: true,
          config: {
            label: 'Triết Lý Thiết Kế',
            title: 'Thiết kế là cuộc đối thoại giữa ánh sáng và chất liệu.',
            description:
              'Được thành lập trên nguyên tắc "Thủ Công Tinh Xảo", VietNet Interior vượt qua khuôn khổ thiết kế truyền thống. Chúng tôi kiến tạo không gian sống trở thành bối cảnh lặng lẽ cho những khoảnh khắc ý nghĩa nhất của bạn.',
            quote:
              'Chúng tôi không chỉ trang trí phòng — chúng tôi sáng tạo bầu không khí.',
            stats: [
              { value: '150+', label: 'Dự Án Hoàn Thành' },
              { value: '12', label: 'Giải Thưởng Thiết Kế' },
            ],
            images: [],
          },
        },
        {
          type: 'featured_projects',
          order: 3,
          visible: true,
          config: {
            label: 'Di Sản',
            title: 'Dự Án Tiêu Biểu',
            limit: 3,
            cta_text: 'Xem Toàn Bộ Dự Án',
            cta_link: '/projects',
          },
        },
        {
          type: 'testimonials',
          order: 4,
          visible: true,
          config: {
            label: 'Cảm Nhận Khách Hàng',
            title: 'Phản Hồi Từ Khách Hàng',
            items: [
              {
                name: 'Minh Lan Nguyễn',
                role: 'Nhà sáng lập, Lan Art House',
                content:
                  'VietNet đã biến tầm nhìn của chúng tôi thành một không gian vừa sang trọng vừa mang đậm dấu ấn cá nhân. Sự tỉ mỉ trong từng mối ghép gỗ là điều hiếm thấy trong khu vực.',
              },
              {
                name: 'Thomas H.',
                role: 'Nhà sưu tập kiến trúc',
                content:
                  'Chuyên nghiệp ở mọi giai đoạn. Họ xử lý sự phức tạp kiến trúc của ngôi nhà nghỉ dưỡng trên đồi một cách tinh tế và mang đến một ngôi nhà hòa mình với cảnh quan.',
              },
            ],
          },
        },
        {
          type: 'contact_cta',
          order: 5,
          visible: true,
          config: {
            title: 'Sẵn sàng định hình không gian của bạn?',
            description:
              'Dù bạn đang xây mới hay muốn cải tạo nội thất hiện tại, đội ngũ chuyên gia của chúng tôi sẵn sàng đồng hành.',
            cta_text: 'Đặt Lịch Tư Vấn',
            cta_link: '/contact',
            phone: '+84 (0) 90 123 4567',
            email: 'atelier@vietnet-interior.com',
            show_form: true,
          },
        },
      ],
    });

    // Giu lai bg_images tu config cu (neu co)
    await queryRunner.query(
      `UPDATE page_configs
       SET config_published = ?,
           config_draft = ?,
           version = version + 1,
           updated_at = NOW()
       WHERE page_slug = 'homepage'`,
      [config, config],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khong revert — chi can chay lai seed-data neu muon reset
  }
}
