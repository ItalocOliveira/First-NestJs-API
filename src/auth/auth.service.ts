import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService{
    // constructor(private prisma: PrismaService){}

    signup() {
        return {msg: "signup"}
    }; 

    signin() {
        return {msg: "signin"}
    };

    
}
