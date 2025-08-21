// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookMarkDto, EditBookMarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@test.com',
      password: '123',
    };

    describe('Signup', () => {

      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.email
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });

      it('should throw if email is taken', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'email@email.com'
          })
          .expectStatus(400)
      });  

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });  
    });

    describe('Signin', () => {
      
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.email
          })
          .expectStatus(400)
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });

      it('should throw if password is wrong', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
            password: "wrongPassword"
          })
          .expectStatus(403)
      });  

      it('should throw if email is wrong', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: "wrongEmail",
            password: dto.password
          })
          .expectStatus(400)
      }); 
      
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('access_token')
          .stores('userAt', 'access_token');
      });
    });

    describe('User', () => {
      describe('Get me', () => {
        it('should get current user', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .stores('userId', 'id');;
        });
      });

      describe('Edit user', () => {
        const dto: EditUserDto = {
            firstName: "Italo",
            email: "italo@email.com" 
          }
        it('should edit user', () => {
          return pactum
            .spec()
            .patch('/users')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .withBody(dto)
            .expectStatus(200);
        });
      });
      
      // describe('Delete user', () => {
      //   it('should delete user', () => {
      //     return pactum
      //       .spec()
      //       .delete('/users/$S{userId}')
      //       .withHeaders({ 
      //         Authorization: 'Bearer $S{userAt}'
      //       })
      //       .withBody(dto)
      //       .expectStatus(204);
      //   });
      // });
    });

    describe('Bookmark', () => {
      describe('Get empty bookmarks', () => {
        it("should return empty bookmarks", () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectBody([]);
        })
      });

      describe('Create bookmarks', () => {
        const dto: CreateBookMarkDto = {
            title: "First Bookmark",
            link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description: "Check n see"
          }

        it("should create bookmark", () => {
          return pactum
            .spec()
            .post('/bookmarks')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .withBody(dto)
            .expectStatus(201)
            .stores('bookmarkId', 'id');
        })
      });
      
      describe('Get bookmarks', () => {
        it("should return bookmarks", () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectJsonLength(1);
        })
      });

      describe('Get bookmark by id', () => {
        it("should return bookmark by id", () => {
          return pactum
            .spec()
            .get('/bookmarks/{id}')
            .withPathParams('id', '$S{bookmarkId}')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectBodyContains("$S{bookmarkId}");
        })
      });

      describe('Edit bookmark', () => {
        const dto: EditBookMarkDto = {
            title: "Never gonna give you up",
          }
        it('should edit bookmark', () => {
          return pactum
            .spec()
            .patch('/bookmarks/{id}')
            .withPathParams('id', '$S{bookmarkId}')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .withBody(dto)
            .expectStatus(200)
            .expectBodyContains("Never gonna give you up");
        });
      });

      describe('Delete bookmark by id', () => {
        it("should delete bookmark by id", () => {
          return pactum
            .spec()
            .delete('/bookmarks/{id}')
            .withPathParams('id', '$S{bookmarkId}')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .expectStatus(204);
        });

        it("should return empty bookmarks", () => {
          return pactum
            .spec()
            .get('/bookmarks')
            .withHeaders({ 
              Authorization: 'Bearer $S{userAt}'
            })
            .expectStatus(200)
            .expectJsonLength(0);
        })
      });

    })
  });
});