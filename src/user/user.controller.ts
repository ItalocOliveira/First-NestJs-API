import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { ok } from 'assert';

@UseGuards(JwtGuard) 
@Controller('users')
export class UserController {
    constructor(private userSerive: UserService){}

    @Get('me')
    getMe(@GetUser() user: User){
        return user;
    }

    @Patch()
    editUser(
        @GetUser('id') userId: number, 
        @Body() dto: EditUserDto,
    ){
        return this.userSerive.editUser(userId, dto)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteUser(@Param('id', ParseIntPipe) userId: number){
        return this.userSerive.deleteUser(userId);
    }
}
