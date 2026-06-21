import os

def main():
    file_path = r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\ForumSection.jsx"
    if not os.path.exists(file_path):
        print("ForumSection.jsx not found")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # We want to replace everything from the start up to the declaration of INITIAL_FORUM_POSTS with import statements
    # Let's find where INITIAL_FORUM_POSTS array ends: it ends with '];'
    # Actually, we can just look for export const INITIAL_FORUM_POSTS = [ ... ]; and replace it
    
    # Let's find "const GREEK_TOWNS = "
    greek_towns_idx = content.find("const GREEK_TOWNS =")
    if greek_towns_idx == -1:
        print("Could not find GREEK_TOWNS")
        return
        
    # Everything after greek_towns_idx is kept
    rest_of_code = content[greek_towns_idx:]
    
    new_header = """import { useState } from 'react';
import { INITIAL_FORUM_POSTS } from './forumPostsData';

"""
    
    final_code = new_header + rest_of_code
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(final_code)
    print("Patched ForumSection.jsx successfully!")

if __name__ == "__main__":
    main()
