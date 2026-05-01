import React from "react";
import { useState } from "react";
import {
  Star,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  MessageSquarePlus,
} from "lucide-react";
import { Dorm, Review } from "../App";
import { ReviewModal } from "./ReviewModal";

interface DormDetailsPageProps {
  dorm: Dorm;
  reviews: Review[];
  onVote: (reviewId: string, voteType: "up" | "down") => void;
  onSubmitReview: (dormId: string, rating: number, comment: string) => void;
  onBack: () => void;
  isLoggedIn: boolean;
}

export function DormDetailsPage({
  dorm,
  reviews,
  onVote,
  onSubmitReview,
  isLoggedIn,
}: DormDetailsPageProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const calculateAverage = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  const avgRating = calculateAverage();
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) *
          100
        : 0,
  }));

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const VoteButtons = ({ review }: { review: Review }) => {
    const netScore = review.upvotes - review.downvotes;
    const scoreColor =
      netScore > 0
        ? "text-upvote-green"
        : netScore < 0
        ? "text-downvote-red"
        : "text-gray-500";

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onVote(review.id, "up")}
          disabled={!isLoggedIn}
          className={`p-1 rounded transition-colors ${
            review.userVote === "up"
              ? "bg-upvote-green text-white"
              : "text-gray-400 hover:text-upvote-green hover:bg-green-50"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className={`font-medium min-w-[2rem] text-center ${scoreColor}`}>
          {netScore}
        </span>
        <button
          onClick={() => onVote(review.id, "down")}
          disabled={!isLoggedIn}
          className={`p-1 rounded transition-colors ${
            review.userVote === "down"
              ? "bg-downvote-red text-white"
              : "text-gray-400 hover:text-downvote-red hover:bg-red-50"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="h-48 md:h-64 bg-gradient-to-br from-grinnell-red-light to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">{dorm.name}</h1>
            <p className="text-gray-600 mt-2">{dorm.campus}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl font-bold text-gray-900">
                  {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                </div>
                <div>
                  <StarRating rating={Math.round(avgRating)} />
                  <p className="text-sm text-gray-600 mt-1">
                    {reviews.length} reviews
                  </p>
                </div>
              </div>

              {dorm.officialLink && (
                <a
                  href={dorm.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-grinnell-red hover:text-grinnell-red-dark transition-colors"
                >
                  <span>Official Dorm Info</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="w-full md:w-auto px-6 py-3 bg-grinnell-red text-white rounded-lg hover:bg-grinnell-red-dark transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {review.author}
                    </span>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <VoteButtons review={review} />
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {showReviewModal && (
        <ReviewModal
          dormName={dorm.name}
          onClose={() => setShowReviewModal(false)}
          onSubmit={async (rating, comment) => {
            await onSubmitReview(dorm.id, rating, comment);
          }}
        />
      )}

      <button
        onClick={() => setShowReviewModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-grinnell-red text-white rounded-full shadow-lg hover:bg-grinnell-red-dark transition-all hover:scale-110 flex items-center justify-center md:hidden"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>
    </div>
  );
}
