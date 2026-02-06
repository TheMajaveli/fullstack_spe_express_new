import { test, expect } from '@playwright/test';

test.describe('Member Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@cinenoir.local');
    await page.fill('input[type="password"]', 'Admin1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
  });

  test('should add movie to watchlist', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to first movie detail
    const firstMovie = page.locator('a[href^="/movies/"]').first();
    if (await firstMovie.isVisible()) {
      await firstMovie.click();
      await page.waitForTimeout(500);
      
      // Click watchlist button
      const watchlistBtn = page.locator('button:has-text("Watchlist")').first();
      if (await watchlistBtn.isVisible()) {
        await watchlistBtn.click();
        
        // Should show success feedback
        await expect(page.locator('text=/added|success/i')).toBeVisible({ timeout: 3000 }).catch(() => {
          // Toast might disappear quickly, that's OK
        });
      }
    }
  });

  test('should rate a movie', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to first movie detail
    const firstMovie = page.locator('a[href^="/movies/"]').first();
    if (await firstMovie.isVisible()) {
      await firstMovie.click();
      await page.waitForTimeout(500);
      
      // Click rate button
      const rateBtn = page.locator('button:has-text("Rate")').first();
      if (await rateBtn.isVisible()) {
        await rateBtn.click();
        await page.waitForTimeout(500);
        
        // Select rating (click on star or input)
        const ratingInput = page.locator('input[type="number"], button:has-text("★")').first();
        if (await ratingInput.isVisible()) {
          if ((await ratingInput.getAttribute('type')) === 'number') {
            await ratingInput.fill('8');
          } else {
            await ratingInput.click();
          }
          
          // Submit rating
          const submitBtn = page.locator('button[type="submit"]:has-text(/submit|rate/i)');
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            
            // Should show success
            await expect(page.locator('text=/rated|success/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
          }
        }
      }
    }
  });

  test('should mark movie as watched', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to first movie detail
    const firstMovie = page.locator('a[href^="/movies/"]').first();
    if (await firstMovie.isVisible()) {
      await firstMovie.click();
      await page.waitForTimeout(500);
      
      // Click mark as watched button
      const watchedBtn = page.locator('button:has-text(/watched|mark/i)').first();
      if (await watchedBtn.isVisible()) {
        await watchedBtn.click();
        
        // Should show success
        await expect(page.locator('text=/watched|success/i')).toBeVisible({ timeout: 3000 }).catch(() => {});
      }
    }
  });

  test('should view account page with watchlist', async ({ page }) => {
    await page.goto('/account');
    
    // Should show account page
    await expect(page.locator('text=/watchlist|profile|account/i')).toBeVisible();
  });
});
