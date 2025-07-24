import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // EXPORTA o serviço para ser usado em outros módulos
})
export class PrismaModule {}