import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/not-found (GET)', async () => {
    let response = await request(app.getHttpServer()).get('/not-found');

    expect(response.status).toEqual(404);
    expect(response.body).toMatchObject({ statusCode: 404 });
  });

  it('/users (POST)', async () => {
    let response = await request(app.getHttpServer())
      .post('/users')
      .send({});

    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({ statusCode: 400 });
  });
});
