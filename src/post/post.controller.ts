import { Controller, Get, Post, Body, Query, Delete } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // 投稿を行う
  @Post()
  async createPost(
    @Body('message') message: string,
    @Query('token') token: string,
  ) {
    console.log(`token: ${token}`);
    const rec = await this.postService.createpost(message, token);
    return rec;
  }

  // 投稿の取得
  @Get()
  async getList(
    @Query('token') token: string,
    @Query('start') start: number,
    @Query('records') records: number,
  ) {
    return await this.postService.getList(token, start, records);
  }

  // 投稿の削除と投稿の取得
  @Delete()
  async deletePost(
    @Query('token') token: string,
    @Query('Post_id') Post_id: number,
    @Query('start') start: number,
    @Query('records') records: number,
  ) {
    console.log(token, Post_id, start, records);
    return await this.postService.deletePost(token, Post_id, start, records);
  }

  // キーワード検索と投稿の取得
  @Get('keyword')
  async getKeywordList(
    @Query('token') token: string,
    @Query('start') start: number,
    @Query('records') records: number,
    @Query(`keyword`) keyword: string,
  ) {
    return await this.postService.getkeywordList(
      token,
      start,
      records,
      keyword,
    );
  }
}
