import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating, size = 20, onPress, color = '#F2C94C' }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
          <Text style={{ fontSize: size, color: star <= rating ? color : '#3A3A3C' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewSection({ entityType, entityId, colors: c, title = "Reviews", subtitle = null }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myTitle, setMyTitle] = useState('');
  const [myComment, setMyComment] = useState('');
  const [myReview, setMyReview] = useState(null);

  useEffect(() => { loadReviews(); }, [entityId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/${entityType}/${entityId}`);
      setReviews(res.data.reviews || []);
      setStats(res.data.stats);
      const mine = res.data.reviews?.find(r => r.reviewer_id === user?.user_id);
      if (mine) {
        setMyReview(mine);
        setMyRating(mine.rating);
        setMyTitle(mine.title || '');
        setMyComment(mine.comment || '');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const submitReview = async () => {
    if (myRating === 0) {
      Alert.alert('Rating required', 'Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      if (myReview) {
        await api.put(`/reviews/${myReview.review_id}`, { rating: myRating, title: myTitle, comment: myComment });
      } else {
        await api.post('/reviews', { entity_type: entityType, entity_id: entityId, rating: myRating, title: myTitle, comment: myComment });
      }
      setShowForm(false);
      loadReviews();
      Alert.alert('✓ Review submitted', 'Thank you for your feedback!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const deleteReview = async () => {
    Alert.alert('Delete Review', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await api.delete(`/reviews/${myReview.review_id}`).catch(() => {});
        setMyReview(null);
        setMyRating(0);
        setMyTitle('');
        setMyComment('');
        setShowForm(false);
        loadReviews();
      }}
    ]);
  };

  const avgRating = parseFloat(stats?.avg_rating) || 0;
  const totalReviews = parseInt(stats?.total) || 0;

  return (
    <View style={[styles.section, { backgroundColor: c.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          {subtitle && <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{subtitle}</Text>}
        </View>
        {totalReviews > 0 && (
          <View style={styles.statsRow}>
            <StarRating rating={Math.round(avgRating)} size={14} />
            <Text style={[styles.avgText, { color: c.text }]}>{avgRating.toFixed(1)}</Text>
            <Text style={[styles.countText, { color: c.textMuted }]}>({totalReviews})</Text>
          </View>
        )}
      </View>

      {/* Write review button */}
      {!showForm && (
        <TouchableOpacity
          style={[styles.writeBtn, { borderColor: c.primary, backgroundColor: c.primaryLight }]}
          onPress={() => setShowForm(true)}>
          <Text style={[styles.writeBtnText, { color: c.primary }]}>
            {myReview ? '✏️ Edit your review' : '⭐ Write a review'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Review form */}
      {showForm && (
        <View style={[styles.form, { backgroundColor: c.background, borderColor: c.border }]}>
          <Text style={[styles.formLabel, { color: c.text }]}>Your Rating</Text>
          <StarRating rating={myRating} size={32} onPress={setMyRating} />
          <TextInput
            style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
            placeholder="Title (optional)"
            placeholderTextColor={c.textMuted}
            value={myTitle}
            onChangeText={setMyTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea, { color: c.text, borderColor: c.border, backgroundColor: c.surface }]}
            placeholder="Share your experience..."
            placeholderTextColor={c.textMuted}
            value={myComment}
            onChangeText={setMyComment}
            multiline
            numberOfLines={3}
          />
          <View style={styles.formBtns}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: c.border }]} onPress={() => setShowForm(false)}>
              <Text style={[styles.cancelBtnText, { color: c.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            {myReview && (
              <TouchableOpacity style={[styles.deleteBtn]} onPress={deleteReview}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: myRating > 0 ? c.primary : c.border }]}
              onPress={submitReview}
              disabled={submitting || myRating === 0}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitBtnText}>{myReview ? 'Update' : 'Submit'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reviews list */}
      {loading ? (
        <ActivityIndicator color={c.primary} style={{ margin: 16 }} />
      ) : reviews.length === 0 ? (
        <Text style={[styles.noReviews, { color: c.textMuted }]}>No reviews yet. Be the first!</Text>
      ) : (
        reviews.slice(0, 5).map(review => (
          <View key={review.review_id} style={[styles.reviewCard, { borderBottomColor: c.borderLight }]}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewAvatar, { backgroundColor: c.primaryLight }]}>
                <Text style={[styles.reviewAvatarText, { color: c.primary }]}>
                  {review.reviewer_name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reviewerName, { color: c.text }]}>{review.reviewer_name}</Text>
                <StarRating rating={review.rating} size={12} />
              </View>
              <Text style={[styles.reviewDate, { color: c.textMuted }]}>
                {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            {review.title && <Text style={[styles.reviewTitle, { color: c.text }]}>{review.title}</Text>}
            {review.comment && <Text style={[styles.reviewComment, { color: c.textMuted }]}>{review.comment}</Text>}
            {review.is_verified_purchase && (
              <Text style={[styles.verified, { color: '#1D9E75' }]}>✓ Verified Purchase</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 12, marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  title: { fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avgText: { fontSize: 14, fontWeight: '700' },
  countText: { fontSize: 12 },
  writeBtn: { marginHorizontal: 14, marginBottom: 10, borderRadius: 10, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  writeBtnText: { fontSize: 13, fontWeight: '600' },
  form: { margin: 14, borderRadius: 10, padding: 14, borderWidth: 1 },
  formLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 13, marginTop: 10 },
  textArea: { height: 80, textAlignVertical: 'top' },
  formBtns: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'flex-end' },
  cancelBtn: { borderRadius: 8, height: 36, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1 },
  cancelBtnText: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { borderRadius: 8, height: 36, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#2A0A0A' },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: '#FF453A' },
  submitBtn: { borderRadius: 8, height: 36, paddingHorizontal: 18, justifyContent: 'center' },
  submitBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  noReviews: { textAlign: 'center', padding: 20, fontSize: 13 },
  reviewCard: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { fontSize: 14, fontWeight: '700' },
  reviewerName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  reviewDate: { fontSize: 11 },
  reviewTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  reviewComment: { fontSize: 13, lineHeight: 18 },
  verified: { fontSize: 11, marginTop: 4, fontWeight: '600' },
});
