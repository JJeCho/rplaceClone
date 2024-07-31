import React, { useState } from 'react';
import Picker from 'emoji-picker-react';

const EmojiPickerComponent = ({ onSelect }) => {
  const handleEmojiClick = (event, emojiObject) => {
    onSelect(emojiObject.emoji);
  };

  return (
    <div>
        <Picker onEmojiClick={handleEmojiClick} />
    </div>
  );
};

export default EmojiPickerComponent;
