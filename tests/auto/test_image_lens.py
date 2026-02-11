"""Test whole-image lens button for cinematography."""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.set_window_size(1400, 900)

try:
    driver.get("http://localhost:8765/index.html")
    time.sleep(2)

    # Click Lourmarin artwork (second gallery item)
    items = driver.find_elements(By.CSS_SELECTOR, ".gallery-item")
    print(f"Found {len(items)} gallery items")
    items[1].click()
    time.sleep(2)

    # Check the image lens button is visible
    btn = driver.find_element(By.ID, "image-lens-btn")
    displayed = btn.is_displayed()
    print(f"Image lens button displayed: {displayed}")
    driver.save_screenshot("outputs/test_image_lens_btn.png")

    # Click the button
    btn.click()
    time.sleep(1)

    # Check popup is visible and pinned
    popup = driver.find_element(By.ID, "popup")
    is_visible = "visible" in popup.get_attribute("class")
    is_pinned = "pinned" in popup.get_attribute("class")
    print(f"Popup visible: {is_visible}, pinned: {is_pinned}")

    # Check popup content
    title = driver.find_element(By.ID, "popup-title").text
    text = driver.find_element(By.ID, "popup-text").text
    print(f"Title: {title}")
    print(f"Text: {text[:80]}...")

    # Check video is playing
    video = driver.find_element(By.ID, "popup-video")
    video_displayed = video.is_displayed()
    print(f"Video displayed: {video_displayed}")

    driver.save_screenshot("outputs/test_image_lens_popup.png")

    # Close popup
    close_btn = driver.find_element(By.ID, "popup-close")
    close_btn.click()
    time.sleep(0.5)
    is_visible_after = "visible" in popup.get_attribute("class")
    print(f"Popup visible after close: {is_visible_after}")

    # Go back and click Marsh — should NOT have the button
    driver.find_element(By.ID, "back-btn").click()
    time.sleep(1)
    items = driver.find_elements(By.CSS_SELECTOR, ".gallery-item")
    items[0].click()
    time.sleep(2)
    btn2 = driver.find_element(By.ID, "image-lens-btn")
    marsh_btn_displayed = btn2.is_displayed()
    print(f"Marsh image lens button displayed: {marsh_btn_displayed}")
    driver.save_screenshot("outputs/test_image_lens_marsh.png")

    print("\n=== RESULTS ===")
    print(f"PASS: Button visible on Lourmarin: {displayed}")
    print(f"PASS: Popup opens on click: {is_visible and is_pinned}")
    print(f"PASS: Video displayed: {video_displayed}")
    print(f"PASS: Popup closes: {not is_visible_after}")
    print(f"PASS: No button on Marsh: {not marsh_btn_displayed}")

finally:
    driver.quit()
