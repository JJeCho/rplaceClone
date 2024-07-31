import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPixels, updatePixel } from '../features/canvasSlice';
import io from 'socket.io-client';
import { SketchPicker } from 'react-color';
import Picker from 'emoji-picker-react';

const socket = io('http://localhost:3001');

const Canvas = () => {
  const dispatch = useDispatch();
  const pixels = useSelector(state => state.canvas.pixels);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [selectedChar, setSelectedChar] = useState('');
  const canvasRef = useRef(null);
  const pixelSize = 10;
  const canvasSize = 1000;

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isColorPickerMinimized, setIsColorPickerMinimized] = useState(false);

  useEffect(() => {
    dispatch(fetchPixels());
    socket.on('pixel update', (pixel) => {
      dispatch(updatePixel(pixel));
    });

    return () => {
      socket.off('pixel update');
    };
  }, [dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-offset.x, -offset.y);

    pixels.forEach(pixel => {
      if (pixel.char) {
        ctx.font = `${pixelSize * zoom}px Arial`;
        ctx.fillText(pixel.char, pixel.x * pixelSize + offset.x, pixel.y * pixelSize + offset.y + pixelSize);
      } else {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(
          pixel.x * pixelSize + offset.x,
          pixel.y * pixelSize + offset.y,
          pixelSize,
          pixelSize
        );
      }
    });

    ctx.restore();
  }, [pixels, pixelSize, offset, zoom]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left - offset.x) / (pixelSize * zoom));
    const y = Math.floor((event.clientY - rect.top - offset.y) / (pixelSize * zoom));
    const pixel = { x, y, color: currentColor, char: selectedChar };
    dispatch(updatePixel(pixel));
    socket.emit('update pixel', pixel);
  };

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      setOffset(prevOffset => ({ x: prevOffset.x + dx, y: prevOffset.y + dy }));
      setDragStart({ x: event.clientX, y: event.clientY });
    }
    setCursorPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    const scaleFactor = 0.1;
    const newZoom = zoom + (event.deltaY > 0 ? -scaleFactor : scaleFactor);
    const clampedZoom = Math.min(Math.max(newZoom, 0.1), 10);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cursorX = (event.clientX - rect.left) / zoom - offset.x;
    const cursorY = (event.clientY - rect.top) / zoom - offset.y;

    setZoom(clampedZoom);
    setOffset({
      x: offset.x - cursorX * (clampedZoom - zoom),
      y: offset.y - cursorY * (clampedZoom - zoom)
    });
  };

  const toggleColorPicker = () => {
    setIsColorPickerMinimized(!isColorPickerMinimized);
  };

  return (
    <div
      style={{ overflow: 'hidden', width: '100vw', height: '100vh', position: 'relative' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleCanvasClick}
        style={{ display: 'block' }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, backgroundColor: 'white', padding: '10px' }}>
        <button onClick={toggleColorPicker}>
          {isColorPickerMinimized ? 'Show Color Picker' : 'Hide Color Picker'}
        </button>
        {!isColorPickerMinimized && (
          <SketchPicker color={currentColor} onChangeComplete={color => setCurrentColor(color.hex)} />
        )}
      </div>
    </div>
  );
};

export default Canvas;
