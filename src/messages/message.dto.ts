import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsMongoId()
  conversation: string;

  @IsString()
  @MaxLength(1024)
  content: string;
}
