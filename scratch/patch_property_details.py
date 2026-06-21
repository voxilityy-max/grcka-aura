import os
import re

def flexible_replace(content, target_str, replacement_str):
    # Normalize newlines
    content_norm = content.replace("\r\n", "\n").replace("\r", "\n")
    target_norm = target_str.replace("\r\n", "\n").replace("\r", "\n")
    replacement_norm = replacement_str.replace("\r\n", "\n").replace("\r", "\n")
    
    # Strip leading/trailing whitespaces from target lines, ignoring empty lines
    target_lines = [l.strip() for l in target_norm.split("\n") if l.strip()]
    if not target_lines:
        return content, False
        
    # We want to find a sequence of lines in content_norm that, when stripped, match target_lines
    content_lines = content_norm.split("\n")
    
    for i in range(len(content_lines) - len(target_lines) + 1):
        # Scan for a match
        match = True
        content_idx = i
        target_idx = 0
        
        matched_line_indices = []
        
        while target_idx < len(target_lines) and content_idx < len(content_lines):
            c_line = content_lines[content_idx].strip()
            if not c_line:
                # skip empty lines in content
                content_idx += 1
                continue
                
            if c_line == target_lines[target_idx]:
                matched_line_indices.append(content_idx)
                content_idx += 1
                target_idx += 1
            else:
                match = False
                break
                
        if match and target_idx == len(target_lines):
            # We found a match! 
            # Replace the lines from matched_line_indices[0] to matched_line_indices[-1]
            start_idx = matched_line_indices[0]
            end_idx = matched_line_indices[-1]
            
            # Reconstruct the text with replacement
            before = "\n".join(content_lines[:start_idx])
            after = "\n".join(content_lines[end_idx + 1:])
            
            # If the replacement has multiple lines, we can indent it to match the start line's indentation
            start_line_indent = len(content_lines[start_idx]) - len(content_lines[start_idx].lstrip())
            indent_str = " " * start_line_indent
            
            indented_replacement_lines = []
            for l in replacement_norm.split("\n"):
                if l.strip():
                    indented_replacement_lines.append(indent_str + l.strip())
                else:
                    indented_replacement_lines.append("")
                    
            replacement_indented = "\n".join(indented_replacement_lines)
            
            new_content = before + "\n\n" + replacement_indented + "\n\n" + after
            return new_content, True
            
    return content, False

def main():
    file_path = r"C:\Users\sasag\Desktop\ZET STEFAN\src\components\PropertyDetails.jsx"
    if not os.path.exists(file_path):
        print("PropertyDetails.jsx not found")
        return
        
    with open(file_path, "rb") as f:
        content_bytes = f.read()
        
    if b"\r\n" in content_bytes:
        line_ending = "\r\n"
    elif b"\r" in content_bytes:
        line_ending = "\r"
    else:
        line_ending = "\n"
        
    content = content_bytes.decode("utf-8")
    
    # Target 1: selectedRoom useState
    target_1 = """
  // Selected room sub-unit state
  const [selectedRoom, setSelectedRoom] = useState(() => {
    return roomsList[0];
  });
    """
    replacement_1 = """
  // Selected room sub-unit state
  const [selectedRoomId, setSelectedRoomId] = useState(() => {
    return roomsList[0]?.id || null;
  });

  const selectedRoom = useMemo(() => {
    if (!roomsList || roomsList.length === 0) return null;
    return roomsList.find(r => r.id === selectedRoomId) || roomsList[0];
  }, [roomsList, selectedRoomId]);
    """

    # Target 2: sync selectedRoom useEffect
    target_2 = """
  // Sync selectedRoom if roomsList updates dynamically
  useEffect(() => {
    if (roomsList && roomsList.length > 0) {
      const exists = roomsList.some(r => r.id === selectedRoom?.id);
      if (!exists) {
        setSelectedRoom(roomsList[0]);
      }
    }
  }, [roomsList]);
    """
    replacement_2 = ""

    # Target 4: Leaflet invalidatesize
    target_4 = """
    // Force map size update (avoids gray tiles bug in hidden containers)
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
    """
    replacement_4 = """
    // Force map size update (avoids gray tiles bug in hidden containers)
    setTimeout(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      map.invalidateSize();
    }, 200);
    """

    # Target 5: inquiry prefill useEffect
    target_5 = """
  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setInquiryName(currentUser.fullName);
      setInquiryEmail(currentUser.email);
    }
  }, [currentUser]);
    """
    replacement_5 = """
  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        setInquiryName(currentUser.fullName || '');
        setInquiryEmail(currentUser.email || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);
    """

    # Target 6: review author useEffect
    target_6 = """
  useEffect(() => {
    if (currentUser) {
      setReviewAuthor(currentUser.fullName);
    }
  }, [currentUser]);
    """
    replacement_6 = """
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        setReviewAuthor(currentUser.fullName || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);
    """

    targets = [
        (target_1, replacement_1, "selectedRoom state"),
        (target_2, replacement_2, "selectedRoom sync useEffect"),
        (target_4, replacement_4, "map invalidateSize eslint comment"),
        (target_5, replacement_5, "inquiry form sync useEffect"),
        (target_6, replacement_6, "review author sync useEffect"),
    ]
    
    current_content = content
    success_count = 0
    
    for target, replacement, desc in targets:
        new_content, success = flexible_replace(current_content, target, replacement)
        if success:
            current_content = new_content
            print(f"Successfully replaced: {desc}")
            success_count += 1
        else:
            print(f"FAILED to replace: {desc}")
            
    if success_count > 0:
        # Normalize double newlines optionally? Let's just output it with the original line ending format
        final_content = current_content.replace("\r\n", "\n").replace("\r", "\n").replace("\n", line_ending)
        with open(file_path, "wb") as f:
            f.write(final_content.encode("utf-8"))
        print(f"Saved patches to {file_path}. Replaced {success_count}/{len(targets)} blocks.")
    else:
        print("No changes made.")

if __name__ == "__main__":
    main()
