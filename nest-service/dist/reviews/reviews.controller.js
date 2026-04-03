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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
const create_review_dto_1 = require("./dto/create-review.dto");
const create_reply_dto_1 = require("./dto/create-reply.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const optional_jwt_guard_1 = require("../auth/optional-jwt.guard");
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    getProductReviews(productId) {
        return this.reviewsService.getProductReviews(productId);
    }
    addReview(productId, dto, req) {
        const role = req.user?.role;
        if (role === 'admin' || role === 'superadmin') {
            throw new common_1.ForbiddenException('Admins cannot add reviews');
        }
        return this.reviewsService.addReview(productId, req.user, dto);
    }
    addReply(reviewId, dto, req) {
        return this.reviewsService.addReply(reviewId, req.user, dto);
    }
    deleteReply(reviewId, replyId, req) {
        return this.reviewsService.deleteReply(reviewId, replyId, req.user);
    }
    toggleLike(reviewId, req) {
        return this.reviewsService.toggleLike(reviewId, req.user);
    }
    deleteReview(reviewId, req) {
        return this.reviewsService.deleteReview(reviewId, req.user);
    }
    flagReview(reviewId, req) {
        return this.reviewsService.flagReview(reviewId, req.user);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, common_1.UseGuards)(optional_jwt_guard_1.OptionalJwtGuard),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getProductReviews", null);
__decorate([
    (0, common_1.Post)('product/:productId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_review_dto_1.CreateReviewDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "addReview", null);
__decorate([
    (0, common_1.Post)(':reviewId/reply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_reply_dto_1.CreateReplyDto, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "addReply", null);
__decorate([
    (0, common_1.Delete)(':reviewId/reply/:replyId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Param)('replyId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "deleteReply", null);
__decorate([
    (0, common_1.Post)(':reviewId/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Delete)(':reviewId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Patch)(':reviewId/flag'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "flagReview", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map