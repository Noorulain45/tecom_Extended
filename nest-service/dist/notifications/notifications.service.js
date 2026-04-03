"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = class NotificationsService {
    gateway;
    constructor(gateway) {
        this.gateway = gateway;
    }
    broadcastNewReview(payload) {
        this.gateway.server.emit('new_review', {
            type: 'new_review',
            message: `${payload.reviewerName} added a ${payload.rating}★ review on "${payload.productName}"`,
            ...payload,
            createdAt: new Date().toISOString(),
        });
    }
    notifyReviewOwner(ownerId, payload) {
        this.gateway.server.to(`user:${ownerId}`).emit('review_reply', {
            type: 'review_reply',
            message: `${payload.replierName} replied to your review on "${payload.productName}"`,
            ...payload,
            createdAt: new Date().toISOString(),
        });
    }
    notifyReviewLiked(ownerId, payload) {
        this.gateway.server.to(`user:${ownerId}`).emit('review_liked', {
            type: 'review_liked',
            message: `${payload.likerName} liked your review on "${payload.productName}"`,
            ...payload,
            createdAt: new Date().toISOString(),
        });
    }
    notifyReviewModerated(ownerId, payload) {
        this.gateway.server.to(`user:${ownerId}`).emit('review_moderated', {
            type: 'review_moderated',
            message: payload.action === 'deleted'
                ? `Your review on "${payload.productName}" was removed by an admin.`
                : `Your review on "${payload.productName}" has been flagged for review.`,
            ...payload,
            createdAt: new Date().toISOString(),
        });
    }
    notifyProductUpdated(reviewerIds, payload) {
        reviewerIds.forEach((uid) => {
            this.gateway.server.to(`user:${uid}`).emit('product_updated', {
                type: 'product_updated',
                message: `"${payload.productName}" has been updated: ${payload.changes}`,
                ...payload,
                createdAt: new Date().toISOString(),
            });
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map