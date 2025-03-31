import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const AnnotationCanvas = ({ pdfDimensions, onSaveAnnotation }) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [color, setColor] = useState('#FF0000');
  const [tool, setTool] = useState('pen');
  const [textAnnotations, setTextAnnotations] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const skiaCanvasRef = useRef(null);

  // Available colors and tools
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
  const tools = [
    { id: 'pen', icon: 'edit' },
    { id: 'highlight', icon: 'highlight' },
    { id: 'text', icon: 'text-fields' },
    { id: 'eraser', icon: 'format-clear' }
  ];

  // Create gesture handlers for drawing
  const gesture = Gesture.Pan()
    .onStart((e) => {
      if (tool === 'pen' || tool === 'highlight') {
        const newPath = Skia.Path.Make();
        newPath.moveTo(e.x, e.y);
        setCurrentPath({
          path: newPath,
          color: tool === 'highlight' ? `${color}80` : color,
          strokeWidth: tool === 'highlight' ? 15 : 3
        });
      } else if (tool === 'text') {
        setTextPosition({ x: e.x, y: e.y });
      }
    })
    .onUpdate((e) => {
      if (currentPath && (tool === 'pen' || tool === 'highlight')) {
        const updatedPath = currentPath.path.copy();
        updatedPath.lineTo(e.x, e.y);
        setCurrentPath({
          ...currentPath,
          path: updatedPath
        });
      }
    })
    .onEnd(() => {
      if (currentPath) {
        setPaths([...paths, currentPath]);
        setCurrentPath(null);
      }
    });

  // Handle text annotation
  const handleAddText = () => {
    if (textPosition && currentText.trim()) {
      setTextAnnotations([
        ...textAnnotations,
        {
          text: currentText,
          position: textPosition,
          color
        }
      ]);
      setCurrentText('');
      setTextPosition(null);
    }
  };

  // Save annotations
  const saveAnnotations = () => {
    const annotationData = {
      drawings: paths,
      texts: textAnnotations,
      createdAt: new Date().toISOString()
    };
    onSaveAnnotation(annotationData);
  };

  return (
    <View style={[styles.container, pdfDimensions]}>
      <GestureDetector gesture={gesture}>
        <Canvas style={styles.canvas} ref={skiaCanvasRef}>
          {paths.map((p, index) => (
            <Path
              key={index}
              path={p.path}
              color={p.color}
              style="stroke"
              strokeWidth={p.strokeWidth}
            />
          ))}
          {currentPath && (
            <Path
              path={currentPath.path}
              color={currentPath.color}
              style="stroke"
              strokeWidth={currentPath.strokeWidth}
            />
          )}
        </Canvas>
      </GestureDetector>

      {textPosition && (
        <View style={[styles.textInputContainer, { left: textPosition.x, top: textPosition.y }]}>
          <TextInput
            style={[styles.textInput, { color }]}
            autoFocus
            value={currentText}
            onChangeText={setCurrentText}
            onSubmitEditing={handleAddText}
            placeholder="Enter annotation text"
          />
        </View>
      )}

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.toolGroup}>
          {tools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.toolButton, tool === t.id && styles.activeTool]}
              onPress={() => setTool(t.id)}
            >
              <Icon name={t.icon} size={24} color={tool === t.id ? '#6200ee' : '#333'} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.colorPalette}>
          {colors.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorButton, { backgroundColor: c }, color === c && styles.activeColor]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveAnnotations}>
          <Icon name="save" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10
  },
  canvas: {
    flex: 1
  },
  toolbar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  toolGroup: {
    flexDirection: 'row',
    gap: 10
  },
  toolButton: {
    padding: 8,
    borderRadius: 20
  },
  activeTool: {
    backgroundColor: '#e6e0f8'
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  activeColor: {
    borderWidth: 2,
    borderColor: '#fff',
    transform: [{ scale: 1.2 }]
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 8,
    borderRadius: 20
  },
  textInputContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  textInput: {
    minWidth: 100,
    padding: 5,
    fontSize: 14
  }
});

export default AnnotationCanvas;