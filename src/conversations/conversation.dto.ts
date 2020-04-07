import { IsArray, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  members: string[];
}
