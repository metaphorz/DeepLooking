"""Verify Experimental Publishing gallery: Sally's 4 whole-image tabs and photo credits."""
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

OUT = "outputs/experimental_publishing"
os.makedirs(OUT, exist_ok=True)

driver = webdriver.Chrome()
driver.set_window_size(1400, 1000)
log = []


def note(msg):
    print(msg)
    log.append(msg)


def select_gallery():
    sel = Select(driver.find_element(By.ID, "gallery-select"))
    for o in sel.options:
        if "Experimental Publishing" in o.text:
            sel.select_by_visible_text(o.text)
            break
    time.sleep(2)


try:
    driver.get("http://localhost:8000/index.html")
    time.sleep(2)
    select_gallery()
    driver.save_screenshot(f"{OUT}/01_gallery.png")

    items = driver.find_elements(By.CSS_SELECTOR, ".gallery-item")
    note("Gallery items: "
         + str([i.find_element(By.CSS_SELECTOR, ".item-title").text for i in items]))

    def open_item(title_substr, shot):
        for it in driver.find_elements(By.CSS_SELECTOR, ".gallery-item"):
            if title_substr.lower() in it.find_element(By.CSS_SELECTOR, ".item-title").text.lower():
                it.click()
                time.sleep(2)
                credit = driver.find_element(By.ID, "image-credit").text
                note(f"  {title_substr}: credit = '{credit}'")
                driver.save_screenshot(f"{OUT}/{shot}")
                driver.find_element(By.ID, "back-btn").click()
                time.sleep(1.5)
                select_gallery()
                return credit
        note(f"  {title_substr}: NOT FOUND")
        return None

    open_item("Paul Monaco", "02_paul.png")
    open_item("Fatima", "03_fatima.png")

    # Sally: open viewer, check whole-image lens tabs
    for it in driver.find_elements(By.CSS_SELECTOR, ".gallery-item"):
        if "saigon" in it.find_element(By.CSS_SELECTOR, ".item-title").text.lower():
            it.click()
            time.sleep(2)
            note(f"  Sally: credit = '{driver.find_element(By.ID, 'image-credit').text}'")
            driver.save_screenshot(f"{OUT}/04_sally_viewer.png")
            driver.find_element(By.ID, "image-lens-btn").click()
            time.sleep(2)
            tabs = [t.text for t in driver.find_elements(
                By.CSS_SELECTOR, ".lens-tab, .tab, .popup-tab, .tabs button, .tab-btn")]
            note(f"  Sally whole-image tabs: {tabs}")
            driver.save_screenshot(f"{OUT}/05_sally_tabs.png")
            break

    note("DONE")
finally:
    with open(f"{OUT}/test.log", "w") as f:
        f.write("\n".join(log))
    driver.quit()
