import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from 'src/auth/decorator';
import { CreateBookMarkDto, EditBookMarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {

    constructor(private bookmarkService: BookmarkService) {}

    @Post()
    createBookmark(
        @GetUser('id') userId: number,
        @Body() dto: CreateBookMarkDto
    ) {return this.bookmarkService.createBookmark(userId, dto)}

    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId)
    }

    @Get(':id')
    getBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {return this.bookmarkService.getBookmarkById(userId, bookmarkId)}

    @Patch(':id')
    editBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,
        @Body() dto: EditBookMarkDto,
    ) {return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto)}
    
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deletetBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number
    ) {return this.bookmarkService.deletetBookmarkById(userId, bookmarkId)}
}
