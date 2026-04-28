const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/dorms - Get all dorms with average ratings
router.get("/dorms", async (req, res) => {
  try {
    const supabase = req.supabase;

    // Query all dorms
    const { data: dorms, error: dormsError } = await supabase
      .from("dorms")
      .select("*");

    if (dormsError) {
      console.error("Error fetching dorms:", dormsError);
      return res.status(500).json({ error: "Failed to fetch dorms" });
    }

    // For each dorm, get average rating and review count
    const dormsWithRatings = await Promise.all(
      dorms.map(async (dorm) => {
        const { data: reviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("rating")
          .eq("dorm_id", dorm.id);

        if (reviewsError) {
          console.error(
            `Error fetching reviews for ${dorm.name}:`,
            reviewsError
          );
          return { ...dorm, average_rating: null, review_count: 0 };
        }

        // Calculate average rating
        const average_rating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;

        return {
          ...dorm,
          average_rating: average_rating
            ? Math.round(average_rating * 10) / 10
            : null,
          review_count: reviews.length,
        };
      })
    );

    console.log(`Fetched ${dormsWithRatings.length} dorms with ratings`);
    res.json(dormsWithRatings);
  } catch (err) {
    console.error("Error in GET /api/dorms:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dorms/:id - Get a single dorm with all its reviews
router.get("/dorms/:id", async (req, res) => {
  try {
    const supabase = req.supabase;
    const dormId = req.params.id;

    // Query the specific dorm
    const { data: dorm, error: dormError } = await supabase
      .from("dorms")
      .select("*")
      .eq("id", dormId)
      .single();

    if (dormError || !dorm) {
      console.error(`Dorm not found: ${dormId}`, dormError);
      return res.status(404).json({ error: "Dorm not found" });
    }

    // Query all reviews for this dorm
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, rating, comment, anonymous_name, created_at, user_id")
      .eq("dorm_id", dormId)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error(`Error fetching reviews for dorm ${dormId}:`, reviewsError);
      return res.status(500).json({ error: "Failed to fetch reviews" });
    }

    // For each review, get vote counts and user's vote (if logged in)
    const reviewsWithVotes = await Promise.all(
      reviews.map(async (review) => {
        // Get all votes for this review
        const { data: votes, error: votesError } = await supabase
          .from('review_votes')
          .select('vote_type')
          .eq('review_id', review.id);

        if (votesError) {
          console.error(`Error fetching votes for review ${review.id}:`, votesError);
          return {
            ...review,
            upvote_count: 0,
            downvote_count: 0,
            net_votes: 0,
            user_vote: null
          };
        }

        const upvote_count = votes.filter(v => v.vote_type === 'upvote').length;
        const downvote_count = votes.filter(v => v.vote_type === 'downvote').length;

        return {
          ...review,
          upvote_count,
          downvote_count,
          net_votes: upvote_count - downvote_count,
          user_vote: null // Will be populated by frontend if user is logged in
        };
      })
    );

    // Calculate average rating
    const average_rating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    const response = {
      dorm: {
        ...dorm,
        average_rating: average_rating
          ? Math.round(average_rating * 10) / 10
          : null,
        review_count: reviewsWithVotes.length,
      },
      reviews: reviewsWithVotes,
    };

    console.log(`Fetched dorm ${dorm.name} with ${reviewsWithVotes.length} reviews`);
    res.json(response);
  } catch (err) {
    console.error("Error in GET /api/dorms/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/reviews - Submit a new review (requires valid JWT token)
router.post('/reviews', authMiddleware, async (req, res) => {
  try {
    const supabase = req.supabase;
    const { dorm_id, rating, comment } = req.body;
    const user_id = req.user.user_id; // Extract from verified JWT token

    // Validate input
    if (!dorm_id || !rating || !comment) {
      console.error('Missing required fields in review submission');
      return res.status(400).json({ error: 'Missing required fields: dorm_id, rating, comment' });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      console.error('Invalid rating:', rating);
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    if (comment.trim().length === 0) {
      console.error('Empty comment submitted');
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    // Generate random anonymous name
    const animals = ['Tiger', 'Owl', 'Bear', 'Wolf', 'Fox', 'Eagle', 'Hawk', 'Deer', 'Rabbit', 'Squirrel'];
    const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const anonymous_name = `Anonymous ${randomAnimal} #${randomNumber}`;

    // Insert review into database
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert([
        {
          dorm_id: dorm_id,
          user_id: user_id,
          rating: rating,
          comment: comment,
          anonymous_name: anonymous_name
        }
      ])
      .select();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return res.status(500).json({ error: 'Failed to submit review' });
    }

    console.log(`Review submitted for dorm_id ${dorm_id} as ${anonymous_name} by user ${user_id}`);
    res.status(201).json({
      success: true,
      review: newReview[0]
    });

  } catch (err) {
    console.error('Error in POST /api/reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reviews/:reviewId/vote - Submit or update a vote on a review (requires valid JWT token)
router.post('/reviews/:reviewId/vote', authMiddleware, async (req, res) => {
  try {
    const supabase = req.supabase;
    const { reviewId } = req.params;
    const { voteType } = req.body; // 'upvote', 'downvote', or null to remove
    const user_id = req.user.user_id; // Extract from verified JWT token

    // Validate input
    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID is required' });
    }

    if (voteType && !['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Vote type must be "upvote", "downvote", or null' });
    }

    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user already voted on this review
    const { data: existingVote, error: checkError } = await supabase
      .from('review_votes')
      .select('id, vote_type')
      .eq('review_id', reviewId)
      .eq('user_id', user_id)
      .single();

    let result;

    if (existingVote) {
      // User has an existing vote
      if (voteType === null) {
        // Remove the vote
        const { error: deleteError } = await supabase
          .from('review_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          console.error('Error deleting vote:', deleteError);
          return res.status(500).json({ error: 'Failed to remove vote' });
        }

        result = { action: 'removed' };
      } else if (existingVote.vote_type === voteType) {
        // Same vote type - remove it (toggle off)
        const { error: deleteError } = await supabase
          .from('review_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          console.error('Error deleting vote:', deleteError);
          return res.status(500).json({ error: 'Failed to toggle vote' });
        }

        result = { action: 'removed' };
      } else {
        // Different vote type - update it (switch)
        const { error: updateError } = await supabase
          .from('review_votes')
          .update({ vote_type: voteType, updated_at: new Date().toISOString() })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          return res.status(500).json({ error: 'Failed to update vote' });
        }

        result = { action: 'updated' };
      }
    } else {
      // No existing vote
      if (voteType === null) {
        // Nothing to do - no vote to remove
        result = { action: 'none' };
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('review_votes')
          .insert([
            {
              review_id: reviewId,
              user_id: user_id,
              vote_type: voteType
            }
          ]);

        if (insertError) {
          console.error('Error inserting vote:', insertError);
          return res.status(500).json({ error: 'Failed to submit vote' });
        }

        result = { action: 'created' };
      }
    }

    // Get updated vote counts for this review
    const { data: votes, error: votesError } = await supabase
      .from('review_votes')
      .select('vote_type')
      .eq('review_id', reviewId);

    if (votesError) {
      console.error('Error fetching votes:', votesError);
      return res.status(500).json({ error: 'Failed to fetch updated votes' });
    }

    // Count upvotes and downvotes
    const upvote_count = votes.filter(v => v.vote_type === 'upvote').length;
    const downvote_count = votes.filter(v => v.vote_type === 'downvote').length;
    const net_votes = upvote_count - downvote_count;

    // Get user's current vote
    const { data: userVote } = await supabase
      .from('review_votes')
      .select('vote_type')
      .eq('review_id', reviewId)
      .eq('user_id', user_id)
      .single();

    console.log(`Vote ${result.action} for review ${reviewId} by user ${user_id}`);
    res.json({
      success: true,
      upvote_count,
      downvote_count,
      net_votes,
      user_vote: userVote?.vote_type || null,
      action: result.action
    });

  } catch (err) {
    console.error('Error in POST /api/reviews/:reviewId/vote:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
