import React from "react";
import { useState, useEffect } from "react";
import { AuthPage } from "./components/AuthPage";
import { HomePage } from "./components/HomePage";
import { DormDetailsPage } from "./components/DormDetailsPage";
import { Header } from "./components/Header";
import { API_ENDPOINTS } from "../config/api";

export interface Review {
  id: string;
  dormId: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
}

export interface Dorm {
  id: string;
  name: string;
  description: string;
  campus: string;
  officialLink?: string;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "1",
    dormId: "younker",
    rating: 5,
    comment:
      "Great location and clean facilities! Really enjoyed my time here.",
    author: "Anonymous Squirrel #42",
    date: "2026-04-15",
    upvotes: 12,
    downvotes: 2,
    userVote: null,
  },
  {
    id: "2",
    dormId: "younker",
    rating: 4,
    comment:
      "Nice dorm but can get noisy on weekends. Overall good experience though.",
    author: "Anonymous Squirrel #17",
    date: "2026-04-10",
    upvotes: 8,
    downvotes: 3,
    userVote: null,
  },
  {
    id: "3",
    dormId: "smith",
    rating: 5,
    comment: "Love the community here and the study lounges are top-notch!",
    author: "Anonymous Squirrel #89",
    date: "2026-04-20",
    upvotes: 15,
    downvotes: 1,
    userVote: null,
  },
  {
    id: "4",
    dormId: "loose",
    rating: 3,
    comment:
      "Good community but needs some renovation. Location is convenient.",
    author: "Anonymous Squirrel #23",
    date: "2026-04-05",
    upvotes: 5,
    downvotes: 7,
    userVote: null,
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<"auth" | "home" | "dorm">(
    "auth"
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [dormLoading, setDormLoading] = useState(false);
  const [dormError, setDormError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedDormReviews, setSelectedDormReviews] = useState<Review[]>([]);
  const [selectedDormId, setSelectedDormId] = useState<string | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("grinnDormLoggedIn") === "true";
    const email = localStorage.getItem("grinnDormUserEmail") || "";
    if (loggedIn && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setCurrentPage("home");
    }
  }, []);

  // Fetch dorms from backend
  useEffect(() => {
    const fetchDorms = async () => {
      try {
        setDormLoading(true);
        setDormError(null);
        const response = await fetch(API_ENDPOINTS.GET_DORMS);
        if (!response.ok) {
          throw new Error(`Failed to fetch dorms: ${response.statusText}`);
        }
        const data = await response.json();
        // Backend returns dorms with rating data; format to match Dorm interface
        const formattedDorms = data.map((dorm: any) => {
          // Transform campus value: "North" -> "North Campus", "Off-campus" stays as is
          let campus = dorm.campus;
          if (dorm.campus !== "Off-campus") {
            campus = `${dorm.campus} Campus`;
          }
          return {
            id: dorm.id,
            name: dorm.name,
            description: `${dorm.name} residence hall`,
            campus,
            officialLink: dorm.external_link,
          };
        });
        setDorms(formattedDorms);
      } catch (err) {
        console.error("Error fetching dorms:", err);
        setDormError(
          err instanceof Error ? err.message : "Failed to load dorms"
        );
      } finally {
        setDormLoading(false);
      }
    };

    fetchDorms();
  }, []);

  // Fetch all reviews from all dorms for homepage display
  useEffect(() => {
    if (dorms.length === 0) return;

    const fetchAllReviews = async () => {
      try {
        // Fetch all dorm reviews in parallel
        const reviewPromises = dorms.map(async (dorm) => {
          try {
            const response = await fetch(API_ENDPOINTS.GET_DORM(dorm.id));
            if (!response.ok) return [];

            const data = await response.json();
            if (data.reviews && Array.isArray(data.reviews)) {
              return data.reviews.map((review: any) => ({
                id: review.id,
                dormId: dorm.id,
                rating: review.rating,
                comment: review.comment,
                author: review.anonymous_name || "Anonymous",
                date: review.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                upvotes: review.upvote_count || 0,
                downvotes: review.downvote_count || 0,
                userVote: review.user_vote || null,
              }));
            }
            return [];
          } catch (err) {
            console.error(`Error fetching reviews for dorm ${dorm.id}:`, err);
            return [];
          }
        });

        // Wait for all requests to complete
        const results = await Promise.all(reviewPromises);
        const allReviews = results.flat();
        setReviews(allReviews.length > 0 ? allReviews : INITIAL_REVIEWS);
      } catch (err) {
        console.error("Error fetching all reviews:", err);
        setReviews(INITIAL_REVIEWS);
      }
    };

    fetchAllReviews();
  }, [dorms]);

  // Fetch reviews for selected dorm from backend
  useEffect(() => {
    if (!selectedDormId) return;

    const fetchDormReviews = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GET_DORM(selectedDormId));
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Format reviews from backend to match Review interface
        if (data.reviews && Array.isArray(data.reviews)) {
          const formattedReviews = data.reviews.map((review: any) => ({
            id: review.id,
            dormId: selectedDormId,
            rating: review.rating,
            comment: review.comment,
            author: review.anonymous_name || "Anonymous",
            date: review.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            upvotes: review.upvote_count || 0,
            downvotes: review.downvote_count || 0,
            userVote: review.user_vote || null,
          }));
          setSelectedDormReviews(formattedReviews);
        }
      } catch (err) {
        console.error("Error fetching reviews for dorm:", err);
        setSelectedDormReviews([]);
      }
    };

    fetchDormReviews();
  }, [selectedDormId]);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem("grinnDormLoggedIn", "true");
    localStorage.setItem("grinnDormUserEmail", email);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    localStorage.removeItem("grinnDormLoggedIn");
    localStorage.removeItem("grinnDormUserEmail");
    setCurrentPage("auth");
  };

  const handleDormClick = (dormId: string) => {
    setSelectedDormId(dormId);
    setCurrentPage("dorm");
  };

  const handleBackToHome = () => {
    setSelectedDormId(null);
    setCurrentPage("home");
  };

  const handleVote = (reviewId: string, voteType: "up" | "down") => {
    if (!isLoggedIn) return;

    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          const currentVote = review.userVote;
          let newUpvotes = review.upvotes;
          let newDownvotes = review.downvotes;
          let newUserVote: "up" | "down" | null = voteType;

          if (currentVote === voteType) {
            newUserVote = null;
            if (voteType === "up") newUpvotes--;
            else newDownvotes--;
          } else if (currentVote === "up" && voteType === "down") {
            newUpvotes--;
            newDownvotes++;
          } else if (currentVote === "down" && voteType === "up") {
            newDownvotes--;
            newUpvotes++;
          } else {
            if (voteType === "up") newUpvotes++;
            else newDownvotes++;
          }

          return {
            ...review,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote,
          };
        }
        return review;
      })
    );
  };

  const handleSubmitReview = async (
    dormId: string,
    rating: number,
    comment: string
  ) => {
    try {
      const token = localStorage.getItem("grinnDormToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(API_ENDPOINTS.POST_REVIEW, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dorm_id: dormId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.statusText}`);
      }

      const responseData = await response.json();
      const newReviewData = responseData.review;
      
      // Create Review object from backend response
      const newReview: Review = {
        id: newReviewData.id,
        dormId,
        rating: newReviewData.rating,
        comment: newReviewData.comment,
        author: newReviewData.anonymous_name || "Anonymous",
        date: newReviewData.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        upvotes: newReviewData.upvote_count || 0,
        downvotes: newReviewData.downvote_count || 0,
        userVote: null,
      };

      // Update both reviews arrays
      setSelectedDormReviews([newReview, ...selectedDormReviews]);
      setReviews([newReview, ...reviews]);
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn && (
        <Header
          userEmail={userEmail}
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
          showBackButton={currentPage === "dorm"}
        />
      )}

      {currentPage === "auth" && !isLoggedIn && (
        <AuthPage onLogin={handleLogin} />
      )}

      {currentPage === "home" && isLoggedIn && (
        <>
          {dormError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded m-4">
              <p>Error loading dorms: {dormError}</p>
            </div>
          )}
          {dormLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-gray-600">Loading dorms...</p>
            </div>
          ) : (
            <HomePage
              dorms={dorms}
              reviews={reviews}
              onDormClick={handleDormClick}
            />
          )}
        </>
      )}

      {currentPage === "dorm" && isLoggedIn && selectedDormId && (
        <DormDetailsPage
          dorm={dorms.find((d) => d.id === selectedDormId)!}
          reviews={selectedDormReviews}
          onVote={handleVote}
          onSubmitReview={handleSubmitReview}
          onBack={handleBackToHome}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}
