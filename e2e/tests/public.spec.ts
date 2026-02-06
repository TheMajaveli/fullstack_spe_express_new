import { test, expect } from '@playwright/test';

test.describe('Public Catalog', () => {
  test('should load catalog page and display movies', async ({ page }) => {
    await page.goto('/');
    
    // Wait for catalog to load
    await expect(page.locator('h1')).toContainText(/discover films/i);
    
    // Check for movie grid
    const movieGrid = page.locator('[data-testid="movie-grid"], .grid');
    await expect(movieGrid).toBeVisible();
  });

  test('should apply search filter and update URL', async ({ page }) => {
    await page.goto('/');
    
    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Matrix');
    
    // URL should update
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
    
    // Select sort option
    const sortSelect = page.locator('select[aria-label="Sort by"]');
    await sortSelect.selectOption('rating');
    
    // URL should update
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
    
    // Should show error or 404 message
    await expect(page.locator('text=/not found|404/i')).toBeVisible();
  });

  test('should change page size', async ({ page }) => {
    await page.goto('/');
    
    // Select page size
    const limitSelect = page.locator('select[aria-label="Per page"]');
    if (await limitSelect.isVisible()) {
      await limitSelect.selectOption('12');
      
      // URL should update
      await expect(page).toHaveURL(/limit=12/);
    }
  });
});
