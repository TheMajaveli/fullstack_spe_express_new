import { test, expect } from '@playwright/test';

test.describe('Public Catalog', () => {
  test('should load catalog page and display movies', async ({ page }) => {
    await page.goto('/');
    
    // Wait for catalog: hero h1 can be "Découvrir les Films" or a featured movie title
    const movieGrid = page.locator('[data-testid="movie-grid"], .grid');
    await expect(movieGrid).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should apply search filter and update URL', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.getByPlaceholder(/rechercher|search/i).or(page.locator('input[aria-label*="Rechercher"]'));
    await searchInput.first().waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.first().fill('Matrix');
    
    await expect(page).toHaveURL(/q=Matrix/);
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/');
    
    // Click a category button
    const category = page.locator('button:has-text("Sci-Fi")').first();
    if (await category.isVisible()) {
      await category.click();
      
      // URL should update
      await expect(page).toHaveURL(/category=Sci-Fi/);
    }
  });

  test('should change sort option', async ({ page }) => {
    await page.goto('/');
    
    const sortSelect = page.locator('select[aria-label="Trier par"], select[aria-label="Sort by"]');
    await sortSelect.first().waitFor({ state: 'visible', timeout: 10000 });
    await sortSelect.first().selectOption('rating');
    
    await expect(page).toHaveURL(/sort=rating/);
  });

  test('should navigate to movie detail page', async ({ page }) => {
    await page.goto('/');
    
    // Click on first movie (if available)
    const firstMovie = page.locator('a[href^="/movies/"]').first();
    if (await firstMovie.isVisible()) {
      await firstMovie.click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/movies\/.+/);
      
      // Detail page should show movie info
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should show 404 for invalid movie ID', async ({ page }) => {
    await page.goto('/movies/nonexistent-id-12345');
    
    await expect(page.locator('text=/404|introuvable|not found|perdu/i')).toBeVisible({ timeout: 10000 });
  });

  test('should change page size', async ({ page }) => {
    await page.goto('/');
    
    const limitSelect = page.locator('select[aria-label="Par page"], select[aria-label="Per page"]');
    if (await limitSelect.first().isVisible()) {
      await limitSelect.first().selectOption('12');
      await expect(page).toHaveURL(/limit=12/);
    }
  });
});
