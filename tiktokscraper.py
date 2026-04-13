from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException, JavascriptException
import time
import json
import re
from datetime import datetime

def initialize_driver():
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36")
    options.add_argument("--lang=de-DE")
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_argument("--start-maximized")
    try:
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        print("WebDriver initialized successfully.")
        return driver
    except Exception as e:
        print(f"Error initializing WebDriver: {e}")
        return None

def get_comment_elements_count(driver, selector):
    try:
        return len(driver.find_elements(By.CSS_SELECTOR, selector))
    except:
        return 0

def scroll_to_bottom_and_load_comments(driver, comment_item_base_selector, max_scroll_attempts=40, scroll_pause_time=3.5, no_new_comments_threshold=4):
    print(f"Scrolling to load comments (pause: {scroll_pause_time}s, max_attempts: {max_scroll_attempts}, threshold: {no_new_comments_threshold})...")
    last_height = driver.execute_script("return document.documentElement.scrollHeight")
    consecutive_scrolls_with_no_new_comments = 0
    previous_comment_count = get_comment_elements_count(driver, comment_item_base_selector)
    print(f"Initial comments visible: {previous_comment_count}")

    for scroll_attempt in range(max_scroll_attempts):
        driver.execute_script("window.scrollTo(0, document.documentElement.scrollHeight);")
        time.sleep(scroll_pause_time)

        current_comment_count = get_comment_elements_count(driver, comment_item_base_selector)
        new_height = driver.execute_script("return document.documentElement.scrollHeight")
        
        print(f"Scroll {scroll_attempt + 1}: Height: {last_height} -> {new_height}, Comments: {previous_comment_count} -> {current_comment_count}")

        if current_comment_count > previous_comment_count or new_height > last_height:
            consecutive_scrolls_with_no_new_comments = 0
        else:
            consecutive_scrolls_with_no_new_comments += 1
            print(f"No new comments or height change. Consecutive attempts: {consecutive_scrolls_with_no_new_comments}")

        if consecutive_scrolls_with_no_new_comments >= no_new_comments_threshold:
            print(f"No new comments loaded for {no_new_comments_threshold} consecutive scrolls. Assuming end of comments.")
            break
        
        last_height = new_height
        previous_comment_count = current_comment_count
    print("Finished scrolling attempts for comments.")


def handle_cookie_banner(driver):
    print("Attempting to handle cookie banner...")
    try:
        accept_button_xpath = "//button[normalize-space()='Alle erlauben']"
        cookie_accept_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, accept_button_xpath))
        )
        print("Cookie 'Alle erlauben' button found.")
        driver.execute_script("arguments[0].click();", cookie_accept_button)
        print("Clicked cookie accept button.")
        time.sleep(2)
        return True
    except Exception as e_click:
        print(f"Could not click cookie button: {e_click}. Trying JS removal.")
        try:
            script = """
            var banner = document.querySelector('tiktok-cookie-banner');
            if (banner) { banner.remove(); return true; }
            var genericBanner = document.querySelector('div[data-testid="cookie-banner"], div[class*="cookie-banner"], div[id*="cookie-banner"]');
            if (genericBanner) { genericBanner.remove(); return true; }
            return false;
            """
            removed = driver.execute_script(script)
            if removed:
                print("Successfully removed a cookie banner element via JavaScript.")
                time.sleep(1)
                return True
            else:
                print("Could not find cookie banner to remove via JavaScript.")
        except Exception as e_js:
            print(f"Error removing cookie banner via JS: {e_js}")
    return False

