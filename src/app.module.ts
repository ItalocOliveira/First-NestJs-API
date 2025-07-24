import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config'; // <-- 1. IMPORTE O CONFIG MODULE

@Module({
  imports: [
    // 2. ADICIONE O CONFIG MODULE COMO PRIMEIRO ITEM
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
  ],
  // 3. REMOVA O CONTROLLER E PROVIDER DAQUI
})
export class AppModule {}