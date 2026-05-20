import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// @ts-ignore
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
// @ts-ignore
const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock data expanded
  const dealerships = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    city: ["Los Angeles", "New York", "Kansas City", "Wichita", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"][i % 10],
    state: ["California", "New York", "Kansas", "Kansas", "Illinois", "Texas", "Arizona", "Pennsylvania", "Texas", "California"][i % 10],
    address: `${100 + i} Motor Drive`,
    zip: `6${i}101`,
    lat: (34.05 + (i * 0.1)).toFixed(4),
    long: (-118.24 - (i * 0.1)).toFixed(4),
    short_name: `D${i + 1}`,
    full_name: i % 2 === 0 ? `Sunrise Auto ${i + 1}` : `Metro Motors ${i + 1}`,
    name: i % 2 === 0 ? `Sunrise Auto ${i + 1}` : `Metro Motors ${i + 1}`
  }));

  const reviews = [
    { 
      id: 1, 
      dealer_id: 10, 
      name: "John Doe", 
      review: "Excellent service!", 
      sentiment: "positive",
      purchase: true,
      purchase_date: "05/10/2026",
      car_make: "Toyota",
      car_model: "Camry",
      car_year: 2024
    },
    { 
      id: 2, 
      dealer_id: 10, 
      name: "Jane Smith", 
      review: "Average experience.", 
      sentiment: "neutral",
      purchase: false
    }
  ];

  const carMakes = {
    "CarModels": [
      { id: 1, make: "Toyota", model: "Camry" },
      { id: 2, make: "Toyota", model: "Corolla" },
      { id: 3, make: "Ford", model: "F-150" },
      { id: 4, make: "Ford", model: "Mustang" },
      { id: 5, make: "Honda", model: "Civic" },
      { id: 6, make: "Honda", model: "Accord" },
      { id: 7, make: "Chevrolet", model: "Silverado" },
      { id: 8, make: "Nissan", model: "Altima" },
      { id: 9, make: "Jeep", model: "Wrangler" },
      { id: 10, make: "Subaru", model: "Outback" },
      { id: 11, make: "Volkswagen", model: "Jetta" },
      { id: 12, make: "BMW", model: "3 Series" },
      { id: 13, make: "Mercedes-Benz", model: "C-Class" },
      { id: 14, make: "Audi", model: "A4" },
      { id: 15, make: "Tesla", model: "Model 3" }
    ]
  };

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
      res.json({ status: "Authenticated", userName: username });
    } else {
      res.status(400).json({ status: "Error", message: "Invalid credentials" });
    }
  });

  // Task 6: Logout must be GET and return empty userName
  app.get("/djangoapp/logout", (req, res) => {
    res.json({ userName: "" });
  });

  app.post("/api/register", (req, res) => {
    res.json({ status: "User registered successfully" });
  });

  // Task 9: Endpoint /djangoapp/get_dealers
  app.get("/djangoapp/get_dealers", (req, res) => {
    res.json(dealerships);
  });

  // Task 11: Endpoint /djangoapp/get_dealers/:state
  app.get("/djangoapp/get_dealers/:state", (req, res) => {
    const state = req.params.state;
    res.json(dealerships.filter(d => d.state.toLowerCase() === state.toLowerCase()));
  });

  // Task 10: Endpoint /djangoapp/get_dealer_details/:id
  app.get("/djangoapp/get_dealer_details/:id", (req, res) => {
    const dealer = dealerships.find(d => d.id === parseInt(req.params.id));
    if (dealer) res.json(dealer);
    else res.status(404).json({ message: "Dealer not found" });
  });

  // Task 8: Endpoint /djangoapp/get_reviews/:dealer_id
  app.get("/djangoapp/get_reviews/:dealer_id", (req, res) => {
    const dealerReviews = reviews.filter(r => r.dealer_id === parseInt(req.params.dealer_id));
    res.json(dealerReviews);
  });

  // Task 14 & 15: Get Cars
  app.get("/djangoapp/get_cars", (req, res) => {
    res.json(carMakes);
  });

  // Task 16: Sentiment analysis must be GET
  app.get("/djangoapp/analyze/:text", async (req, res) => {
    const text = req.params.text;
    try {
      const result = await model.generateContent(`Analyze the sentiment of this text and return just the word: positive, negative, or neutral. Text: "${text}"`);
      const sentiment = result.response.text().trim().toLowerCase();
      res.json({ sentiment });
    } catch (error) {
      res.json({ sentiment: "neutral" }); // Fallback
    }
  });

  // Keep old routes for UI compatibility
  app.get("/api/dealerships", (req, res) => {
    const { state } = req.query;
    if (state) {
      res.json(dealerships.filter(d => d.state.toLowerCase() === (state as string).toLowerCase()));
    } else {
      res.json(dealerships);
    }
  });

  app.get("/api/dealership/:id", (req, res) => {
    const dealer = dealerships.find(d => d.id === parseInt(req.params.id));
    if (dealer) res.json(dealer);
    else res.status(404).json({ message: "Dealer not found" });
  });

  app.get("/api/reviews/:dealer_id", (req, res) => {
    const dealerReviews = reviews.filter(r => r.dealer_id === parseInt(req.params.dealer_id));
    res.json(dealerReviews);
  });

  app.get("/api/cars", (req, res) => {
    res.json(carMakes.CarModels);
  });

  app.post("/api/sentiment", async (req, res) => {
    const { text } = req.body;
    try {
      const result = await model.generateContent(`Analyze the sentiment of this text and return just the word: positive, negative, or neutral. Text: "${text}"`);
      const sentiment = result.response.text().trim().toLowerCase();
      res.json({ sentiment });
    } catch (error) {
      res.json({ sentiment: "neutral" }); // Fallback
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
