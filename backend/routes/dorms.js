const express = require('express');
const router = express.Router();

// GET /api/dorms - Get all dorms with average ratings
router.get('/dorms', async (req, res) => {
  try {
    const supabase = req.supabase;

    // Query all dorms
    const { data: dorms, error: dormsError } = await supabase
      .from('dorms')
      .select('*');

    if (dormsError) {
      console.error('Error fetching dorms:', dormsError);
      return res.status(500).json({ error: 'Failed to fetch dorms' });
    }

    // For each dorm, get average rating and review count
    const dormsWithRatings = await Promise.all(
      dorms.map(async (dorm) => {
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('dorm_id', dorm.id);

        if (reviewsError) {
          console.error(`Error fetching reviews for ${dorm.name}:`, reviewsError);
          return { ...dorm, average_rating: null, review_count: 0 };
        }

        // Calculate average rating
        const average_rating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null;

        return {
          ...dorm,
          average_rating: average_rating ? Math.round(average_rating * 10) / 10 : null,
          review_count: reviews.length
        };
      })
    );

    console.log(`✅ Fetched ${dormsWithRatings.length} dorms with ratings`);
    res.json(dormsWithRatings);

  } catch (err) {
    console.error('Error in GET /api/dorms:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
