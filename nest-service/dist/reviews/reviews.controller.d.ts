import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getProductReviews(productId: string): Promise<any[]>;
    addReview(productId: string, dto: CreateReviewDto, req: any): Promise<any>;
    addReply(reviewId: string, dto: CreateReplyDto, req: any): Promise<any>;
    deleteReply(reviewId: string, replyId: string, req: any): Promise<{
        success: boolean;
    }>;
    toggleLike(reviewId: string, req: any): Promise<{
        liked: boolean;
        likesCount: any;
    }>;
    deleteReview(reviewId: string, req: any): Promise<{
        success: boolean;
    }>;
    flagReview(reviewId: string, req: any): Promise<{
        isFlagged: any;
    }>;
}
