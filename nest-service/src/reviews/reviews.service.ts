import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel('Review') private reviewModel: Model<any>,
    @InjectModel('Product') private productModel: Model<any>,
    private notifications: NotificationsService,
  ) {}

  async getProductReviews(productId: string) {
    return this.reviewModel
      .find({ product: productId })
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  async addReview(productId: string, user: any, dto: CreateReviewDto) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.reviewModel.findOne({
      product: productId,
      user: user._id,
    });
    if (existing)
      throw new BadRequestException('You already reviewed this product');

    const review = await this.reviewModel.create({
      product: productId,
      user: user._id,
      name: user.name,
      rating: dto.rating,
      comment: dto.comment,
    });

    // Update product rating
    await this.recalcProductRating(productId);

    // Broadcast to all users
    this.notifications.broadcastNewReview({
      productId,
      productName: product.name,
      reviewerName: user.name,
      rating: dto.rating,
      reviewId: review._id.toString(),
    });

    return review;
  }

  async addReply(reviewId: string, user: any, dto: CreateReplyDto) {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('product', 'name');
    if (!review) throw new NotFoundException('Review not found');

    const reply = { user: user._id, name: user.name, text: dto.text };
    review.replies.push(reply);
    await review.save();

    const savedReply = review.replies[review.replies.length - 1];

    // Notify review owner (only if replier is different)
    if (review.user.toString() !== user._id.toString()) {
      this.notifications.notifyReviewOwner(review.user.toString(), {
        reviewId,
        replierName: user.name,
        productName: (review.product as any)?.name || 'a product',
        replyText: dto.text,
      });
    }

    return savedReply;
  }

  async deleteReply(reviewId: string, replyId: string, user: any) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    const reply = review.replies.id(replyId);
    if (!reply) throw new NotFoundException('Reply not found');

    const isOwner = reply.user.toString() === user._id.toString();
    const isAdmin = ['admin', 'superadmin'].includes(user.role);

    if (!isOwner && !isAdmin) throw new ForbiddenException();

    reply.deleteOne();
    await review.save();
    return { success: true };
  }

  async toggleLike(reviewId: string, user: any) {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('product', 'name');
    if (!review) throw new NotFoundException('Review not found');

    const userId = new Types.ObjectId(user._id);
    const alreadyLiked = review.likes.some((id: any) => id.equals(userId));

    if (alreadyLiked) {
      review.likes = review.likes.filter((id: any) => !id.equals(userId));
    } else {
      review.likes.push(userId);
      // Notify review author (not self-like)
      if (review.user.toString() !== user._id.toString()) {
        this.notifications.notifyReviewLiked(review.user.toString(), {
          reviewId,
          likerName: user.name,
          productName: (review.product as any)?.name || 'a product',
        });
      }
    }

    await review.save();
    return { liked: !alreadyLiked, likesCount: review.likes.length };
  }

  async deleteReview(reviewId: string, user: any) {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('product', 'name');
    if (!review) throw new NotFoundException('Review not found');

    const isOwner = review.user.toString() === user._id.toString();
    const isAdmin = ['admin', 'superadmin'].includes(user.role);

    if (!isOwner && !isAdmin) throw new ForbiddenException();

    const productId = review.product._id?.toString() || review.product.toString();
    await review.deleteOne();
    await this.recalcProductRating(productId);

    // Notify review author if deleted by admin
    if (isAdmin && !isOwner) {
      this.notifications.notifyReviewModerated(review.user.toString(), {
        reviewId,
        action: 'deleted',
        productName: (review.product as any)?.name || 'a product',
      });
    }

    return { success: true };
  }

  async flagReview(reviewId: string, admin: any) {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('product', 'name');
    if (!review) throw new NotFoundException('Review not found');

    review.isFlagged = !review.isFlagged;
    await review.save();

    if (review.isFlagged) {
      this.notifications.notifyReviewModerated(review.user.toString(), {
        reviewId,
        action: 'flagged',
        productName: (review.product as any)?.name || 'a product',
      });
    }

    return { isFlagged: review.isFlagged };
  }

  private async recalcProductRating(productId: string) {
    const reviews = await this.reviewModel
      .find({ product: productId })
      .select('rating')
      .lean();
    const numReviews = reviews.length;
    const rating =
      numReviews === 0
        ? 0
        : Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / numReviews) * 10,
          ) / 10;
    await this.productModel.findByIdAndUpdate(productId, {
      rating,
      numReviews,
    });
  }
}
