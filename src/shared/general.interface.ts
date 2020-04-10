import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export class PaginationDto {
  page?: number;

  limit?: number;
}

export class PaginationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): PaginationDto {
    let pagination = {
      page: parseInt(value.page) || 0,
      limit: parseInt(value.limit) || 10,
    };

    if (pagination.page < 0 || pagination.limit < 0 || pagination.limit > 50) {
      throw new BadRequestException(`Pagination query is not valid`);
    }
    
    return pagination;
  }
}
