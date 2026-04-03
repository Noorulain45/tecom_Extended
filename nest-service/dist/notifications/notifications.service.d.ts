import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private readonly gateway;
    constructor(gateway: NotificationsGateway);
    broadcastNewReview(payload: {
        productId: string;
        productName: string;
        reviewerName: string;
        rating: number;
        reviewId: string;
    }): void;
    notifyReviewOwner(ownerId: string, payload: {
        reviewId: string;
        replierName: string;
        productName: string;
        replyText: string;
    }): void;
    notifyReviewLiked(ownerId: string, payload: {
        reviewId: string;
        likerName: string;
        productName: string;
    }): void;
    notifyReviewModerated(ownerId: string, payload: {
        reviewId: string;
        action: 'deleted' | 'flagged';
        productName: string;
    }): void;
    notifyProductUpdated(reviewerIds: string[], payload: {
        productId: string;
        productName: string;
        changes: string;
    }): void;
}
