"""Test popup width for Cotán image only."""
import time
from selenium import webdriver
from selenium.webdriver.common.by import By

BASE_URL = "http://localhost:8000/index.html"
OUTPUT_DIR = "/Users/paul/deeplooking/outputs"

driver = webdriver.Chrome()
driver.set_window_size(1400, 900)

def click_artwork_at(artwork, fx, fy):
    driver.execute_script("""
        var el = arguments[0];
        var rect = el.getBoundingClientRect();
        var x = rect.left + rect.width * arguments[1];
        var y = rect.top + rect.height * arguments[2];
        el.dispatchEvent(new MouseEvent('click', {clientX: x, clientY: y, bubbles: true}));
    """, artwork, fx, fy)

try:
    driver.get(BASE_URL)
    time.sleep(2)

    # Click Cotán (5th item, index 4)
    items = driver.find_elements(By.CSS_SELECTOR, ".gallery-item")
    items[4].click()
    time.sleep(2)

    artwork = driver.find_element(By.ID, "artwork")

    for fx, fy in [(0.5, 0.5), (0.3, 0.3), (0.2, 0.8), (0.7, 0.2), (0.8, 0.7), (0.5, 0.2)]:
        click_artwork_at(artwork, fx, fy)
        time.sleep(0.8)
        popups = driver.find_elements(By.CSS_SELECTOR, ".popup.visible")
        if popups:
            popup = popups[0]
            tabs = popup.find_elements(By.CSS_SELECTOR, ".lens-tab")
            tab_labels = [t.text for t in tabs]
            tabs_container = popup.find_element(By.CSS_SELECTOR, ".lens-tabs")
            scroll_w = driver.execute_script("return arguments[0].scrollWidth", tabs_container)
            client_w = driver.execute_script("return arguments[0].clientWidth", tabs_container)
            overflow = scroll_w > client_w
            print(f"Popup width: {popup.size['width']}px")
            print(f"Tabs: {tab_labels}")
            print(f"Tabs scrollWidth={scroll_w}, clientWidth={client_w}, overflow={overflow}")
            if overflow:
                print(f"FAIL: tabs overflow by {scroll_w - client_w}px")
            else:
                print(f"PASS: tabs fit")
            driver.save_screenshot(f"{OUTPUT_DIR}/test_popup_width_cotan.png")
            break
    else:
        print("Could not trigger popup")

finally:
    driver.quit()
