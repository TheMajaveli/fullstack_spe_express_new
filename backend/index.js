const express = require("express");
require("dotenv").config();
const cors = require("cors");

const { seedCategoriesIfEmpty } = require("./controllers/categoryController");
const { seedMoviesIfEmpty } = require("./config/seeders/movies_seeder");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/user");

const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques (images uploadées)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);
app.use("/categories", categoryRoutes);
app.use("/user", userRoutes);

app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
  await seedCategoriesIfEmpty();
  await seedMoviesIfEmpty();
  console.log(`Server running on http://localhost:${port}`);
});

