import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReviewsService {
    private reviewModel;
    private productModel;
    private notifications;
    constructor(reviewModel: Model<any>, productModel: Model<any>, notifications: NotificationsService);
    getProductReviews(productId: string): Promise<any[]>;
    addReview(productId: string, user: any, dto: CreateReviewDto): Promise<any>;
    addReply(reviewId: string, user: any, dto: CreateReplyDto): Promise<any>;
    deleteReply(reviewId: string, replyId: string, user: any): Promise<{
        success: boolean;
    }>;
    toggleLike(reviewId: string, user: any): Promise<{
        liked: boolean;
        likesCount: any;
    }>;
    deleteReview(reviewId: string, user: any): Promise<{
        success: boolean;
    }>;
    flagReview(reviewId: string, admin: any): Promise<{
        isFlagged: any;
    }>;
    private recalcProductRating;
}
