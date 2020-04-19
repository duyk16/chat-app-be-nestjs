import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export class PaginationDto {
  // page?: number;
  start?: number;
  end?: number;

  // limit?: number;
}

export class PaginationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): PaginationDto {
    let pagination = {
      start: parseInt(value.start) || 0,
      end: parseInt(value.end) || 20,
    };

    if (
      pagination.start < 0 ||
      pagination.end < 0 ||
      pagination.end - pagination.start > 50
    ) {
      throw new BadRequestException(`Pagination query is not valid`);
    }

    return pagination;
  }
}
