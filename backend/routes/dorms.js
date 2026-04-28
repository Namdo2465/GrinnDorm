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
        review_count: reviews.length,
      },
      reviews: reviews,
    };

    console.log(`Fetched dorm ${dorm.name} with ${reviews.length} reviews`);
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

module.exports = router;
