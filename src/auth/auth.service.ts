import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "generated/prisma/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{
    constructor(
        private prisma: PrismaService, 
        private jwt: JwtService,
        private config: ConfigService
    ){}

    async signup(dto: AuthDto) {
        // generate password hash
        const hash = await argon.hash(dto.password);
        // save new user on db
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }
            });
            return this.signToken(user.id, user.email);
        }   catch(error) {
            if(error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw error;
        }

    }; 

    async signin(dto: AuthDto) {
        // find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        });
        // if user doesnt exist, throw exception
        if(!user){
            throw new ForbiddenException('Credentials incorrect');
        }
        // compare password
        const passwordMatches = await argon.verify(user.hash, dto.password);
        // if password incorrect, throw exception
        if (!passwordMatches){
            throw new ForbiddenException('Credentials incorrect');
        }
        return this.signToken(user.id, user.email);
    };

    async signToken(userId: number, email: string,): Promise<{access_token: string}> {
        
        const payload = {
            sub: userId,
            email: email,
        }

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(
            payload, 
            {
            expiresIn: '15m',
            secret: secret,
            },
        );

        return {
            access_token: token,
        }
    }
}
