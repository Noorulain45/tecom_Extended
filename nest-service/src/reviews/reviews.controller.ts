import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /api/reviews/product/:productId
  @Get('product/:productId')
  @UseGuards(OptionalJwtGuard)
  getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  // POST /api/reviews/product/:productId — users only, admins cannot add reviews
  @Post('product/:productId')
  @UseGuards(JwtAuthGuard)
  addReview(
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
    @Request() req: any,
  ) {
    const role = req.user?.role;
    if (role === 'admin' || role === 'superadmin') {
      throw new ForbiddenException('Admins cannot add reviews');
    }
    return this.reviewsService.addReview(productId, req.user, dto);
  }

  // POST /api/reviews/:reviewId/reply — all authenticated users (including admins)
  @Post(':reviewId/reply')
  @UseGuards(JwtAuthGuard)
  addReply(
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReplyDto,
    @Request() req: any,
  ) {
    return this.reviewsService.addReply(reviewId, req.user, dto);
  }

  // DELETE /api/reviews/:reviewId/reply/:replyId — owner or admin
  @Delete(':reviewId/reply/:replyId')
  @UseGuards(JwtAuthGuard)
  deleteReply(
    @Param('reviewId') reviewId: string,
    @Param('replyId') replyId: string,
    @Request() req: any,
  ) {
    return this.reviewsService.deleteReply(reviewId, replyId, req.user);
  }

  // POST /api/reviews/:reviewId/like — users only
  @Post(':reviewId/like')
  @UseGuards(JwtAuthGuard)
  toggleLike(@Param('reviewId') reviewId: string, @Request() req: any) {
    return this.reviewsService.toggleLike(reviewId, req.user);
  }

  // DELETE /api/reviews/:reviewId — owner can delete own; admin/superadmin can delete any
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  deleteReview(@Param('reviewId') reviewId: string, @Request() req: any) {
    return this.reviewsService.deleteReview(reviewId, req.user);
  }

  // PATCH /api/reviews/:reviewId/flag  (admin only)
  @Patch(':reviewId/flag')
  @UseGuards(JwtAuthGuard)
  flagReview(@Param('reviewId') reviewId: string, @Request() req: any) {
    return this.reviewsService.flagReview(reviewId, req.user);
  }
}