def extract_video_data(driver, video_url, manual_intervention_time=25):
    video_data = {
        "url": video_url,
        "scraping_datetime_utc": datetime.utcnow().isoformat() + "Z"
    }
    print(f"Attempting to navigate to: {video_url}")

    try:
        driver.get(video_url)
        print("Page opened. Attempting to handle initial overlays...")
        handle_cookie_banner(driver) # Attempt cookie banner regardless

        if manual_intervention_time > 0:
            print(f"--- MANUAL INTERVENTION REQUIRED for CAPTCHA etc. ({manual_intervention_time}s) ---")
            for i in range(manual_intervention_time, 0, -1):
                print(f"Resuming in {i}s...", end='\r', flush=True)
                time.sleep(1)
            print("\nResuming automated scraping...")
        
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-e2e="browse-video-desc"]'))
        )
        print("Page seems ready.")
    except Exception as e:
        print(f"Error during initial page load: {e}")
        return None

    # Attempt to pause the video
    try:
        print("Attempting to pause video...")
        video_player_clickable_area = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 
                'div[data-e2e="detail-video"] video, div.css-yf3ohr-DivContainer video, video[class*="xgplayer-video"]'
            ))
        )
        driver.execute_script("arguments[0].click();", video_player_clickable_area)
        print("Video pause/play toggle attempted.")
        time.sleep(0.5) # Short pause after click
    except Exception as e:
        print(f"Could not find/click video player for pause/play: {e}")

    # --- Extract Video Metadata ---
    print("Extracting video metadata...")
    # ... (metadata extraction logic - keep as is, it seems to be working for the main fields)
    try:
        video_data['author_username'] = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'span[data-e2e="browse-username"]'))
        ).text
        video_data['author_nickname'] = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'span[data-e2e="browser-nickname"]'))
        ).text.split("·")[0].strip()
    except Exception as e:
        print(f"Error extracting author: {e}")
        video_data['author_username'] = "N/A"
        video_data['author_nickname'] = "N/A"

    try:
        desc_container_selector = 'div[data-e2e="browse-video-desc"]'
        desc_container = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, desc_container_selector))
        )
        try:
            more_button_xpath = f"{desc_container_selector}//button[normalize-space()='mehr' or normalize-space()='more']"
            more_button = WebDriverWait(desc_container, 3).until(
                EC.element_to_be_clickable((By.XPATH, more_button_xpath))
            )
            driver.execute_script("arguments[0].click();", more_button)
            print("Clicked 'more' button for description.")
            time.sleep(0.5) 
        except TimeoutException:
            print("'more' button for description not found or not clickable.")
        except Exception as e_mehr:
            print(f"Error clicking 'more' button: {e_mehr}")
        
        desc_text_raw = desc_container.text
        try:
            button_text_to_remove_element = desc_container.find_element(By.XPATH, ".//button[normalize-space()='mehr' or normalize-space()='more']")
            button_text = button_text_to_remove_element.text
            if button_text:
                desc_text_raw = desc_text_raw.replace(button_text, "")
        except: pass
        video_data['description'] = " ".join(desc_text_raw.split()).strip()
    except Exception as e:
        print(f"Error extracting description: {e}")
        video_data['description'] = "N/A"

    try:
        video_data['music_title'] = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'h4[data-e2e="browse-music"] a'))
        ).text
    except Exception as e:
        print(f"Error extracting music title: {e}")
        video_data['music_title'] = "N/A"

    try:
        video_data['like_count'] = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'strong[data-e2e="like-count"]'))
        ).text
        video_data['comment_count_meta'] = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'strong[data-e2e="comment-count"]'))
        ).text
        video_data['share_count'] = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'strong[data-e2e="share-count"]'))
        ).text
    except Exception as e:
        print(f"Error extracting like/comment/share counts: {e}")
        video_data['like_count'] = "N/A"
        video_data['comment_count_meta'] = "N/A"
        video_data['share_count'] = "N/A"

    try:
        author_info_span_selector = 'span.css-1kcycbd-SpanOtherInfos.evv7pft3'
        date_text_raw = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, author_info_span_selector))
        ).text
        match = re.search(r'·\s*([\d\w.-]+(?: \d{4})?)$', date_text_raw)
        if match:
            video_data['upload_date_relative'] = match.group(1).strip()
        else: 
            parts = date_text_raw.split('·') 
            if len(parts) > 1: video_data['upload_date_relative'] = parts[-1].strip()
            else: video_data['upload_date_relative'] = "N/A"
    except Exception as e:
        print(f"Error extracting upload date: {e}")
        video_data['upload_date_relative'] = "N/A"
    print(f"Initial metadata: {video_data}")


    # --- Determine Comment Item Selector for Scrolling ---
    comment_list_container_selector = 'div.css-7whb78-DivCommentListContainer' # Main comments container
    potential_comment_item_selectors = [
        f'{comment_list_container_selector} div.css-1gstnae-DivCommentItemWrapper', # From new HTML (content part)
        f'{comment_list_container_selector} div[data-e2e="comment-item"]', # Common e2e attribute
        f'{comment_list_container_selector} div.css-13wx63w-DivCommentObjectWrapper', # Outer comment object
    ]
    active_comment_item_selector = None
    # Wait for the comment list container itself to be present before checking for items
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, comment_list_container_selector)))
        for sel_test in potential_comment_item_selectors:
            if get_comment_elements_count(driver, sel_test) > 0:
                active_comment_item_selector = sel_test
                print(f"Using comment item selector for scrolling and extraction: {active_comment_item_selector}")
                break
        if not active_comment_item_selector: # Default if none found any items initially
            active_comment_item_selector = potential_comment_item_selectors[-1] # Use the most generic if specific ones fail
            print(f"Warning: No specific comment item selector confirmed initial items. Using default for scrolling: {active_comment_item_selector}")
    except TimeoutException:
        print("Comment list container not found. Skipping comment extraction.")
        video_data['comments'] = []
        video_data['comment_count_scraped'] = 0
        return video_data
        
    # --- Scroll to load comments ---
    scroll_to_bottom_and_load_comments(driver, active_comment_item_selector)

    # --- Extract Comments ---
    print("Extracting all loaded comments...")
    comments_data = []
    try:
        comment_elements = driver.find_elements(By.CSS_SELECTOR, active_comment_item_selector)
        print(f"Found {len(comment_elements)} comment elements using selector '{active_comment_item_selector}' for final extraction.")

        for i, comment_el_wrapper in enumerate(comment_elements):
            # If active_comment_item_selector is the outer wrapper, we might need to find the content part
            comment_el = comment_el_wrapper
            if "DivCommentObjectWrapper" in active_comment_item_selector:
                try:
                    comment_el = comment_el_wrapper.find_element(By.CSS_SELECTOR, 'div.css-1gstnae-DivCommentItemWrapper')
                except NoSuchElementException:
                    print(f"Skipping comment object at index {i} as inner content wrapper not found.")
                    continue
            
            comment_author, comment_text, comment_date, comment_likes = "N/A", "N/A", "N/A", "0"
            
            # Author
            try:
                author_el = comment_el.find_element(By.CSS_SELECTOR, 'div[data-e2e="comment-username-1"] p.TUXText, span[data-e2e="comment-username-1"]')
                comment_author = author_el.text.strip()
            except NoSuchElementException:
                try: # Fallback for author if data-e2e is not present
                    author_el = comment_el.find_element(By.CSS_SELECTOR, 'a[href*="/@"] p[class*="Text"]') # More generic
                    comment_author = author_el.text.strip()
                except: pass
            
            # Text
            try:
                text_el = comment_el.find_element(By.CSS_SELECTOR, 'span[data-e2e="comment-level-1"] p.TUXText, p[data-e2e="comment-level-1"]')
                comment_text = text_el.text.strip()
            except: pass

            # Date and Likes (often in a sub-container)
            try: 
                # Look for the sub-content wrapper that contains date and likes
                sub_content_wrapper = comment_el.find_element(By.CSS_SELECTOR, 
                    'div.css-1ivw6bb-DivCommentSubContentSplitWrapper, div[data-e2e="comment-subtitle"]') # New HTML or data-e2e
                
                # Date is usually the first span in its direct child (css-1lglotn-DivCommentSubContentWrapper)
                try:
                    date_container = sub_content_wrapper.find_element(By.CSS_SELECTOR, 'div.css-1lglotn-DivCommentSubContentWrapper')
                    date_el = date_container.find_element(By.CSS_SELECTOR, 'span.TUXText:first-child')
                    comment_date = date_el.text.strip()
                except NoSuchElementException: # Fallback if specific date container not found
                     date_el = sub_content_wrapper.find_element(By.CSS_SELECTOR, 'span.TUXText:first-child') # More direct if structure is flatter
                     comment_date = date_el.text.strip()


                # Likes
                try:
                    # From new HTML: div.css-1nd5cw-DivLikeContainer > span.TUXText
                    like_container = sub_content_wrapper.find_element(By.CSS_SELECTOR, 'div.css-1nd5cw-DivLikeContainer.edeod5e0, div[data-e2e="comment-like-icon"]')
                    like_el = like_container.find_element(By.CSS_SELECTOR, 'span.TUXText')
                    comment_likes = like_el.text.strip()
                    if not comment_likes.isdigit(): # If it's "Like", try aria-label
                        aria_label_likes = like_container.get_attribute('aria-label')
                        if aria_label_likes:
                            match_likes = re.search(r'(\d[\d,.]*K?M?)\s*Likes', aria_label_likes, re.IGNORECASE)
                            if match_likes:
                                comment_likes = match_likes.group(1)
                            else: comment_likes = "0" # Fallback if regex fails
                        else: comment_likes = "0"
                except:
                    comment_likes = "0" # Default if specific like structure not found
            except:
                comment_date = "N/A" # Ensure these are reset if sub_content_wrapper fails
                comment_likes = "0"

            if comment_author != "N/A" or comment_text != "N/A":
                comments_data.append({
                    "author": comment_author,
                    "text": comment_text,
                    "date_relative": comment_date,
                    "likes": comment_likes
                })
            # else:
            # print(f"Debug: Author: {comment_author}, Text: {comment_text}, Date: {comment_date}, Likes: {comment_likes}")


    except Exception as e:
        print(f"General error during final comment extraction: {e}")
        import traceback
        traceback.print_exc()


    video_data['comments'] = comments_data
    video_data['comment_count_scraped'] = len(comments_data)
    print(f"Finished extracting. Total comments scraped: {len(comments_data)}")
    return video_data

def save_data_to_json(data, filename="tiktok_video_data.json"):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Data successfully saved to {filename}")
    except Exception as e:
        print(f"Error saving data to JSON: {e}")

# --- Main Execution ---
if __name__ == "__main__":
    # Test with the video URL from the new HTML snippet first
    # tiktok_video_url = "https://www.tiktok.com/@majena/video/7502437578294037782?is_from_webapp=1" 
    tiktok_video_url = "https://www.tiktok.com/@teamtordi/video/7500353799500926230?is_from_webapp=1" # Original video
    
    MANUAL_INTERVENTION_TIME = 25

    driver = initialize_driver()

    if driver:
        scraped_data = extract_video_data(driver, tiktok_video_url, manual_intervention_time=MANUAL_INTERVENTION_TIME)
        
        if scraped_data:
            video_id = tiktok_video_url.split('/')[-1].split('?')[0]
            output_filename = f"tiktok_data_{video_id}.json"
            save_data_to_json(scraped_data, output_filename)
        else:
            print("No data was scraped.")

        print("Closing WebDriver.")
        driver.quit()
    else:
        print("WebDriver could not be initialized. Exiting.")