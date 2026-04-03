import React, { useState, useEffect, useCallback } from 'react';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => onChange && onChange(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{ cursor: onChange ? 'pointer' : 'default', fontSize: 22, color: s <= (hovered || value) ? '#f59e0b' : '#d1d5db' }}
          aria-label={`${s} star`}
        >★</span>
      ))}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ReviewsSection({ productId }) {
  const { user, isAdmin } = useAuth();
  const isRegularUser = user && !isAdmin;

  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [rating, setRating]         = useState(5);
  const [comment, setComment]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText]   = useState({});
  const [showReply, setShowReply]   = useState({});

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await reviewsAPI.getByProduct(productId);
      setReviews(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Only regular users can submit reviews
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) { toast.error('Comment is required'); return; }
    setSubmitting(true);
    try {
      const { data } = await reviewsAPI.add(productId, { rating, comment });
      setReviews(prev => [data, ...prev]);
      setComment('');
      setRating(5);
      toast.success('Review added!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (reviewId) => {
    if (!user) { toast.error('Please log in to like reviews'); return; }
    try {
      const { data } = await reviewsAPI.toggleLike(reviewId);
      setReviews(prev => prev.map(r => {
        if (r._id !== reviewId) return r;
        const likes = data.liked
          ? [...(r.likes || []), user._id]
          : (r.likes || []).filter(id => id !== user._id && id?._id !== user._id);
        return { ...r, likes };
      }));
    } catch { toast.error('Failed to update like'); }
  };

  // All logged-in users (including admins) can reply
  const handleReply = async (reviewId) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    try {
      const { data } = await reviewsAPI.addReply(reviewId, { text });
      setReviews(prev => prev.map(r =>
        r._id === reviewId ? { ...r, replies: [...(r.replies || []), data] } : r
      ));
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      setShowReply(prev => ({ ...prev, [reviewId]: false }));
      toast.success('Reply added!');
    } catch { toast.error('Failed to add reply'); }
  };

  // Users can delete their own review; admins can delete any review
  const handleDelete = async (reviewId, ownerId) => {
    const isOwner = user?._id === ownerId || user?._id === ownerId?._id;
    if (!isOwner && !isAdmin) return;
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewsAPI.delete(reviewId);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
  };

  // Users can delete their own reply; admins can delete any reply
  const handleDeleteReply = async (reviewId, replyId, replyOwnerId) => {
    const isOwner = user?._id === replyOwnerId || user?._id === replyOwnerId?._id;
    if (!isOwner && !isAdmin) return;
    if (!window.confirm('Delete this reply?')) return;
    try {
      await reviewsAPI.deleteReply(reviewId, replyId);
      setReviews(prev => prev.map(r =>
        r._id === reviewId
          ? { ...r, replies: r.replies.filter(rep => rep._id !== replyId) }
          : r
      ));
      toast.success('Reply deleted');
    } catch { toast.error('Failed to delete reply'); }
  };

  const handleFlag = async (reviewId) => {
    try {
      const { data } = await reviewsAPI.flag(reviewId);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, isFlagged: data.isFlagged } : r));
      toast.success(data.isFlagged ? 'Review flagged' : 'Flag removed');
    } catch { toast.error('Failed to flag review'); }
  };

  const isLiked = (review) => {
    if (!user) return false;
    return (review.likes || []).some(id => (id?._id || id) === user._id);
  };

  const canDeleteReview = (review) => {
    if (!user) return false;
    const ownerId = review.user?._id || review.user;
    return isAdmin || ownerId === user._id;
  };

  const canDeleteReply = (reply) => {
    if (!user) return false;
    const ownerId = reply.user?._id || reply.user;
    return isAdmin || ownerId === user._id;
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Customer Reviews {reviews.length > 0 && <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 15 }}>({reviews.length})</span>}
      </h2>

      {/* Add review form — regular users only, not admins */}
      {isRegularUser && (
        <form onSubmit={handleSubmit} style={{ background: '#f9fafb', borderRadius: 12, padding: 20, marginBottom: 28, border: '1px solid #e5e7eb' }}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>Write a Review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            style={{ width: '100%', marginTop: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{ marginTop: 10, padding: '8px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading && <p style={{ color: '#6b7280' }}>Loading reviews...</p>}

      {!loading && reviews.length === 0 && (
        <p style={{ color: '#6b7280' }}>No reviews yet. Be the first!</p>
      )}

      {reviews.map(review => (
        <div key={review._id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 600 }}>{review.name}</span>
                {review.isFlagged && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10 }}>🚩 Flagged</span>}
                <span style={{ color: '#9ca3af', fontSize: 12 }}>{timeAgo(review.createdAt)}</span>
              </div>
              <StarRating value={review.rating} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Admins: flag + delete */}
              {isAdmin && (
                <>
                  <button onClick={() => handleFlag(review._id)} style={btnStyle('#fef3c7', '#92400e')}>
                    {review.isFlagged ? 'Unflag' : 'Flag'}
                  </button>
                  <button onClick={() => handleDelete(review._id, review.user)} style={btnStyle('#fee2e2', '#991b1b')}>Delete</button>
                </>
              )}
              {/* Regular users: delete only their own review */}
              {isRegularUser && canDeleteReview(review) && (
                <button onClick={() => handleDelete(review._id, review.user)} style={btnStyle('#fee2e2', '#991b1b')}>Delete</button>
              )}
            </div>
          </div>

          <p style={{ marginTop: 8, color: '#374151', lineHeight: 1.6 }}>{review.comment}</p>

          {/* Like + Reply actions */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'center' }}>
            {/* Like — regular users only */}
            {isRegularUser && (
              <button
                onClick={() => handleLike(review._id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked(review) ? '#16a34a' : '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                👍 {(review.likes || []).length}
              </button>
            )}
            {!user && (
              <span style={{ color: '#9ca3af', fontSize: 13 }}>👍 {(review.likes || []).length}</span>
            )}
            {/* Reply — all logged-in users including admins */}
            {user && (
              <button
                onClick={() => setShowReply(prev => ({ ...prev, [review._id]: !prev[review._id] }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13 }}
              >
                💬 Reply
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReply[review._id] && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <input
                value={replyText[review._id] || ''}
                onChange={e => setReplyText(prev => ({ ...prev, [review._id]: e.target.value }))}
                placeholder="Write a reply..."
                style={{ flex: 1, padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}
              />
              <button onClick={() => handleReply(review._id)} style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                Send
              </button>
            </div>
          )}

          {/* Replies */}
          {(review.replies || []).length > 0 && (
            <div style={{ marginTop: 12, paddingLeft: 20, borderLeft: '2px solid #e5e7eb' }}>
              {review.replies.map((reply, i) => (
                <div key={reply._id || i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{reply.name}</span>
                    <span style={{ color: '#9ca3af', fontSize: 11, marginLeft: 8 }}>{timeAgo(reply.createdAt)}</span>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#374151' }}>{reply.text}</p>
                  </div>
                  {/* Delete reply — owner or admin */}
                  {canDeleteReply(reply) && (
                    <button
                      onClick={() => handleDeleteReply(review._id, reply._id, reply.user)}
                      style={{ ...btnStyle('#fee2e2', '#991b1b'), flexShrink: 0, marginLeft: 8 }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const btnStyle = (bg, color) => ({
  padding: '4px 10px', background: bg, color, border: 'none',
  borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
});
