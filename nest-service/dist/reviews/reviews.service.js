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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notifications_service_1 = require("../notifications/notifications.service");
let ReviewsService = class ReviewsService {
    reviewModel;
    productModel;
    notifications;
    constructor(reviewModel, productModel, notifications) {
        this.reviewModel = reviewModel;
        this.productModel = productModel;
        this.notifications = notifications;
    }
    async getProductReviews(productId) {
        return this.reviewModel
            .find({ product: productId })
            .populate('user', 'name avatar')
            .populate('replies.user', 'name avatar')
            .sort({ createdAt: -1 })
            .lean();
    }
    async addReview(productId, user, dto) {
        const product = await this.productModel.findById(productId);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const existing = await this.reviewModel.findOne({
            product: productId,
            user: user._id,
        });
        if (existing)
            throw new common_1.BadRequestException('You already reviewed this product');
        const review = await this.reviewModel.create({
            product: productId,
            user: user._id,
            name: user.name,
            rating: dto.rating,
            comment: dto.comment,
        });
        await this.recalcProductRating(productId);
        this.notifications.broadcastNewReview({
            productId,
            productName: product.name,
            reviewerName: user.name,
            rating: dto.rating,
            reviewId: review._id.toString(),
        });
        return review;
    }
    async addReply(reviewId, user, dto) {
        const review = await this.reviewModel
            .findById(reviewId)
            .populate('product', 'name');
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        const reply = { user: user._id, name: user.name, text: dto.text };
        review.replies.push(reply);
        await review.save();
        const savedReply = review.replies[review.replies.length - 1];
        if (review.user.toString() !== user._id.toString()) {
            this.notifications.notifyReviewOwner(review.user.toString(), {
                reviewId,
                replierName: user.name,
                productName: review.product?.name || 'a product',
                replyText: dto.text,
            });
        }
        return savedReply;
    }
    async deleteReply(reviewId, replyId, user) {
        const review = await this.reviewModel.findById(reviewId);
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        const reply = review.replies.id(replyId);
        if (!reply)
            throw new common_1.NotFoundException('Reply not found');
        const isOwner = reply.user.toString() === user._id.toString();
        const isAdmin = ['admin', 'superadmin'].includes(user.role);
        if (!isOwner && !isAdmin)
            throw new common_1.ForbiddenException();
        reply.deleteOne();
        await review.save();
        return { success: true };
    }
    async toggleLike(reviewId, user) {
        const review = await this.reviewModel
            .findById(reviewId)
            .populate('product', 'name');
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        const userId = new mongoose_2.Types.ObjectId(user._id);
        const alreadyLiked = review.likes.some((id) => id.equals(userId));
        if (alreadyLiked) {
            review.likes = review.likes.filter((id) => !id.equals(userId));
        }
        else {
            review.likes.push(userId);
            if (review.user.toString() !== user._id.toString()) {
                this.notifications.notifyReviewLiked(review.user.toString(), {
                    reviewId,
                    likerName: user.name,
                    productName: review.product?.name || 'a product',
                });
            }
        }
        await review.save();
        return { liked: !alreadyLiked, likesCount: review.likes.length };
    }
    async deleteReview(reviewId, user) {
        const review = await this.reviewModel
            .findById(reviewId)
            .populate('product', 'name');
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        const isOwner = review.user.toString() === user._id.toString();
        const isAdmin = ['admin', 'superadmin'].includes(user.role);
        if (!isOwner && !isAdmin)
            throw new common_1.ForbiddenException();
        const productId = review.product._id?.toString() || review.product.toString();
        await review.deleteOne();
        await this.recalcProductRating(productId);
        if (isAdmin && !isOwner) {
            this.notifications.notifyReviewModerated(review.user.toString(), {
                reviewId,
                action: 'deleted',
                productName: review.product?.name || 'a product',
            });
        }
        return { success: true };
    }
    async flagReview(reviewId, admin) {
        const review = await this.reviewModel
            .findById(reviewId)
            .populate('product', 'name');
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        review.isFlagged = !review.isFlagged;
        await review.save();
        if (review.isFlagged) {
            this.notifications.notifyReviewModerated(review.user.toString(), {
                reviewId,
                action: 'flagged',
                productName: review.product?.name || 'a product',
            });
        }
        return { isFlagged: review.isFlagged };
    }
    async recalcProductRating(productId) {
        const reviews = await this.reviewModel
            .find({ product: productId })
            .select('rating')
            .lean();
        const numReviews = reviews.length;
        const rating = numReviews === 0
            ? 0
            : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / numReviews) * 10) / 10;
        await this.productModel.findByIdAndUpdate(productId, {
            rating,
            numReviews,
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Review')),
    __param(1, (0, mongoose_1.InjectModel)('Product')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map