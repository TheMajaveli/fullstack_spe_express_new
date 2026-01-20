import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categoryNames = ["Sci-Fi", "Action", "Drama", "Crime", "Horror", "Romance"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const categoryByName = new Map(categories.map((c) => [c.name, c]));

  // Admin user
  const adminEmail = "admin@cinenoir.local";
  const adminPassword = "Admin1234";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      username: "admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Movies (match frontend shape: year, duration, director, posterUrl, category string)
  const movies = [
    {
      title: "Inception",
      year: 2010,
      ratingAvg: 8.8,
      category: "Sci-Fi",
      duration: "2h 28m",
      director: "Christopher Nolan",
      posterUrl: "https://picsum.photos/seed/inception/400/600",
      description:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    },
    {
      title: "Interstellar",
      year: 2014,
      ratingAvg: 8.6,
      category: "Sci-Fi",
      duration: "2h 49m",
      director: "Christopher Nolan",
      posterUrl: "https://picsum.photos/seed/interstellar/400/600",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    },
    {
      title: "The Dark Knight",
      year: 2008,
      ratingAvg: 9.0,
      category: "Action",
      duration: "2h 32m",
      director: "Christopher Nolan",
      posterUrl: "https://picsum.photos/seed/darkknight/400/600",
      description:
        "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    },
  ];

  for (const m of movies) {
    const releaseDate = new Date(`${m.year}-01-01T00:00:00.000Z`);
    const movie = await prisma.movie.upsert({
      where: { title: m.title },
      update: {
        description: m.description,
        year: m.year,
        releaseDate,
        duration: m.duration,
        director: m.director,
        ratingAvg: m.ratingAvg,
        posterUrl: m.posterUrl,
      },
      create: {
        title: m.title,
        description: m.description,
        year: m.year,
        releaseDate,
        duration: m.duration,
        director: m.director,
        ratingAvg: m.ratingAvg,
        posterUrl: m.posterUrl,
      },
    });

    const cat = categoryByName.get(m.category);
    if (cat) {
      await prisma.movieCategory.upsert({
        where: { movieId_categoryId: { movieId: movie.id, categoryId: cat.id } },
        update: {},
        create: { movieId: movie.id, categoryId: cat.id },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

