import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookMarkDto, EditBookMarkDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Bookmark } from 'generated/prisma';

@Injectable()
export class BookmarkService {
        constructor(private prisma: PrismaService){}

        async createBookmark(userId: number, dto: CreateBookMarkDto) {
                const bookmark = await this.prisma.bookmark.create({
                        data: {
                                userId,
                                ...dto
                        }
                })

                return bookmark;
        }

        async getBookmarks(userId: number) {

                const bookmarks: Bookmark[] = await this.prisma.bookmark.findMany({
                        where: {
                                userId,
                        }
                })

                return bookmarks;
        }

        async getBookmarkById(userId: number, bookmarkId: number) {
                
                const bookmark = await this.prisma.bookmark.findUnique({
                        where: {
                                userId,
                                id: bookmarkId
                        }
                });

                return bookmark;
        }

        async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookMarkDto) {
                const bookmark = await this.prisma.bookmark.findUnique({
                        where: {
                                id: bookmarkId
                        }
                })
                if (!bookmark || bookmark.userId != userId) {
                        throw new ForbiddenException('Access to resources denied');
                }

                return this.prisma.bookmark.update({
                        where: {
                                id: bookmarkId
                        },
                        data: {
                                ...dto
                        }
                })
        }

        async deletetBookmarkById(userId: number, bookmarkId: number) {
                
                const bookmark = await this.prisma.bookmark.findUnique({
                        where: {
                                userId,
                                id: bookmarkId
                        }
                });
                if (!bookmark || bookmark.userId != userId) {
                        throw new ForbiddenException('Access to resources denied');
                }

                await this.prisma.bookmark.delete({
                        where: {
                                userId,
                                id: bookmarkId
                        }
                })
        }
}
