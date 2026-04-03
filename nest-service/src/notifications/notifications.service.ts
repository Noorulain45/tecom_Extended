import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  /** Broadcast to ALL connected clients */
  broadcastNewReview(payload: {
    productId: string;
    productName: string;
    reviewerName: string;
    rating: number;
    reviewId: string;
  }) {
    this.gateway.server.emit('new_review', {
      type: 'new_review',
      message: `${payload.reviewerName} added a ${payload.rating}★ review on "${payload.productName}"`,
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  /** Send only to the review owner */
  notifyReviewOwner(
    ownerId: string,
    payload: {
      reviewId: string;
      replierName: string;
      productName: string;
      replyText: string;
    },
  ) {
    this.gateway.server.to(`user:${ownerId}`).emit('review_reply', {
      type: 'review_reply',
      message: `${payload.replierName} replied to your review on "${payload.productName}"`,
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  /** Notify review author of a like */
  notifyReviewLiked(
    ownerId: string,
    payload: {
      reviewId: string;
      likerName: string;
      productName: string;
    },
  ) {
    this.gateway.server.to(`user:${ownerId}`).emit('review_liked', {
      type: 'review_liked',
      message: `${payload.likerName} liked your review on "${payload.productName}"`,
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  /** Notify review author of moderation action */
  notifyReviewModerated(
    ownerId: string,
    payload: {
      reviewId: string;
      action: 'deleted' | 'flagged';
      productName: string;
    },
  ) {
    this.gateway.server.to(`user:${ownerId}`).emit('review_moderated', {
      type: 'review_moderated',
      message:
        payload.action === 'deleted'
          ? `Your review on "${payload.productName}" was removed by an admin.`
          : `Your review on "${payload.productName}" has been flagged for review.`,
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  /** Notify all users who reviewed a product about a product update */
  notifyProductUpdated(
    reviewerIds: string[],
    payload: {
      productId: string;
      productName: string;
      changes: string;
    },
  ) {
    reviewerIds.forEach((uid) => {
      this.gateway.server.to(`user:${uid}`).emit('product_updated', {
        type: 'product_updated',
        message: `"${payload.productName}" has been updated: ${payload.changes}`,
        ...payload,
        createdAt: new Date().toISOString(),
      });
    });
  }
}
