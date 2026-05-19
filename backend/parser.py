import re
from pypdf import PdfReader
from io import BytesIO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_questions_from_pdf(pdf_content):
    logger.info("Processing PDF content...")
    reader = PdfReader(BytesIO(pdf_content))
    full_text = ""
    for i, page in enumerate(reader.pages):
        try:
            # Attempt layout extraction if possible
            page_text = page.extract_text() or ""
        except Exception as e:
            logger.error(f"Error extracting text from page {i+1}: {str(e)}")
            page_text = ""
        logger.debug(f"Page {i+1} extracted {len(page_text)} chars")
        full_text += page_text + "\n"

    logger.info(f"Total extracted text length: {len(full_text)}")
    
    # 1. Broad Cleaning
    clean_text = full_text
    clean_text = re.sub(r"Este documento fue descargado por.*", "", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"Su distribución no está permitida.*", "", clean_text, flags=re.IGNORECASE)
    clean_text = re.sub(r"ucacademy\.com", "", clean_text)
    clean_text = re.sub(r"Ignacio López", "", clean_text)
    
    # 2. Extract Answer Table (Smart LAST-MATCH Search)
    answer_keys = {}
    main_text = clean_text
    
    # Markers for the answer section
    markers = list(re.finditer(r"(?:TABLA DE RESPUESTAS|SOLUCIONES|RESPUESTAS|CLAVE DE RESPUESTAS)", clean_text, re.IGNORECASE))
    
    best_marker = None
    if markers:
        # Search from the end to find the REAL table
        for m in reversed(markers):
            # Check if this marker is followed by a density of answer pairs
            section = clean_text[m.start():m.start()+15000]
            # Pattern: Number (dot/space) Letter (space/newline/parenthesis) and capture Explanation
            keys = re.findall(r"(?:[•\-*]\s*)?(\d+)[\s.]*([a-d])(?:[\s.\-)]*)(.*?)(?=(?:^|\n)\s*(?:[•\-*]\s*)?\d+[\s.]*[a-d]|\Z)", section, re.IGNORECASE | re.DOTALL)
            
            if len(keys) > 5:
                logger.info(f"Confirmed real answer table at pos {m.start()} with {len(keys)} keys.")
                best_marker = m
                for num, letter, explanation in keys:
                    answer_keys[int(num)] = {
                        "letter": letter.upper(),
                        "explanation": explanation.strip()
                    }
                break
    
    if best_marker:
        # Truncate main text BEFORE the table
        main_text = clean_text[:best_marker.start()]
    else:
        logger.info("No valid answer table found with density check. Using full text.")

    # Save debug text
    with open("./data/debug_text.txt", "w") as f:
        f.write(full_text)

    # 3. Robust Question Splitting
    # We find ALL "Digit." patterns 
    potentials = list(re.finditer(r"(?:^|\n)\s*(\d+)[\.\-\)]+\s*", main_text))
    logger.info(f"Found {len(potentials)} potential question markers.")
    
    questions = []
    for i in range(len(potentials)):
        m = potentials[i]
        try:
            q_num = int(m.group(1))
        except: continue
        
        # Determine end of this question block
        end_pos = potentials[i+1].start() if i+1 < len(potentials) else len(main_text)
        q_block = main_text[m.end():end_pos].strip()
        
        # Clean block (remove stray newlines)
        q_block_clean = re.sub(r"\s+", " ", q_block)
        
        # 4. Extract Question and Options
        # Options are usually: a) ... b) ...
        # We split by " [letter]) "
        opt_matches = list(re.finditer(r"(?:^|\s)([a-d])[\.\-\)]+\s*", q_block, re.IGNORECASE))
        
        if len(opt_matches) >= 2:
            # Text before the first option
            q_text = q_block[:opt_matches[0].start()].strip()
            q_text = re.sub(r"\s+", " ", q_text)
            
            options = {}
            for j in range(len(opt_matches)):
                letter = opt_matches[j].group(1).upper()
                o_start = opt_matches[j].end()
                o_end = opt_matches[j+1].start() if j+1 < len(opt_matches) else len(q_block)
                text = q_block[o_start:o_end].strip()
                options[letter] = re.sub(r"\s+", " ", text)
            
            if options:
                ans_data = answer_keys.get(q_num, {"letter": "A", "explanation": ""})
                questions.append({
                    "number": q_num,
                    "text": q_text,
                    "options": options,
                    "correct_answer": ans_data["letter"],
                    "explanation": ans_data["explanation"]
                })
        else:
            logger.debug(f"Skipping marker {q_num} - options not found.")

    logger.info(f"Successfully extracted {len(questions)} verified questions.")
    return questions
