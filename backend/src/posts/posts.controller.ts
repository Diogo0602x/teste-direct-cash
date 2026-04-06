import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { AuthenticatedRequest, PaginationParams } from "../types";
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: "Conteúdo é obrigatório" })
  @MaxLength(2000)
  content!: string;
}

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePostDto, @Request() req: AuthenticatedRequest) {
    return this.postsService.create(dto, req.user.sub);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Query("churchId") churchId?: string,
  ) {
    const params: PaginationParams = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 50),
    };
    return this.postsService.findAll(params, churchId);
  }

  @Get("pending")
  @UseGuards(JwtAuthGuard)
  findPending(
    @Query("churchId") churchId: string | undefined,
    @Query("page") page = "1",
    @Query("limit") limit = "10",
    @Request() req: AuthenticatedRequest,
  ) {
    const params: PaginationParams = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 50),
    };
    return this.postsService.findPending(params, churchId, req.user.sub);
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param("id") id: string, @Request() req: { user?: { sub: string } }) {
    return this.postsService.findById(id, req.user?.sub);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePostDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.postsService.update(id, dto, req.user.sub);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.remove(id, req.user.sub);
  }

  @Patch(":id/approve")
  @UseGuards(JwtAuthGuard)
  approve(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.approve(id, req.user.sub);
  }

  @Patch(":id/reject")
  @UseGuards(JwtAuthGuard)
  reject(@Param("id") id: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.reject(id, req.user.sub);
  }

  @Post(":id/like")
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param("id") postId: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.toggleLike(postId, req.user.sub);
  }

  @Get(":id/comments")
  getComments(
    @Param("id") postId: string,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    const params: PaginationParams = {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 50),
    };
    return this.postsService.getComments(postId, params);
  }

  @Post(":id/comments")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  addComment(
    @Param("id") postId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.postsService.addComment(postId, dto.content, req.user.sub);
  }

  @Delete("comments/:commentId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeComment(@Param("commentId") commentId: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.removeComment(commentId, req.user.sub);
  }

  @Post("comments/:commentId/like")
  @UseGuards(JwtAuthGuard)
  toggleCommentLike(@Param("commentId") commentId: string, @Request() req: AuthenticatedRequest) {
    return this.postsService.toggleCommentLike(commentId, req.user.sub);
  }
}
