"""Test multiple popups from distinct segments."""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.set_window_size(1400, 900)

try:
    driver.get("http://localhost:8080/index.html")
    time.sleep(2)

    # Click on Marsh artwork
    gallery_items = driver.find_elements(By.CLASS_NAME, "gallery-item")
    gallery_items[0].click()
    time.sleep(2)

    # Use JS to simulate clicks at specific positions on the artwork
    # Click on water area
    driver.execute_script("""
        const art = document.getElementById('artwork');
        const rect = art.getBoundingClientRect();
        const x = rect.left + rect.width * 0.35;
        const y = rect.top + rect.height * 0.65;
        art.dispatchEvent(new MouseEvent('click', {clientX: x, clientY: y, bubbles: true}));
    """)
    time.sleep(1)

    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After click on water area: {len(popups)} popup(s)")

    # Click on sky area
    driver.execute_script("""
        const art = document.getElementById('artwork');
        const rect = art.getBoundingClientRect();
        const x = rect.left + rect.width * 0.5;
        const y = rect.top + rect.height * 0.08;
        art.dispatchEvent(new MouseEvent('click', {clientX: x, clientY: y, bubbles: true}));
    """)
    time.sleep(1)

    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After click on sky area: {len(popups)} popup(s)")

    # Click on marsh grass (right side)
    driver.execute_script("""
        const art = document.getElementById('artwork');
        const rect = art.getBoundingClientRect();
        const x = rect.left + rect.width * 0.85;
        const y = rect.top + rect.height * 0.45;
        art.dispatchEvent(new MouseEvent('click', {clientX: x, clientY: y, bubbles: true}));
    """)
    time.sleep(1)

    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After click on grass area: {len(popups)} popup(s)")

    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_multi_popups.png")

    # Print each popup's title
    for i, p in enumerate(popups):
        title = p.find_element(By.CLASS_NAME, "poem-title").text
        print(f"  Popup {i+1}: {title}")

    # Test lightbox - click on image in first popup
    if len(popups) > 0:
        popup_images = popups[0].find_elements(By.CLASS_NAME, "poem-image")
        visible_imgs = [img for img in popup_images if img.is_displayed()]
        if visible_imgs:
            visible_imgs[0].click()
            time.sleep(1)
            lightbox = driver.find_element(By.ID, "lightbox")
            print(f"Lightbox displayed: {lightbox.is_displayed()}")
            driver.save_screenshot("/Users/paul/deeplooking/outputs/test_lightbox_click.png")
            # Click to dismiss
            lightbox.click()
            time.sleep(0.5)
            print(f"Lightbox after dismiss: {lightbox.is_displayed()}")

    # Back to gallery
    driver.find_element(By.ID, "back-btn").click()
    time.sleep(1)
    popups = driver.find_elements(By.CSS_SELECTOR, ".popup.pinned")
    print(f"After back: {len(popups)} popup(s)")

    print("\nAll multi-popup tests passed!")

except Exception as e:
    print(f"ERROR: {e}")
    driver.save_screenshot("/Users/paul/deeplooking/outputs/test_multi_error.png")
    raise
finally:
    driver.quit()
