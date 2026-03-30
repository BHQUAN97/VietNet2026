import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Project } from './entities/project.entity';
import { ProjectGallery } from './entities/project-gallery.entity';
import { Product } from '../products/entities/product.entity';
import { Article } from '../articles/entities/article.entity';
import { CategoriesService } from './categories.service';
import { ProjectsService } from './projects.service';
import { SearchService } from './search.service';
import { CategoriesController } from './categories.controller';
import { ProjectsController } from './projects.controller';
import { SearchController } from './search.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Project, ProjectGallery, Product, Article]),
  ],
  controllers: [CategoriesController, ProjectsController, SearchController],
  providers: [CategoriesService, ProjectsService, SearchService],
  exports: [CategoriesService, ProjectsService, SearchService],
})
export class ProjectsModule {}
