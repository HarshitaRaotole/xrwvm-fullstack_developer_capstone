import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, MapPin, User, LogIn, LogOut, Info, Phone, Star, Send } from 'lucide-react';

// --- Components ---

const Navbar = ({ user, onLogout }: { user: string | null, onLogout: () => void }) => (
  <nav className="bg-teal-700 text-white p-4 shadow-md">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold">
        <Car size={28} />
        <span>Best Cars Dealership</span>
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/" className="hover:text-teal-200 transition-colors">Home</Link>
        <Link to="/about" className="hover:text-teal-200 transition-colors">About Us</Link>
        <Link to="/contact" className="hover:text-teal-200 transition-colors">Contact Us</Link>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><User size={18} /> {user}</span>
            <button onClick={onLogout} className="flex items-center gap-1 hover:text-teal-200 cursor-pointer">
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="flex items-center gap-1 hover:text-teal-200">
              <LogIn size={18} /> Login
            </Link>
            <Link to="/register" className="bg-teal-500 px-4 py-1 rounded hover:bg-teal-400 transition-colors">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  </nav>
);

const Home = () => {
  const [dealers, setDealers] = useState<any[]>([]);
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    const url = stateFilter 
      ? `/djangoapp/get_dealers/${stateFilter}` 
      : `/djangoapp/get_dealers`;
    fetch(url)
      .then(res => res.json())
      .then(data => setDealers(data));
  }, [stateFilter]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Our Dealerships</h1>
      <div className="mb-6 flex gap-4 items-center">
        <label className="font-medium">Filter by State:</label>
        <select 
          className="border p-2 rounded focus:ring-2 focus:ring-teal-500 outline-none"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
        >
          <option value="">All States</option>
          <option value="California">California</option>
          <option value="New York">New York</option>
          <option value="Kansas">Kansas</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dealers.map(dealer => (
          <motion.div 
            key={dealer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <h2 className="text-xl font-bold mb-2 text-teal-800">{dealer.full_name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <MapPin size={16} />
              <span className="text-sm">{dealer.address}, {dealer.city}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
              <span>ID: {dealer.id}</span>
              <span>State: {dealer.state}</span>
              <span>Zip: {dealer.zip}</span>
            </div>
            <Link 
              to={`/dealer/${dealer.id}`}
              className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              View Reviews
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DealerDetail = ({ user }: { user: string | null }) => {
  const { id } = useParams();
  const [dealer, setDealer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/djangoapp/get_dealer_details/${id}`).then(res => res.json()).then(setDealer);
    fetch(`/djangoapp/get_reviews/${id}`).then(res => res.json()).then(setReviews);
  }, [id]);

  if (!dealer) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-teal-900">{dealer.name}</h1>
      <p className="text-gray-600 mb-8">{dealer.address}, {dealer.city}, {dealer.state}</p>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Star className="text-yellow-500" /> Customer Reviews
        </h2>
        {user && (
          <button 
            onClick={() => navigate(`/post-review/${id}`)}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 font-medium"
          >
            Post a Review
          </button>
        )}
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? reviews.map(r => (
          <div key={r.id} className="border p-4 rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-gray-800">{r.name}</span>
              <span className={`text-xs px-2 py-1 rounded uppercase font-bold ${r.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {r.sentiment}
              </span>
            </div>
            <p className="text-gray-700 italic">"{r.review}"</p>
          </div>
        )) : (
          <p className="text-gray-500">No reviews yet for this dealer.</p>
        )}
      </div>
    </div>
  );
};

const PostReview = ({ user }: { user: string | null }) => {
  const { id } = useParams();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => navigate(`/dealer/${id}`), 2000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Write a Review</h1>
      {submitted ? (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          Review submitted successfully! Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Your Review</label>
            <textarea 
              className="w-full border p-3 rounded-lg h-32 focus:ring-2 focus:ring-teal-500 outline-none"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How was your experience?"
            />
          </div>
          <button className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 flex items-center justify-center gap-2">
            <Send size={18} /> Submit Review
          </button>
        </form>
      )}
    </div>
  );
};

const About = () => (
  <div className="p-8 max-w-7xl mx-auto">
    <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>
    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
      <div>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Welcome to <span className="font-bold text-teal-700">Best Cars Dealership</span>, your premier destination for exceptional automotive experiences. Founded in 2010, we have grown from a small family-owned lot to one of the region's most trusted names in the industry.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Our mission is simple: to provide transparency, quality, and passion in every transaction. Whether you're looking for a reliable daily driver or a high-performance machine, our team is here to guide you every step of the way.
        </p>
      </div>
      <img src="https://images.unsplash.com/photo-1549194388-2469d59ec39c?q=80&w=1000&auto=format&fit=crop" alt="Dealership" className="rounded-2xl shadow-xl" />
    </div>
    
    <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Team</h2>
    <div className="grid md:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=staff${i}`} alt="Staff" />
          </div>
          <h3 className="font-bold text-xl">Staff Member {i}</h3>
          <p className="text-gray-500">{i === 1 ? 'General Manager' : i === 2 ? 'Sales Lead' : 'Service Specialist'}</p>
        </div>
      ))}
    </div>
  </div>
);

const Contact = () => (
  <div className="p-8 max-w-7xl mx-auto">
    <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
    <div className="grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
         <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form className="grid md:grid-cols-2 gap-6">
              <input type="text" placeholder="Full Name" className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
              <input type="email" placeholder="Email Address" className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
              <textarea placeholder="Your Message" className="md:col-span-2 border p-3 rounded-lg h-32 outline-none focus:ring-2 focus:ring-teal-500" />
              <button className="bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors">Send Message</button>
            </form>
         </div>
      </div>
      <div className="space-y-6">
        <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Phone size={20} className="text-teal-600" /> Get in Touch</h2>
           <p className="text-gray-700 mb-2 font-bold">Main Office:</p>
           <p className="text-gray-600 mb-4">+1 (555) 123-4567</p>
           <p className="text-gray-700 mb-2 font-bold">Email:</p>
           <p className="text-gray-600">contact@bestcars.com</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl border">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapPin size={20} className="text-teal-600" /> Location</h2>
           <p className="text-gray-600">123 Automotive Plaza, Kansas City, KS 66101</p>
        </div>
      </div>
    </div>
  </div>
);

const AuthPage = ({ type, onLogin }: { type: 'login' | 'register', onLogin: (name: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (type === 'login') {
        onLogin(data.userName);
        navigate('/');
      } else {
        alert('Registered! Please login.');
        navigate('/login');
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-2xl shadow-xl border w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-teal-800">
          {type === 'login' ? 'Welcome Back' : 'Join Best Cars'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required />
               </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          {type === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-lg active:scale-95">
            {type === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          {type === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link to={type === 'login' ? '/register' : '/login'} className="text-teal-600 font-bold hover:underline">
            {type === 'login' ? 'Register here' : 'Login here'}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<string | null>(null);

  const handleLogout = () => {
    fetch('/djangoapp/logout').then(res => res.json()).then(data => {
      setUser(null);
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<AuthPage type="login" onLogin={setUser} />} />
            <Route path="/register" element={<AuthPage type="register" onLogin={setUser} />} />
            <Route path="/dealer/:id" element={<DealerDetail user={user} />} />
            <Route path="/post-review/:id" element={<PostReview user={user} />} />
          </Routes>
        </main>
        <footer className="bg-gray-800 text-white p-8 text-center">
          <p>&copy; 2026 Best Cars Dealership. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}
