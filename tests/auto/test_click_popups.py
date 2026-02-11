"""Test click-to-open popups and multiple simultaneous popups."""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

driver = webdriver.Chrome()
driver.set_window_size(1400, 900)

try:
    driver.get("http://localhost:8080/index.html")
    time.sleep(2)

    # Click on Marsh artwork
    gallery_items = driver.find_elements(By.CLASS_NAME, "gallery-item")
    print(f"Found {len(gallery_items)} gallery items")
    gallery_items[0].click()
    time.sleep(2)

    # Verify viewer screen is showing
    viewer = driver.find_element(By.ID, "viewer-screen")
    assert "hidden" not in viewer.get_attribute("class"), "Viewer should be visible"

    # Check subtitle text
    subtitle = driver.find_element(By.ID, "viewer-subtitle")
    print(f"Subtitle: {subtitle.text}")
    assert "Mouse click" in subtitle.text, f"Subtitle should say 'Mouse click', got: {subtitle.text}"

    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_viewer_click.png")

    # Click on the artwork image at different positions to open popups
    artwork = driver.find_element(By.ID, "artwork")
    rect = artwork.rect
    print(f"Artwork rect: {rect}")

    # Click in the middle area (likely a segment)
    actions = ActionChains(driver)
    actions.move_to_element_with_offset(artwork, int(rect['width']*0.3), int(rect['height']*0.5))
    actions.click()
    actions.perform()
    time.sleep(1)

    # Count popup elements
    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After first click: {len(popups)} popup(s)")
    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_first_popup.png")

    # Click at a different position
    actions = ActionChains(driver)
    actions.move_to_element_with_offset(artwork, int(rect['width']*0.7), int(rect['height']*0.3))
    actions.click()
    actions.perform()
    time.sleep(1)

    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After second click: {len(popups)} popup(s)")
    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_two_popups.png")

    # Close the first popup
    if len(popups) > 0:
        close_btns = popups[0].find_elements(By.CLASS_NAME, "popup-close")
        if close_btns:
            close_btns[0].click()
            time.sleep(0.5)

    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After closing one: {len(popups)} popup(s)")
    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_after_close.png")

    # Test whole-image button
    image_btn = driver.find_element(By.ID, "image-lens-btn")
    if image_btn.is_displayed():
        image_btn.click()
        time.sleep(1)
        popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
        print(f"After whole-image click: {len(popups)} popup(s)")
        driver.save_screenshot("/Users/paul/deeplooking/outputs/test_wholeimage_popup.png")

    # Test back to gallery clears all
    back_btn = driver.find_element(By.ID, "back-btn")
    back_btn.click()
    time.sleep(1)
    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After back to gallery: {len(popups)} popup(s)")
    assert len(popups) == 0, "All popups should be cleared on back"

    # Test hover tooltip - open viewer again
    gallery_items = driver.find_elements(By.CLASS_NAME, "gallery-item")
    gallery_items[0].click()
    time.sleep(2)

    artwork = driver.find_element(By.ID, "artwork")
    actions = ActionChains(driver)
    actions.move_to_element_with_offset(artwork, int(rect['width']*0.3), int(rect['height']*0.5))
    actions.perform()
    time.sleep(0.5)

    tooltip = driver.find_element(By.CLASS_NAME, "segment-tooltip")
    print(f"Tooltip displayed: {tooltip.is_displayed()}, text: {tooltip.text}")
    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_hover_tooltip.png")

    print("\nAll tests passed!")

except Exception as e:
    print(f"ERROR: {e}")
    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_error.png")
    raise
finally:
    driver.quit()
