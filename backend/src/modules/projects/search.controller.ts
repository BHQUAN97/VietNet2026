import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';
import { Public } from '../../common/decorators/public.decorator';
import { paginated } from '../../common/helpers/response.helper';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  async search(@Query() dto: SearchDto) {
    const result = await this.searchService.search(
      dto.q,
      dto.page,
      dto.limit,
    );

    return paginated(result.data, {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.total,
    });
  }
}
