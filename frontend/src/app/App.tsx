import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { DormDetailsPage } from './components/DormDetailsPage';
import { Header } from './components/Header';

export interface Review {
  id: string;
  dormId: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

export interface Dorm {
  id: string;
  name: string;
  description: string;
  campus: string;
  officialLink?: string;
}

const DORMS: Dorm[] = [
  { id: 'younker', name: 'Younker Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'smith', name: 'Smith Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'langan', name: 'Langan Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'rawson', name: 'Rawson Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'gates', name: 'Gates Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'clark', name: 'Clark Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'cowles', name: 'Cowles Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'dibble', name: 'Dibble Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'norris', name: 'Norris Hall', description: 'North Campus residence hall', campus: 'North Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'loose', name: 'Loose Hall', description: 'South Campus residence hall', campus: 'South Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'read', name: 'Read Hall', description: 'South Campus residence hall', campus: 'South Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'haines', name: 'Haines Hall', description: 'South Campus residence hall', campus: 'South Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'james', name: 'James Hall', description: 'South Campus residence hall', campus: 'South Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'cleveland', name: 'Cleveland Hall', description: 'South Campus residence hall', campus: 'South Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'main', name: 'Main Hall', description: 'South Campus residence hall', campus: 'South Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'lazier', name: 'Lazier Hall', description: 'East Campus residence hall', campus: 'East Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'kershaw', name: 'Kershaw Hall', description: 'East Campus residence hall', campus: 'East Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'rose', name: 'Rose Hall', description: 'East Campus residence hall', campus: 'East Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'rathje', name: 'Rathje Hall', description: 'East Campus residence hall', campus: 'East Campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
  { id: 'renfrow', name: 'Renfrow Hall', description: 'Off-campus residence hall', campus: 'Off-campus', officialLink: 'https://www.grinnell.edu/campus-life/housing' },
];

const INITIAL_REVIEWS: Review[] = [
  { id: '1', dormId: 'younker', rating: 5, comment: 'Great location and clean facilities! Really enjoyed my time here.', author: 'Anonymous Squirrel #42', date: '2026-04-15', upvotes: 12, downvotes: 2, userVote: null },
  { id: '2', dormId: 'younker', rating: 4, comment: 'Nice dorm but can get noisy on weekends. Overall good experience though.', author: 'Anonymous Squirrel #17', date: '2026-04-10', upvotes: 8, downvotes: 3, userVote: null },
  { id: '3', dormId: 'smith', rating: 5, comment: 'Love the community here and the study lounges are top-notch!', author: 'Anonymous Squirrel #89', date: '2026-04-20', upvotes: 15, downvotes: 1, userVote: null },
  { id: '4', dormId: 'loose', rating: 3, comment: 'Good community but needs some renovation. Location is convenient.', author: 'Anonymous Squirrel #23', date: '2026-04-05', upvotes: 5, downvotes: 7, userVote: null },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'dorm'>('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedDormId, setSelectedDormId] = useState<string | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('grinnDormLoggedIn') === 'true';
    const email = localStorage.getItem('grinnDormUserEmail') || '';
    if (loggedIn && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setCurrentPage('home');
    }
  }, []);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('grinnDormLoggedIn', 'true');
    localStorage.setItem('grinnDormUserEmail', email);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('grinnDormLoggedIn');
    localStorage.removeItem('grinnDormUserEmail');
    setCurrentPage('auth');
  };

  const handleDormClick = (dormId: string) => {
    setSelectedDormId(dormId);
    setCurrentPage('dorm');
  };

  const handleBackToHome = () => {
    setSelectedDormId(null);
    setCurrentPage('home');
  };

  const handleVote = (reviewId: string, voteType: 'up' | 'down') => {
    if (!isLoggedIn) return;

    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        const currentVote = review.userVote;
        let newUpvotes = review.upvotes;
        let newDownvotes = review.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        if (currentVote === voteType) {
          newUserVote = null;
          if (voteType === 'up') newUpvotes--;
          else newDownvotes--;
        } else if (currentVote === 'up' && voteType === 'down') {
          newUpvotes--;
          newDownvotes++;
        } else if (currentVote === 'down' && voteType === 'up') {
          newDownvotes--;
          newUpvotes++;
        } else {
          if (voteType === 'up') newUpvotes++;
          else newDownvotes++;
        }

        return { ...review, upvotes: newUpvotes, downvotes: newDownvotes, userVote: newUserVote };
      }
      return review;
    }));
  };

  const handleSubmitReview = (dormId: string, rating: number, comment: string) => {
    const anonymousNumber = Math.floor(Math.random() * 999) + 1;
    const newReview: Review = {
      id: Date.now().toString(),
      dormId,
      rating,
      comment,
      author: `Anonymous Squirrel #${anonymousNumber}`,
      date: new Date().toISOString().split('T')[0],
      upvotes: 0,
      downvotes: 0,
      userVote: null,
    };
    setReviews([newReview, ...reviews]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn && (
        <Header
          userEmail={userEmail}
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
          showBackButton={currentPage === 'dorm'}
        />
      )}

      {currentPage === 'auth' && !isLoggedIn && (
        <AuthPage onLogin={handleLogin} />
      )}

      {currentPage === 'home' && isLoggedIn && (
        <HomePage
          dorms={DORMS}
          reviews={reviews}
          onDormClick={handleDormClick}
        />
      )}

      {currentPage === 'dorm' && isLoggedIn && selectedDormId && (
        <DormDetailsPage
          dorm={DORMS.find(d => d.id === selectedDormId)!}
          reviews={reviews.filter(r => r.dormId === selectedDormId)}
          onVote={handleVote}
          onSubmitReview={handleSubmitReview}
          onBack={handleBackToHome}
          isLoggedIn={isLoggedIn}
        />
      )}
    </div>
  );
}
